# Backend API Developer Handoff

**Project:** ATAR SPARK educational search platform  
**Checked:** 2026-10-16  
**Frontend:** `http://localhost:3000`  
**Backend base URL:** `https://disown-antihero-secluded.ngrok-free.dev`  

> **Document purpose:** This is the frontend-to-backend implementation contract and handoff checklist. It describes the routes the frontend already calls, the payloads it sends, the response shapes it expects, and the changes required before the integration can be considered complete.

> **Important status:** The backend REST APIs are now reachable through the ngrok URL. The REST results below are verified. The `/api/chat` contract still fails with HTTP `400`, and the ngrok warning page must be handled for frontend requests. Items marked **Proposed contract** are inferred from the frontend TypeScript types and must be confirmed by the backend developer.

## Developer Quick Start

1. Start the backend and expose it at `https://disown-antihero-secluded.ngrok-free.dev`.
2. Implement and verify `GET /health` first.
3. Implement `GET /questions/filters` so the frontend dropdowns can load.
4. Implement `POST /questions/search` so related questions render in chat.
5. Implement `POST /api/chat` using the Vercel AI SDK UI message stream format, or confirm that the Next.js proxy should translate another stream format.
6. Run the acceptance requests in section 10.

The frontend currently reads these environment variables:

```env
NEXT_PUBLIC_API_URL=https://disown-antihero-secluded.ngrok-free.dev
USE_MOCK=false
```

Do not put model keys, database URLs, or other secrets in frontend environment variables. Backend secrets must remain server-side.

## 1. Executive Summary

The frontend is served successfully at `http://localhost:3000`. The Next.js route `POST /api/chat` is also reachable and returns a valid Vercel AI SDK UI message stream.

The backend REST service is reachable through `https://disown-antihero-secluded.ngrok-free.dev`. `GET /health`, `GET /questions/filters`, `POST /questions/search`, `POST /questions/search/hybrid`, and `POST /questions/answer` returned successful responses during the latest verification.

The backend `/api/chat` endpoint returned HTTP `400` for the current request shape. Separately, ngrok returns an interstitial page unless the request includes `ngrok-skip-browser-warning: true`; the frontend currently does not send that header. Because the Next.js chat route falls back to a hard-coded mock response for backend failures, the chat screen can appear to work while the live chat integration is broken.

## 2. API Architecture

There are three API layers:

1. **Browser to Next.js:** the chat UI uses `useChat()` from `@ai-sdk/react`, which sends messages to `/api/chat`.
2. **Next.js to backend:** `src/app/api/chat/route.ts` proxies the request to `${NEXT_PUBLIC_API_URL}/api/chat` unless `USE_MOCK=true`.
3. **Browser to REST backend:** TanStack Query hooks use `src/lib/api-client.ts` to call the backend directly for filters and related-question search.

The configured backend URL is `https://disown-antihero-secluded.ngrok-free.dev`. It can be changed with `NEXT_PUBLIC_API_URL`.

## 3. Implemented API Endpoints

### 3.1 `GET /health`

**Client implementation:** `apiClient.getHealth()` in `src/lib/api-client.ts`  
**React hook:** `useHealthCheck()` in `src/hooks/use-questions.ts`  
**Purpose:** Check backend and PostgreSQL health.  
**Timeout:** 10 seconds.  
**Current UI usage:** No visible page currently invokes `useHealthCheck()`.

Expected response type:

```json
{
  "status": "ok",
  "database": "connected"
}
```

The exact backend response should be confirmed against the backend contract because the backend was offline during this check.

### 3.2 `GET /questions/filters`

**Client implementation:** `apiClient.getFilters()`  
**React hook:** `useQuestionFilters()`  
**Used by:** Landing page dropdown options and chat filter definitions.  
**Timeout:** 15 seconds.

Expected response shape:

```json
{
  "subjects": [{ "value": "Physics", "count": 10 }],
  "years": [{ "value": 2024, "count": 10 }],
  "difficulties": [{ "value": "MEDIUM", "count": 10 }],
  "timePeriods": [
    { "label": "Last 3 Years", "yearFrom": 2024, "yearTo": 2026, "count": 10 }
  ],
  "total": 10
}
```

