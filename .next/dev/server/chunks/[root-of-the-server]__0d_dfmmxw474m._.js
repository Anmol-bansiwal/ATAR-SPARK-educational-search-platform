module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
// src/app/api/chat/route.ts
/** Backend verifies the full answer before the first SSE byte — allow ≥45s. */ const BACKEND_FIRST_BYTE_MS = 45_000;
async function POST(req) {
    let body = {};
    try {
        body = await req.json();
    } catch  {
    // Empty body fallback
    }
    const backendBaseUrl = (("TURBOPACK compile-time value", "https://disown-antihero-secluded.ngrok-free.dev") || 'http://localhost:3000').replace(/\/+$/, '');
    try {
        const controller = new AbortController();
        const connectionTimeout = setTimeout(()=>controller.abort(), BACKEND_FIRST_BYTE_MS);
        if (req.signal) {
            req.signal.addEventListener('abort', ()=>controller.abort());
        }
        const backendResponse = await fetch(`${backendBaseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Required when NEXT_PUBLIC_API_URL is an ngrok tunnel
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(connectionTimeout);
        if (backendResponse.ok && backendResponse.body) {
            return new Response(backendResponse.body, {
                status: backendResponse.status,
                headers: {
                    'Content-Type': backendResponse.headers.get('Content-Type') || 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    Connection: 'keep-alive',
                    'x-vercel-ai-ui-message-stream': backendResponse.headers.get('x-vercel-ai-ui-message-stream') || 'v1'
                }
            });
        }
        const errText = await backendResponse.text().catch(()=>'');
        console.error(`[api/chat] Backend ${backendResponse.status} from ${backendBaseUrl}/api/chat: ${errText.slice(0, 500)}`);
        return Response.json({
            error: errText || `Chat backend returned ${backendResponse.status}. Check filters/messages body.`
        }, {
            status: backendResponse.status >= 400 ? backendResponse.status : 502
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[api/chat] Unable to reach ${backendBaseUrl}/api/chat: ${message}`);
        return Response.json({
            error: `Unable to connect to chat backend at ${backendBaseUrl}. Is the API running?`
        }, {
            status: 503
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0d_dfmmxw474m._.js.map