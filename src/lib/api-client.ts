// src/lib/api-client.ts
import type {
  HealthResponse,
  QuestionFiltersResponse,
  QuestionSearchParams,
  QuestionSearchResponse,
  HybridSearchResponse,
  QuestionAnswerResponse,
  QuestionAnswerParams,
  SearchFilterState,
  ChatFilters,
  DifficultyLevel,
  ApiDifficulty,
} from '../types/question';
import type {
  AdminQuestionListResponse,
  ApprovePaperDraft,
  ApprovePaperResponse,
  ExtractPaperResponse,
} from '../types/admin';

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
 * Defaults to http://localhost:3000 (Nest with /api/chat). Override via NEXT_PUBLIC_API_URL.
 */
export function getApiBaseUrl(): string {
  const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').trim();
  return url.replace(/\/+$/, '');
}

/** Timeout budgets per endpoint type (ms). */
const TIMEOUTS = {
  health: 10_000,
  filters: 15_000,
  search: 60_000,   // embedding round-trip can be slow on cold OpenAI calls
  answer: 90_000,   // LLM answer generation is slow by nature
  papers: 120_000,  // PDF extract / approve + Cloudinary
} as const;

/**
 * Multipart fetch for /papers/* — do not set Content-Type (browser sets boundary).
 */
async function requestFormData<T>(
  endpoint: string,
  form: FormData,
  timeoutMs: number = TIMEOUTS.papers
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: form,
      signal: controller.signal,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData: { message?: string | string[]; error?: string } =
          await response.json();
        const msg = errorData.message;
        errorMessage = Array.isArray(msg)
          ? msg.join(', ')
          : msg || errorData.error || errorMessage;
      } catch {
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
      throw new ApiError(
        `Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`,
        408
      );
    }

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new ApiError(
        'Unable to connect to backend server. Please check your network or server status.',
        503
      );
    }

    const message =
      error instanceof Error ? error.message : 'An unexpected network error occurred.';
    throw new ApiError(message, 500);
  }
}

/** Absolute URL for Nest-relative figure paths from extract. */
export function resolvePaperAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getApiBaseUrl();
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

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
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // Required when NEXT_PUBLIC_API_URL is an ngrok tunnel
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData: { message?: string; error?: string } = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
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
   * GET /questions/filters - Fetch dynamic dropdown options for questions
   */
  async getFilters(signal?: AbortSignal): Promise<QuestionFiltersResponse> {
    return request<QuestionFiltersResponse>(
      '/questions/filters',
      { method: 'GET', signal },
      TIMEOUTS.filters
    );
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
   * POST /papers/extract — draft questions only (nothing saved).
   */
  async extractPaper(file: File): Promise<ExtractPaperResponse> {
    const form = new FormData();
    form.append('file', file);
    return requestFormData<ExtractPaperResponse>('/papers/extract', form);
  },

  /**
   * POST /papers/approve — persist + embed (+ Cloudinary when configured).
   */
  async approvePaper(
    file: File,
    draft: ApprovePaperDraft
  ): Promise<ApprovePaperResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('draft', JSON.stringify(draft));
    return requestFormData<ApprovePaperResponse>('/papers/approve', form);
  },

  /**
   * GET /questions/list — admin browse of DB rows (any embedding status).
   */
  async listQuestions(params?: {
    subject?: string | null;
    embeddingStatus?: 'PENDING' | 'READY' | 'FAILED' | null;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  }): Promise<AdminQuestionListResponse> {
    const q = new URLSearchParams();
    if (params?.subject) q.set('subject', params.subject);
    if (params?.embeddingStatus) q.set('embeddingStatus', params.embeddingStatus);
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.offset != null) q.set('offset', String(params.offset));
    const qs = q.toString();
    return request<AdminQuestionListResponse>(
      `/questions/list${qs ? `?${qs}` : ''}`,
      { method: 'GET', signal: params?.signal },
      TIMEOUTS.filters
    );
  },
};

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