When this request fails, the landing page has hard-coded fallback filter options in `getDefaultFilterOptions()`, but the current `useQuestionFilters()` hook does not visibly apply that fallback data to its query result. This should be verified and fixed if fallback dropdowns are required.

### 3.3 `POST /questions/search`

**Client implementation:** `apiClient.searchQuestions()`  
**React hook:** `useQuestionSearch()`  
**Used by:** `ClosestQuestionsCard` through the chat page.  
**Timeout:** 20 seconds.  
**Debounce:** Approximately 300 ms.  
**Minimum displayed score:** `0.3`.

Request shape:

```json
{
  "query": "ray optics question",
  "subject": "Physics",
  "examYear": 2024,
  "yearFrom": null,
  "yearTo": null,
  "difficulty": "MEDIUM",
  "limit": 10
}
```

The UI converts `Easy`, `Medium`, and `Hard` to the REST values `EASY`, `MEDIUM`, and `HARD`.

The expected response is a `QuestionSearchResponse` containing `results`. Each result should include the exam question text, metadata, and a numeric similarity `score`.

### 3.4 `POST /questions/search/hybrid`

**Client implementation:** `apiClient.searchHybrid()`  
**React hook:** `useHybridSearch()`  
**Current UI usage:** No visible page currently invokes this hook.  
**Timeout:** 20 seconds.

This endpoint is intended to combine semantic vector search with lexical full-text search. It is implemented in the client but is not part of the active user workflow.

### 3.5 `POST /questions/answer`

**Client implementation:** `apiClient.getAnswer()`  
**React hook:** `useQuestionAnswer()`  
**Current UI usage:** No visible page currently invokes this hook.  
**Timeout:** 45 seconds.

Request fields are derived from the same filter state as search:

```json
{
  "query": "Explain this question",
  "subject": "Physics",
  "examYear": 2024,
  "yearFrom": null,
  "yearTo": null,
  "difficulty": "MEDIUM"
}
```

Expected response shape:

```json
{
  "status": "answered",
  "answer": "Markdown answer text",
  "explanation": null,
  "sources": []
}
```

Supported answer statuses are `answered`, `insufficient`, and `out_of_scope`.

### 3.6 `POST /api/chat`

**Client:** `useChat()` from `@ai-sdk/react`  
**Server:** `src/app/api/chat/route.ts`  
**Purpose:** Stream an assistant response to the chat page.

The AI SDK sends a structured message request similar to:

```json
{
  "messages": [
    { "role": "user", "content": "Find difficult physics questions" }
  ]
}
```

The route attempts:

```text
POST ${NEXT_PUBLIC_API_URL}/api/chat
```

with `Content-Type: application/json`.

For a successful backend response, the Next.js route forwards the response as:

```text
Content-Type: text/event-stream; charset=utf-8
x-vercel-ai-ui-message-stream: v1
Cache-Control: no-cache, no-transform
Connection: keep-alive
```

If the backend returns a non-2xx response or cannot be reached, the route emits a hard-coded mock response using `createUIMessageStream()` and `createUIMessageStreamResponse()`.

## 4. Button and Control Mapping

