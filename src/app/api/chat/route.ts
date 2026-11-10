// src/app/api/chat/route.ts

/** Backend verifies the full answer before the first SSE byte — allow ≥45s (buffer set to 60s). */
const BACKEND_FIRST_BYTE_MS = 60_000;

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // Empty body fallback
  }

  const backendBaseUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  )
    .trim()
    .replace(/\/+$/, '');

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

    if (backendResponse.ok && backendResponse.body) {
      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: {
          'Content-Type':
            backendResponse.headers.get('Content-Type') ||
            'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'x-vercel-ai-ui-message-stream':
            backendResponse.headers.get('x-vercel-ai-ui-message-stream') || 'v1',
        },
      });
    }

    // Preserve backend structured error responses ({ error: "...", issues: [...] }) per FRONTEND_API.md §8.4
    const contentType = backendResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errJson = await backendResponse.json().catch(() => null);
      if (errJson && typeof errJson === 'object') {
        return Response.json(errJson, { status: backendResponse.status });
      }
    }

    const errText = await backendResponse.text().catch(() => '');
    console.error(
      `[api/chat] Backend ${backendResponse.status} from ${backendBaseUrl}/api/chat: ${errText.slice(0, 500)}`
    );
    return Response.json(
      {
        error:
          backendResponse.status === 400
            ? 'Invalid question query or filter format.'
            : 'The AI assistant encountered an issue while generating a response. Please try again.',
      },
      { status: backendResponse.status >= 400 ? backendResponse.status : 502 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[api/chat] Unable to reach ${backendBaseUrl}/api/chat: ${message}`);
    return Response.json(
      {
        error: 'Unable to connect to the educational assistant backend. Please try again shortly.',
      },
      { status: 503 }
    );
  }
}
