// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-Side Backend Proxy
 *
 * Keeps backend URLs, internal tokens, and connection details 100% hidden
 * from the client browser and client JavaScript bundles.
 * All client REST calls route through /api/backend/...
 */

function getBackendBaseUrl(): string {
  const url = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  ).trim();
  return url.replace(/\/+$/, '');
}

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const subPath = resolvedParams.path.join('/');
  const search = req.nextUrl.search;
  const backendBase = getBackendBaseUrl();
  const targetUrl = `${backendBase}/${subPath}${search}`;

  const forwardHeaders = new Headers();
  forwardHeaders.set('ngrok-skip-browser-warning', 'true');

  const contentType = req.headers.get('content-type');
  if (contentType) forwardHeaders.set('content-type', contentType);

  const accept = req.headers.get('accept');
  if (accept) forwardHeaders.set('accept', accept);

  // Forward browser's private X-Chat-Key header to backend for /api/chats
  const chatKey = req.headers.get('x-chat-key');
  if (chatKey) forwardHeaders.set('x-chat-key', chatKey);

  // If a server-side secret API key is configured, forward it securely
  const internalSecret = process.env.API_SECRET_KEY || process.env.BACKEND_API_KEY;
  if (internalSecret) {
    forwardHeaders.set('authorization', `Bearer ${internalSecret}`);
  }

  const method = req.method;
  let body: BodyInit | undefined = undefined;

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await req.arrayBuffer();
    } catch {
      // Body reading skipped if empty
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    const backendRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseHeaders = new Headers();
    const resContentType = backendRes.headers.get('content-type');
    if (resContentType) responseHeaders.set('content-type', resContentType);

    const cacheControl = backendRes.headers.get('cache-control');
    if (cacheControl) responseHeaders.set('cache-control', cacheControl);

    const data = await backendRes.arrayBuffer();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Backend Proxy Error] Failed to proxy to ${targetUrl}:`, message);

    return NextResponse.json(
      {
        error: 'Backend service is currently unavailable. Please verify server status.',
      },
      { status: 503 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;