| UI control | Current handler | API or behavior | Status |
|---|---|---|---|
| Landing page Search button | `LandingPage.handleSearchSubmit` | Navigates to `/chat?...`; the chat page then calls `/api/chat` via `useChat()` | Connected, but filters are not included in the chat request |
| Landing page Enter key | `SearchBox.handleKeyDown` | Same as Search button | Connected |
| Chat Search button | `ChatPageInner.handleFollowUpSearch` | Calls `sendMessage({ text })` to `/api/chat` | Connected |
| Chat Enter key | `SearchBox.handleKeyDown` | Same chat submission | Connected |
| Subject filter | `SearchBox` filter state | Changes local state; the related search hook uses it for `/questions/search` | Partially connected |
| Time period filter | `SearchBox` filter state | Converted to `yearFrom` and `yearTo` for `/questions/search` | Partially connected |
| Difficulty filter | `SearchBox` filter state | Converted to uppercase for `/questions/search` | Partially connected |
| Year filter | `SearchBox` filter state | Sent as `examYear` for `/questions/search` | Partially connected |
| Microphone | `handleSpeechRecognition` | Browser speech recognition only updates the query input | No API call until the user presses Search |
| Plus/file upload | `handlePlusClick` | Intended to open a file picker | Disabled in JSX, therefore unreachable |
| Remove attached file | `handleRemoveFile` | Removes local file state only | No upload API exists |
| Header About Us | Optional `onAboutClick` | No handler supplied by `LandingPage` | No operation |
| Header Pricing | Optional `onPricingClick` | No handler supplied by `LandingPage` | No operation |
| Header Login | Optional `onLoginClick` | No handler supplied by `LandingPage` | No operation |
| Header Sign in for free | Optional `onSignUpClick` | No handler supplied by `LandingPage` | No operation |
| Sidebar New Chat | `router.push('/')` | Navigates to landing page | Connected |
| Sidebar Search Chat | None | No route or API call | No operation |
| Sidebar Library | None | No route or API call | No operation |
| Sidebar recent chat | `router.push('/chat?...')` | Loads a saved prompt and triggers `/api/chat` | Connected to mock/live chat path |
| Sidebar collapse/open | Local state | Changes sidebar visibility | UI-only |
| Chat overflow menu | No handler | No operation | No operation |

## 5. Verified Local Runtime Results

The following checks were performed against the local frontend and the configured ngrok backend:

| Check | Result |
|---|---|
| `GET http://localhost:3000` | `200 OK` |
| `GET http://localhost:3000/chat?q=Test%20question` | `200 OK` |
| `GET https://disown-antihero-secluded.ngrok-free.dev/health` | `200 OK`, `{"status":"ok","database":"up"}` when `ngrok-skip-browser-warning: true` is supplied |
| `GET https://disown-antihero-secluded.ngrok-free.dev/questions/filters` | `200 OK`; returned Chemistry and Physics, years 2024/2023, MEDIUM difficulty, and time periods |
| `POST https://disown-antihero-secluded.ngrok-free.dev/questions/search` | `200 OK`; returned scored Physics results |
| `POST https://disown-antihero-secluded.ngrok-free.dev/questions/search/hybrid` | `200 OK`; returned `vector` and `lexical` result groups |
| `POST https://disown-antihero-secluded.ngrok-free.dev/questions/answer` | `200 OK`; returned a valid `out_of_scope` answer response |
| `POST https://disown-antihero-secluded.ngrok-free.dev/api/chat` | `400 Bad Request` for the tested AI SDK-style request |
| `POST http://localhost:3000/api/chat` | `200 OK`, `text/event-stream`, `x-vercel-ai-ui-message-stream: v1`, but content was the Next.js mock fallback |
| Direct ngrok request without bypass header | Returned ngrok `ERR_NGROK_6024` interstitial instead of API JSON |

The local chat stream proves that the Next.js fallback route and client-side AI SDK stream parser are functioning. It does not prove that the real backend chat implementation or model provider is working.

## 6. Current Errors and Missing Behavior

### Backend-side or integration blockers

1. **Ngrok interstitial:** Requests without `ngrok-skip-browser-warning: true` receive the ngrok warning page instead of JSON. The frontend API client and Next.js proxy do not currently send this header.
2. **Live chat returns `400`:** The backend `/api/chat` rejects the current tested request. The backend and frontend must agree on the exact AI SDK request format.
3. **Live chat path is masked:** The Next.js proxy turns the backend `400` into a successful-looking mock stream.
4. **Silent mock fallback:** Backend connection errors and non-2xx responses are converted into mock answers. This masks outages and can mislead users.
5. **REST schemas need formalization:** The REST endpoints returned valid responses, but their schemas should be captured in OpenAPI or an equivalent versioned contract.
6. **No visible health state:** The UI does not show whether the backend or database is healthy.

### Frontend-side defects or gaps

