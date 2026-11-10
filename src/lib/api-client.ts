// src/lib/api-client.ts
import type {
  HealthResponse,
  QuestionFiltersResponse,
  FilterOption,
  TimePeriodOption,
  QuestionSearchParams,
  QuestionSearchResponse,
  ExamQuestion,
  HybridSearchResponse,
  QuestionAnswerResponse,
  QuestionAnswerParams,
  SearchFilterState,
  ChatFilters,
  DifficultyLevel,
  ApiDifficulty,
} from '../types/question';
import type { ChatSummary, SavedChat } from '../types/chat';
import { getChatKey } from './chat-key';
import { getBackendBaseUrl } from '../config/api';

/**
 * Custom API Error containing HTTP status code and message.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Returns the backend API base URL.
 * In browser context, routes securely through the same-origin proxy (/api/backend)
 * so private backend URLs and secret tokens are never exposed in client bundles.
 */
export function getApiBaseUrl(): string {
  // Client browser context
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, '');
    }
    return '/api/backend';
  }
  // Server-side (Node.js/Next.js SSR)
  return getBackendBaseUrl();
}

/** Timeout budgets per endpoint type (ms). */
const TIMEOUTS = {
  health: 10_000,
  filters: 15_000,
  search: 60_000,   // embedding round-trip can be slow on cold OpenAI calls
  answer: 90_000,   // LLM answer generation is slow by nature
} as const;


/** Absolute URL for Nest-relative figure paths from extract. */
export function resolvePaperAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getApiBaseUrl();
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** Specification alias for figure/diagram URL resolution (FRONTEND_GUIDE.md & PAPER_FIGURES.md). */
export const resolveFigureUrl = resolvePaperAssetUrl;

/**
 * Generic fetch wrapper with timeout and structured error extraction.
 *
 * - Aborts after `timeoutMs`
 * - Propagates an external AbortSignal (e.g. from TanStack Query when the
 *   component unmounts or the query becomes inactive)
 * - Distinguishes "caller cancelled" from "timed out"
 * - Extracts `message` / `error` from non-OK JSON responses
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUTS.answer
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Allow an external signal to also abort — including one that was
  // already aborted before we got here.
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort());
    }
  }

  try {
    const chatKey = getChatKey();
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // Required when NEXT_PUBLIC_API_URL is an ngrok tunnel
        'ngrok-skip-browser-warning': 'true',
        ...(chatKey ? { 'X-Chat-Key': chatKey } : {}),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData: { message?: string | string[]; error?: string } = await response.json();
        const msg = errorData.message;
        errorMessage = Array.isArray(msg)
          ? msg[0] || 'Validation error'
          : msg || errorData.error || errorMessage;
      } catch {
        // Body wasn't JSON — fall back to status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      if (options.signal?.aborted) {
        throw new ApiError('Request was cancelled.', 0);
      }
      throw new ApiError(
        `Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`,
        408
      );
    }

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new ApiError('Unable to connect to backend server. Please check your network or server status.', 503);
    }

    const message =
      error instanceof Error ? error.message : 'An unexpected network error occurred.';
    throw new ApiError(message, 500);
  }
}

/**
 * EduSearch AI API Client Methods
 */
