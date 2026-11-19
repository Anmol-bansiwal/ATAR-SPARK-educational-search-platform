// src/app/api/chat/route.ts
import { getBackendBaseUrl } from '@/config/api';

/** Allow enough time for a cold backend/LLM response before the first SSE byte. */
const BACKEND_FIRST_BYTE_MS = 120_000;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // Empty body fallback
  }

  const backendBaseUrl = getBackendBaseUrl();

  try {
    const controller = new AbortController();
    const connectionTimeout = setTimeout(() => controller.abort(), BACKEND_FIRST_BYTE_MS);

    if (req.signal) {
      req.signal.addEventListener('abort', () => controller.abort());
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // Required when backend is accessed via an ngrok tunnel
      'ngrok-skip-browser-warning': 'true',
    };

    // Forward browser's private X-Chat-Key header to backend for saved chats (§8.7)
    const chatKey = req.headers.get('x-chat-key');
    if (chatKey) {
      headers['X-Chat-Key'] = chatKey;
    }

    const internalSecret = process.env.API_SECRET_KEY || process.env.BACKEND_API_KEY;
    if (internalSecret) {
      headers['authorization'] = `Bearer ${internalSecret}`;
    }

    const backendResponse = await fetch(`${backendBaseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(connectionTimeout);

    const requestId = backendResponse.headers.get('x-request-id');

    if (backendResponse.ok && backendResponse.body) {
      const responseHeaders: Record<string, string> = {
        'Content-Type':
          backendResponse.headers.get('Content-Type') ||
          'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'x-vercel-ai-ui-message-stream':
          backendResponse.headers.get('x-vercel-ai-ui-message-stream') || 'v1',
      };
      if (requestId) {
        responseHeaders['X-Request-Id'] = requestId;
        responseHeaders['Access-Control-Expose-Headers'] = 'X-Request-Id';
      }

      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    }

    // Rate limits (handle 429) - show friendly cooldown message
    if (backendResponse.status === 429) {
      console.warn(`[api/chat] Rate limited (429) from backend. Request-ID: ${requestId || 'N/A'}`);
      const errHeaders: Record<string, string> = {};
      if (requestId) {
        errHeaders['X-Request-Id'] = requestId;
        errHeaders['Access-Control-Expose-Headers'] = 'X-Request-Id';
      }
      return Response.json(
        { error: 'Please wait a moment and try again.', requestId },
        { status: 429, headers: errHeaders }
      );
    }

    // Preserve backend structured error responses ({ error: "...", issues: [...] }) per FRONTEND_API.md §8.4
    const contentType = backendResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errJson = await backendResponse.json().catch(() => null);
      if (errJson && typeof errJson === 'object') {
        console.error(
          `[api/chat] Backend ${backendResponse.status} from ${backendBaseUrl}/api/chat (Request-ID: ${requestId || 'N/A'})`,
          errJson
        );
        const errHeaders: Record<string, string> = {};
        if (requestId) {
          errHeaders['X-Request-Id'] = requestId;
          errHeaders['Access-Control-Expose-Headers'] = 'X-Request-Id';
        }
        return Response.json(
          { ...errJson, ...(requestId ? { requestId } : {}) },
          { status: backendResponse.status, headers: errHeaders }
        );
      }
    }

    const errText = await backendResponse.text().catch(() => '');
    console.error(
      `[api/chat] Backend ${backendResponse.status} from ${backendBaseUrl}/api/chat (Request-ID: ${requestId || 'N/A'}): ${errText.slice(0, 500)}`
    );
    const errHeaders: Record<string, string> = {};
    if (requestId) {
      errHeaders['X-Request-Id'] = requestId;
      errHeaders['Access-Control-Expose-Headers'] = 'X-Request-Id';
    }
    return Response.json(
      {
        error:
          backendResponse.status === 400
            ? 'Invalid question query or filter format.'
            : 'The AI assistant encountered an issue while generating a response. Please try again.',
        ...(requestId ? { requestId } : {}),
      },
      { status: backendResponse.status >= 400 ? backendResponse.status : 502, headers: errHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.error(`[api/chat] Unable to reach ${backendBaseUrl}/api/chat: ${message}`);
    return Response.json(
      {
        error: isTimeout
          ? 'The educational assistant took too long to respond. Please try again.'
          : 'Unable to connect to the educational assistant backend. Please try again shortly.',
      },
      { status: isTimeout ? 504 : 503 }
    );
  }
}