1. **Chat filters are dropped:** `ChatRequest` and `toChatFilters()` exist, but `ChatPageInner` only sends message text. Subject, time period, difficulty, and year are not passed to `/api/chat`.
2. **Unused answer flow:** `useQuestionAnswer()` is implemented but not connected to a button or page.
3. **Unused hybrid search flow:** `useHybridSearch()` is implemented but not connected to a user workflow.
4. **Unused health flow:** `useHealthCheck()` is implemented but not rendered or surfaced.
5. **File upload is disabled:** The plus button has `disabled` even though local attachment state exists.
6. **No upload endpoint:** Even if enabled, selected files have no backend upload or document-processing API connected.
7. **Navigation placeholders:** About Us, Pricing, Login, Sign in for free, Search Chat, Library, and the overflow menu do nothing.
8. **Error visibility is incomplete:** Search errors appear as a toast, but the related-question card intentionally renders nothing on error, so the content area does not explain why results are missing.
9. **Potential filter fallback gap:** Default filter data is defined, but `useQuestionFilters()` does not currently show an explicit `placeholderData` or fallback assignment using `getDefaultFilterOptions()`.
10. **Type-safety exception:** `src/components/search-box.tsx` uses `any` for speech-recognition objects and events, conflicting with the project requirement to avoid `any`.

## 7. Recommended Fix Order

1. Configure a stable backend origin, or add the ngrok bypass header in development only. Do not rely on an expiring tunnel in production.
2. Fix the `/api/chat` `400` by agreeing on the exact AI SDK request and response protocol.
3. Pass filters as part of the AI SDK chat request and confirm the backend accepts the same shape.
4. Remove or gate the mock fallback for non-development environments. Return a visible 502/503 error when the backend is unavailable.
5. Publish the verified REST schemas in OpenAPI or an equivalent versioned document.
6. Add an explicit backend status indicator and useful error state to the UI.
7. Decide whether `/questions/answer` or `/api/chat` is the canonical answer-generation workflow, then connect only that path to the product UI.
8. Connect or remove unused navigation controls.
9. Enable file upload only after an upload/ingestion endpoint and validation rules exist.
10. Replace speech-recognition `any` types with browser API interfaces or a small typed wrapper.
11. Add automated tests for request payloads, proxy fallback behavior, stream parsing, filter conversion, and failed backend responses.

## 8. Acceptance Criteria for the Next Verification Pass

- Backend is reachable at a stable configured origin.
- `GET /health` returns a documented healthy response without an ngrok interstitial.
- `GET /questions/filters` populates all dropdowns from the backend.
- Search requests preserve subject, time period, difficulty, year, query, and limit.
- Chat requests preserve filters and stream a real backend/model response with HTTP `200`.
- Backend failures show an error state instead of a successful mock answer outside development mode.
- Related-question, answer, and hybrid-search flows have a visible entry point or are removed from the client.
- Every visible button either performs a documented action or is removed/disabled with an explicit reason.

## 9. Backend Implementation Contract

### 9.1 Common HTTP behavior

The backend should:

- Accept and return UTF-8 JSON for REST endpoints.
- Return `Content-Type: application/json` for JSON responses.
- Return a consistent error object for every non-2xx response.
- Validate request bodies before database, embedding, or model work.
- Treat omitted optional filters and explicit `null` as “no filter”.
- Reject invalid enum values with `400 Bad Request`.
- Return `500 Internal Server Error` only for unexpected server failures; do not expose stack traces or provider secrets.
- Return `503 Service Unavailable` when the database, embedding service, or model provider is unavailable.
- Include an optional request/correlation ID in logs and responses to make frontend errors supportable.

Recommended error response:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "difficulty must be one of EASY, MEDIUM, or HARD",
  "details": {
    "field": "difficulty"
  },
  "requestId": "optional-request-id"
}
```

The frontend currently reads either `message` or `error`, so both fields should be present until the client is standardized on one format.

### 9.2 CORS and browser access

The browser calls the configured backend origin directly for filters and related-question search. During local development, allow:

```text
http://localhost:3000
```

Allow only configured production origins in deployed environments. If credentials are added later, use explicit origins and never combine `Access-Control-Allow-Credentials: true` with a wildcard origin.

Required local preflight behavior for browser `POST` requests:

```text
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