export const apiClient = {
  /**
   * GET /health - Check backend and PostgreSQL database status
   */
  async getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return request<HealthResponse>('/health', { method: 'GET', signal }, TIMEOUTS.health);
  },

  /**
   * GET /questions/filters - Fetch dynamic dropdown options for questions.
   * Robustly normalizes both FRONTEND_GUIDE string-array shapes and FRONTEND_API object-array shapes.
   */
  async getFilters(signal?: AbortSignal): Promise<QuestionFiltersResponse> {
    const raw = await request<Record<string, unknown>>(
      '/questions/filters',
      { method: 'GET', signal },
      TIMEOUTS.filters
    );

    const normalizeSubject = (s: unknown): FilterOption<string> => {
      if (typeof s === 'string') return { value: s, count: 0 };
      if (s && typeof s === 'object' && 'value' in s) {
        const item = s as { value: unknown; count?: unknown };
        return { value: String(item.value ?? ''), count: Number(item.count) || 0 };
      }
      return { value: String(s ?? ''), count: 0 };
    };

    const normalizeYear = (y: unknown): FilterOption<number> => {
      if (typeof y === 'number') return { value: y, count: 0 };
      if (typeof y === 'string') return { value: parseInt(y, 10) || 0, count: 0 };
      if (y && typeof y === 'object' && 'value' in y) {
        const item = y as { value: unknown; count?: unknown };
        return { value: Number(item.value) || 0, count: Number(item.count) || 0 };
      }
      return { value: 0, count: 0 };
    };

    const normalizeDifficulty = (d: unknown): FilterOption<ApiDifficulty> => {
      const rawVal =
        typeof d === 'string'
          ? d
          : d && typeof d === 'object' && 'value' in d
            ? String((d as { value: unknown }).value)
            : 'MEDIUM';
      const upper = rawVal.toUpperCase();
      const valid: ApiDifficulty =
        upper === 'EASY' || upper === 'MEDIUM' || upper === 'HARD' ? upper : 'MEDIUM';
      const count =
        d && typeof d === 'object' && 'count' in d ? Number((d as { count: unknown }).count) || 0 : 0;
      return { value: valid, count };
    };

    const currentYear = new Date().getFullYear();
    const normalizeTimePeriod = (t: unknown): TimePeriodOption => {
      if (typeof t === 'string') {
        const match = t.match(/(\d+)/);
        const span = match ? parseInt(match[1], 10) : 0;
        return {
          label: t,
          yearFrom: span > 0 ? currentYear - span : 0,
          yearTo: currentYear,
          count: 0,
        };
      }
      if (t && typeof t === 'object' && 'label' in t) {
        const item = t as { label: unknown; yearFrom?: unknown; yearTo?: unknown; count?: unknown };
        return {
          label: String(item.label ?? ''),
          yearFrom: Number(item.yearFrom) || 0,
          yearTo: Number(item.yearTo) || currentYear,
          count: Number(item.count) || 0,
        };
      }
      return { label: String(t ?? ''), yearFrom: 0, yearTo: currentYear, count: 0 };
    };

    return {
      subjects: Array.isArray(raw?.subjects) ? raw.subjects.map(normalizeSubject) : [],
      years: Array.isArray(raw?.years) ? raw.years.map(normalizeYear) : [],
      difficulties: Array.isArray(raw?.difficulties) ? raw.difficulties.map(normalizeDifficulty) : [],
      timePeriods: Array.isArray(raw?.timePeriods) ? raw.timePeriods.map(normalizeTimePeriod) : [],
      total: typeof raw?.total === 'number' ? raw.total : 0,
    };
  },

  /**
   * POST /questions/search - Semantic vector search for exam questions.
   * Results include a `score` (0–1); hide anything below 0.3 in the UI.
   */
  async searchQuestions(
    params: QuestionSearchParams,
    signal?: AbortSignal
  ): Promise<QuestionSearchResponse> {
    return request<QuestionSearchResponse>(
      '/questions/search',
      {
        method: 'POST',
        body: JSON.stringify(params),
        signal,
      },
      TIMEOUTS.search
    );
  },

  /**
   * POST /questions/search/hybrid - Combined semantic + lexical full-text search
   */
  async searchHybrid(
    params: QuestionSearchParams,
    signal?: AbortSignal
  ): Promise<HybridSearchResponse> {
    return request<HybridSearchResponse>(
      '/questions/search/hybrid',
      {
        method: 'POST',
        body: JSON.stringify(params),
        signal,
      },
      TIMEOUTS.search
    );
  },

  /**
   * POST /questions/answer - Verified source-grounded answer generation.
   * Status can be: 'answered' | 'insufficient' | 'out_of_scope'.
   */
  async getAnswer(
    params: QuestionAnswerParams,
    signal?: AbortSignal
  ): Promise<QuestionAnswerResponse> {
    return request<QuestionAnswerResponse>(
      '/questions/answer',
      {
        method: 'POST',
        body: JSON.stringify(params),
        signal,
      },
      TIMEOUTS.answer
    );
  },

  /**
   * Fetches sibling parts of a question (e.g. Q28(a), Q28(b), Q28(c))
   * belonging to the same questionNumber and sourceDocument.
   */
  async fetchSiblingParts(
    sourceDocument: string,
    questionNumber: string | number,
    signal?: AbortSignal
  ): Promise<ExamQuestion[]> {
    try {
      const cleanDoc = sourceDocument.replace(/#.*$/, '').trim();
      const res = await this.searchQuestions(
        {
          query: `Question ${questionNumber} ${cleanDoc}`,
          limit: 15,
        },
        signal
      );
      if (!res?.results?.length) return [];

      const targetQNum = String(questionNumber).replace(/^Q/i, '').trim();
      return res.results.filter((q) => {
        const docMatches =
          !cleanDoc ||
          (q.sourceDocument && q.sourceDocument.toLowerCase().includes(cleanDoc.toLowerCase()));
        const qNumMatches =
          q.questionNumber != null &&
          String(q.questionNumber).replace(/^Q/i, '').trim() === targetQNum;
        return docMatches && (qNumMatches || Boolean(q.partLabel && docMatches));
      });
    } catch (err) {
      console.error('[fetchSiblingParts] Failed to fetch siblings:', err);
      return [];
    }
  },

  /**
   * GET /api/chats - Fetch this browser's saved chats for the sidebar
   */
  async listChats(signal?: AbortSignal): Promise<{ chats: ChatSummary[] }> {
    return request<{ chats: ChatSummary[] }>('/api/chats', { method: 'GET', signal }, TIMEOUTS.filters);
  },

  /**
   * GET /api/chats/:id - Reopen one saved chat with its full messages array
   */
  async getChat(id: string, signal?: AbortSignal): Promise<SavedChat> {
    return request<SavedChat>(`/api/chats/${encodeURIComponent(id)}`, { method: 'GET', signal }, TIMEOUTS.filters);
  },

  /**
   * DELETE /api/chats/:id - Delete a saved chat (204 No Content)
   */
  async deleteChat(id: string, signal?: AbortSignal): Promise<void> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/chats/${encodeURIComponent(id)}`;
    const chatKey = getChatKey();
    const res = await fetch(url, {
      method: 'DELETE',
      signal,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(chatKey ? { 'X-Chat-Key': chatKey } : {}),
      },
    });
    if (!res.ok && res.status !== 404) {
      let msg = `Failed to delete chat (${res.status})`;
      try {
        const body = await res.json();
        msg = body.error || body.message || msg;
      } catch {
        // ignore non-json
      }
      throw new ApiError(msg, res.status);
    }
  },
};

/**
 * Extracts friendly error string from useChat transport or API error bodies.
 */
export function chatErrorText(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

/**
 * Maps UI difficulty ('Easy' | 'Medium' | 'Hard') to the REST uppercase enum.
 * Returns null for 'All'/undefined. Unknown values are dropped with a warning —
 * a silently missing filter is a debugging nightmare, so we log it.
 */
export function toRestDifficulty(
  difficulty: DifficultyLevel | 'All' | string | undefined
): ApiDifficulty | null {
  if (!difficulty || difficulty === 'All') return null;
  const upper = difficulty.toUpperCase();
  if (upper === 'EASY' || upper === 'MEDIUM' || upper === 'HARD') {
    return upper;
  }
  console.warn(`[api-client] Unknown difficulty "${difficulty}" — filter dropped.`);
  return null;
}

/**
 * Converts SearchFilterState into QuestionSearchParams for REST endpoints.
 * Resolves the time-period label ("Last 3 Years") into a year range using
 * the options returned by GET /questions/filters.
 */
export function toQuestionSearchParams(
  filters: SearchFilterState,
  timePeriodOptions?: { label: string; yearFrom: number; yearTo: number }[],
  limit: number = 10
): QuestionSearchParams {
  let yearFrom: number | null = null;
  let yearTo: number | null = null;

  if (filters.timePeriod && filters.timePeriod !== 'All Years' && timePeriodOptions) {
    const matched = timePeriodOptions.find((t) => t.label === filters.timePeriod);
    if (matched) {
      yearFrom = matched.yearFrom;
      yearTo = matched.yearTo;
    }
  }

  let examYear: number | null = null;
  if (filters.year && filters.year !== 'All') {
    const parsed = typeof filters.year === 'number' ? filters.year : parseInt(filters.year, 10);
    if (!Number.isNaN(parsed)) {
      examYear = parsed;
    }
  }

  return {
    query: filters.query.trim(),
    subject: filters.subject !== 'All' ? filters.subject : null,
    examYear,
    yearFrom,
    yearTo,
    difficulty: toRestDifficulty(filters.difficulty),
    limit,
  };
}

/**
 * Converts SearchFilterState into QuestionAnswerParams for POST /questions/answer.
 */
export function toQuestionAnswerParams(
  filters: SearchFilterState,
  timePeriodOptions?: { label: string; yearFrom: number; yearTo: number }[]
): QuestionAnswerParams {
  const searchParams = toQuestionSearchParams(filters, timePeriodOptions);
  return {
    query: searchParams.query,
    subject: searchParams.subject,
    examYear: searchParams.examYear,
    yearFrom: searchParams.yearFrom,
    yearTo: searchParams.yearTo,
    difficulty: searchParams.difficulty,
  };
}

/**
 * Converts SearchFilterState into ChatFilters for POST /api/chat.
 * NOTE: chat expects UI-style difficulty ('Medium'), NOT the REST 'MEDIUM'.
 */
export function toChatFilters(filters: SearchFilterState): ChatFilters {
  let year: number | undefined;
  if (filters.year && filters.year !== 'All') {
    const parsed = typeof filters.year === 'number' ? filters.year : parseInt(filters.year, 10);
    if (!Number.isNaN(parsed)) {
      year = parsed;
    }
  }

  return {
    subject: filters.subject !== 'All' ? filters.subject : undefined,
    timePeriod: filters.timePeriod !== 'All Years' ? filters.timePeriod : undefined,
    difficulty: filters.difficulty !== 'All' ? filters.difficulty : undefined,
    year,
  };
}