The current ngrok tunnel also requires this development-only request header to bypass its warning page:

```text
ngrok-skip-browser-warning: true
```

The frontend does not currently send this header. Prefer configuring ngrok to disable the interstitial or use a stable backend origin. If the header is required temporarily, add it in the Next.js proxy and REST client only for local development; it is not an application security control.

### 9.3 `GET /health`

**Required purpose:** Liveness and dependency readiness check.

Recommended response:

```json
{
  "status": "ok",
  "database": "connected",
  "version": "optional-version"
}
```

Return `200` only when the service is ready for requests. Return `503` when the application is alive but a required dependency is unavailable:

```json
{
  "status": "error",
  "database": "unavailable"
}
```

### 9.4 `GET /questions/filters`

**Required purpose:** Populate landing-page and chat filter controls.

Required response fields and types:

```ts
interface QuestionFiltersResponse {
  subjects: Array<{ value: string; count: number }>;
  years: Array<{ value: number; count: number }>;
  difficulties: Array<{ value: 'EASY' | 'MEDIUM' | 'HARD'; count: number }>;
  timePeriods: Array<{
    label: string;
    yearFrom: number;
    yearTo: number;
    count: number;
  }>;
  total: number;
}
```

The response must use the exact property name `timePeriods` and each time-period item must include `label`, `yearFrom`, and `yearTo`. The frontend uses those values to convert labels such as `Last 3 Years` into a year range.

### 9.5 `POST /questions/search`

Request:

```ts
interface QuestionSearchRequest {
  query: string;
  subject: string | null;
  examYear: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  limit: number;
}
```

Validation requirements:

- `query` is required and must not be blank.
- `limit` must be a positive bounded integer. Recommended maximum: `50`.
- `examYear`, `yearFrom`, and `yearTo` must be valid years when present.
- Reject `yearFrom > yearTo` with `400`.
- Apply all non-null filters together.

Recommended response:

```json
{
  "results": [
    {
      "id": "question-id",
      "questionText": "Question text",
      "subject": "Physics",
      "difficulty": "MEDIUM",
      "examYear": 2024,
      "paper": "NEET",
      "pageReference": "optional-page-reference",
      "score": 0.87
    }
  ],
  "total": 1
}
```

Every returned result must have `questionText` and a numeric `score` in the range `0` to `1`. The frontend hides results with `score < 0.3`.

### 9.6 `POST /questions/search/hybrid`

Use the same request fields and validation rules as `/questions/search`. The response must be compatible with the frontend `HybridSearchResponse` type. Document any additional ranking fields before enabling this endpoint in the UI.

### 9.7 `POST /questions/answer`

Use the same query and filter fields as question search, excluding `limit` unless the backend needs it internally.

Response:

```ts
interface QuestionAnswerResponse {
  status: 'answered' | 'insufficient' | 'out_of_scope';
  answer: string;
  explanation: string | null;
  sources: Array<{
    questionId?: string;
    title?: string;
    excerpt?: string;
    pageReference?: string;
  }>;
}
```

Behavior:

- `answered`: provide a source-grounded answer and sources.
- `insufficient`: explain what evidence is missing; do not fabricate a source.
- `out_of_scope`: explain that the question is outside the supported archive or subjects.

### 9.8 `POST /api/chat`

This is the most important integration contract. The Next.js route sends the AI SDK request to the backend and forwards the backend response without transforming the body.

The backend must:

- Accept the AI SDK chat request produced by `useChat()` in the installed `ai` and `@ai-sdk/react` versions.
- Preserve the message history and support user and assistant messages.
- Support the current filter extension once the frontend passes it:

```json
{
  "messages": [
    {
      "role": "user",
      "parts": [{ "type": "text", "text": "Find physics questions" }]
    }
  ],
  "filters": {
    "subject": "Physics",
    "timePeriod": "Last 3 Years",
    "difficulty": "Medium",
    "year": 2024
  }
}
```

- Return a streamed AI SDK UI message response, not a single JSON object.
- Use `Content-Type: text/event-stream; charset=utf-8`.
- Send the UI message stream protocol expected by the installed AI SDK, including text start, text delta, and text end events where applicable.
- Flush chunks while generation is active; do not buffer the complete answer before responding.
- Stop generation when the client disconnects.
- Return a meaningful non-2xx response when the model provider fails.

The exact AI SDK protocol version must be confirmed by testing the installed package versions. A plain OpenAI-compatible SSE stream is not automatically compatible with `useChat()`.

**Current live failure:** The configured backend returned `400 Bad Request` for the tested request. The backend developer must return the validation error body and confirm whether it expects `content` strings, AI SDK `parts`, an additional message ID, or another version-specific request envelope. Do not silently change the frontend payload without documenting the agreed protocol.

### 9.9 Authentication and rate limiting

Authentication is not implemented in the current frontend. Before production deployment, the backend developer must decide:

- Whether anonymous search and chat are allowed.
- How authenticated users are identified.
- Which endpoints require authentication.
- Per-IP and per-user rate limits for search and model generation.
- Maximum query length and maximum chat history length.

Until authentication is added, do not treat the public frontend as a trusted client. Validate and rate-limit every request server-side.

## 10. Backend Acceptance Requests

Run these commands after starting the backend. PowerShell syntax is shown because the project is being developed on Windows.

### Health

```powershell
Invoke-RestMethod -Uri 'https://disown-antihero-secluded.ngrok-free.dev/health' -Headers @{'ngrok-skip-browser-warning'='true'} -Method Get
```

Expected: HTTP `200` and a healthy JSON response.

### Filters

```powershell
Invoke-RestMethod -Uri 'https://disown-antihero-secluded.ngrok-free.dev/questions/filters' -Headers @{'ngrok-skip-browser-warning'='true'} -Method Get
```

Expected: `subjects`, `years`, `difficulties`, `timePeriods`, and `total` are present.

### Semantic search

```powershell
$body = @{
  query = 'ray optics question'
  subject = 'Physics'
  examYear = 2024
  yearFrom = $null
  yearTo = $null
  difficulty = 'MEDIUM'
  limit = 10
} | ConvertTo-Json
Invoke-RestMethod -Uri 'https://disown-antihero-secluded.ngrok-free.dev/questions/search' -Headers @{'ngrok-skip-browser-warning'='true'} -Method Post -ContentType 'application/json' -Body $body
```

Expected: HTTP `200`, a `results` array, and numeric scores between `0` and `1`.

### Invalid search validation

```powershell
$body = '{"query":"","difficulty":"INVALID","limit":0}'
Invoke-WebRequest -Uri 'https://disown-antihero-secluded.ngrok-free.dev/questions/search' -Headers @{'ngrok-skip-browser-warning'='true'} -Method Post -ContentType 'application/json' -Body $body
```

Expected: HTTP `400` with the standard error shape from section 9.1.

### AI SDK chat stream

```powershell
$body = '{"messages":[{"role":"user","content":"Find difficult physics questions"}]}'
$response = Invoke-WebRequest -Uri 'https://disown-antihero-secluded.ngrok-free.dev/api/chat' -Headers @{'ngrok-skip-browser-warning'='true'} -Method Post -ContentType 'application/json' -Body $body
$response.StatusCode
$response.Headers['Content-Type']
$response.Content
```

Current result: HTTP `400 Bad Request`. The backend must first return a documented validation error, then accept the agreed AI SDK request and return HTTP `200` with `text/event-stream` content that the Next.js `useChat()` client can render without a parsing error.

## 11. Backend Developer Deliverables

Before this integration is marked complete, provide:

1. Running backend startup instructions and required environment variables.
2. Confirmed OpenAPI, JSON Schema, or equivalent endpoint documentation.
3. Confirmed examples of successful and failed responses.
4. A documented AI SDK package/protocol version for `/api/chat`.
5. CORS configuration for local and production frontend origins.
6. Database, vector index, embedding model, and LLM provider requirements.
7. Authentication and rate-limit decisions.
8. Automated backend tests for validation, filtering, provider failures, and streaming disconnects.
9. A deployed or locally runnable environment where all acceptance requests pass.

Until these deliverables exist, the frontend integration should be considered **partially integrated**, not production-ready.
