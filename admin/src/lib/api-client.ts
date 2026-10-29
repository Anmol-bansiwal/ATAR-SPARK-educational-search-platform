// admin/src/lib/api-client.ts
import type {
  AdminQuestion,
  AdminQuestionListResponse,
  AdminQuestionQueryParams,
  ApproveDraft,
  ApprovePaperResponse,
  DeletedTaxonomyEntry,
  DeleteResult,
  ExtractionJob,
  ExtractResponse,
  QuestionPatch,
  TaxonomyEntry,
  TaxonomyResponse,
} from '../types/admin';
import type {
  QuestionFiltersResponse,
  QuestionSearchParams,
  QuestionSearchResponse,
} from '../types/question';

/**
 * Custom API Error containing HTTP status code, user-safe message, and optional response payload.
 */
export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number = 500, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Returns the backend API base URL.
 * Defaults to http://localhost:3001 (Nest backend). Override via NEXT_PUBLIC_API_URL.
 */
export function getApiBaseUrl(): string {
  const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();
  return url.replace(/\/+$/, '');
}

/** Timeout budgets per endpoint type in milliseconds. */
const TIMEOUTS = {
  taxonomy: 15_000,
  questions: 30_000,
  papers: 180_000, // PDF extract / approve + OCR + Cloudinary
} as const;

/** Absolute URL for Nest-relative figure paths from paper extraction. */
export function resolvePaperAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getApiBaseUrl();
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

/** Specification alias for figure/diagram URL resolution (FRONTEND_GUIDE.md & PAPER_FIGURES.md). */
export const resolveFigureUrl = resolvePaperAssetUrl;

/**
 * Safely parse error message from standard API error response:
 * - 400 validation: message is string[] -> show Array.isArray(message) ? message[0] : message
 * - 404, 413, 422, 503: message is string
 */
async function parseErrorResponse(
  response: Response,
  fallbackMessage: string
): Promise<{ message: string; data?: unknown }> {
  try {
    const errorData = await response.json();
    const rawMsg = errorData?.message;
    const message = Array.isArray(rawMsg)
      ? rawMsg[0] || 'Validation error'
      : typeof rawMsg === 'string'
      ? rawMsg
      : errorData?.error || fallbackMessage;
    return { message, data: errorData };
  } catch {
    return { message: response.statusText || fallbackMessage };
  }
}

/**
 * Generic fetch wrapper with timeout, external signal handling, and structured error extraction.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUTS.questions
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const { message, data } = await parseErrorResponse(
        response,
        `Request failed with status ${response.status}`
      );
      throw new ApiError(message, response.status, data);
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

/**
 * Multipart fetch for /papers/* endpoints (file uploads).
 */
async function requestFormData<T>(
  endpoint: string,
  form: FormData,
  timeoutMs: number = TIMEOUTS.papers,
  signal?: AbortSignal
): Promise<{ status: number; data: T }> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort());
    }
  }

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
      const { message, data } = await parseErrorResponse(
        response,
        `Upload failed with status ${response.status}`
      );
      throw new ApiError(message, response.status, data);
    }

    const json = (await response.json()) as T;
    return { status: response.status, data: json };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      if (signal?.aborted) {
        throw new ApiError('Upload was cancelled.', 0);
      }
      throw new ApiError(
        `Upload timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`,
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

/** Helper sleep utility for polling */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * EduSearch Admin API Client
 */
export const apiClient = {
  /**
   * POST /papers/extract
   * Supports 202 background job + polling GET /papers/extract/:jobId every 2s,
   * as well as immediate 200 response.
   */
  async extractPaper(
    file: File,
    subject: string,
    onProgress?: (pagesRead: number, pageCount: number) => void,
    signal?: AbortSignal
  ): Promise<ExtractResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('subject', subject);

    const { status, data } = await requestFormData<ExtractResponse | ExtractionJob>(
      '/papers/extract',
      form,
      TIMEOUTS.papers,
      signal
    );

    // If immediate 200 ExtractResponse was returned
    if (status === 200 && 'questions' in data) {
      return data as ExtractResponse;
    }

    // If 202 Accepted job
    const job = data as ExtractionJob;
    const jobId = job.jobId;
    if (!jobId) {
      if ('questions' in data) return data as ExtractResponse;
      throw new ApiError('Unexpected response from paper extraction server.', 500);
    }

    // Initial progress report
    if (onProgress && typeof job.pagesRead === 'number' && typeof job.pageCount === 'number') {
      onProgress(job.pagesRead, job.pageCount);
    }

    // Poll GET /papers/extract/:jobId every 2 seconds
    const maxPollAttempts = 150; // up to 5 minutes
    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      if (signal?.aborted) {
        throw new ApiError('Extraction was cancelled.', 0);
      }

      await sleep(2000);

      const polled = await request<ExtractionJob>(
        `/papers/extract/${jobId}`,
        { method: 'GET', signal },
        15_000
      );

      if (onProgress && typeof polled.pagesRead === 'number' && typeof polled.pageCount === 'number') {
        onProgress(polled.pagesRead, polled.pageCount);
      }

      if (polled.status === 'done' && polled.result) {
        return polled.result;
      }

      if (polled.status === 'failed') {
        const errorMsg =
          polled.error?.message ||
          'Extraction failed. Please verify that the PDF has readable text and try again.';
        throw new ApiError(errorMsg, polled.error?.statusCode || 500);
      }
    }

    throw new ApiError('Extraction timed out while waiting for background processing.', 408);
  },

  /**
   * POST /papers/approve
   * Persists approved drafts and generates embeddings.
   * Sends the original PDF file + draft JSON string with figureUrls.
   */
  async approvePaper(
    file: File,
    draft: ApproveDraft,
    signal?: AbortSignal
  ): Promise<ApprovePaperResponse> {
    const form = new FormData();
    form.append('file', file);
    // Validate figureUrls is present on all questions per spec
    const validatedDraft: ApproveDraft = {
      ...draft,
      questions: draft.questions.map((q) => ({
        ...q,
        figureUrls: Array.isArray(q.figureUrls) ? q.figureUrls : [],
      })),
    };
    form.append('draft', JSON.stringify(validatedDraft));

    const { data } = await requestFormData<ApprovePaperResponse>(
      '/papers/approve',
      form,
      TIMEOUTS.papers,
      signal
    );
    return data;
  },

  /**
   * GET /admin/questions — browse question bank with full filtering and pagination.
   * Falls back gracefully to /questions/list if the backend uses the legacy route.
   */
  async listQuestions(
    params?: AdminQuestionQueryParams
  ): Promise<AdminQuestionListResponse> {
    const q = new URLSearchParams();
    if (params?.subject) q.set('subject', params.subject);
    if (params?.topicId) q.set('topicId', params.topicId);
    if (params?.subtopicId) q.set('subtopicId', params.subtopicId);
    if (params?.unclassified != null) q.set('unclassified', String(params.unclassified));
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.questionType) q.set('questionType', params.questionType);
    if (params?.marks != null) q.set('marks', String(params.marks));
    if (params?.marksMin != null) q.set('marksMin', String(params.marksMin));
    if (params?.marksMax != null) q.set('marksMax', String(params.marksMax));
    if (params?.examYear != null) q.set('examYear', String(params.examYear));
    if (params?.sourceDocument) q.set('sourceDocument', params.sourceDocument);
    if (params?.search) q.set('search', params.search);
    if (params?.embeddingStatus) q.set('embeddingStatus', params.embeddingStatus);
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.offset != null) q.set('offset', String(params.offset));

    const qs = q.toString();
    try {
      return await request<AdminQuestionListResponse>(
        `/admin/questions${qs ? `?${qs}` : ''}`,
        { method: 'GET', signal: params?.signal },
        TIMEOUTS.questions
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        // Fallback to legacy route GET /questions/list
        const legacyQ = new URLSearchParams();
        if (params?.subject) legacyQ.set('subject', params.subject);
        if (params?.embeddingStatus) legacyQ.set('embeddingStatus', params.embeddingStatus);
        if (params?.limit != null) legacyQ.set('limit', String(params.limit));
        if (params?.offset != null) legacyQ.set('offset', String(params.offset));
        const legacyQs = legacyQ.toString();
        return await request<AdminQuestionListResponse>(
          `/questions/list${legacyQs ? `?${legacyQs}` : ''}`,
          { method: 'GET', signal: params?.signal },
          TIMEOUTS.questions
        );
      }
      throw err;
    }
  },

  /**
   * GET /questions/filters — dynamic dropdown options and stats.
   */
  async getFilters(signal?: AbortSignal): Promise<QuestionFiltersResponse> {
    return request<QuestionFiltersResponse>(
      '/questions/filters',
      { method: 'GET', signal },
      TIMEOUTS.taxonomy
    );
  },

  /**
   * POST /questions/search — semantic vector search.
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
      TIMEOUTS.questions
    );
  },

  /**
   * GET /admin/questions/:id — fetch single question details.
   */
  async getQuestion(id: string, signal?: AbortSignal): Promise<AdminQuestion> {
    return request<AdminQuestion>(
      `/admin/questions/${encodeURIComponent(id)}`,
      { method: 'GET', signal },
      TIMEOUTS.questions
    );
  },

  /**
   * PATCH /admin/questions/:id — update question fields.
   * Sends only changed fields.
   */
  async patchQuestion(
    id: string,
    patch: QuestionPatch,
    signal?: AbortSignal
  ): Promise<AdminQuestion> {
    return request<AdminQuestion>(
      `/admin/questions/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
        signal,
      },
      TIMEOUTS.questions
    );
  },

  /**
   * DELETE /admin/questions/:id — delete a single question.
   */
  async deleteQuestion(id: string, signal?: AbortSignal): Promise<DeleteResult> {
    try {
      return await request<DeleteResult>(
        `/admin/questions/${encodeURIComponent(id)}`,
        { method: 'DELETE', signal },
        TIMEOUTS.questions
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        // Fallback to legacy DELETE /questions/:id
        return await request<DeleteResult>(
          `/questions/${encodeURIComponent(id)}`,
          { method: 'DELETE', signal },
          TIMEOUTS.questions
        );
      }
      throw err;
    }
  },

  /**
   * DELETE /admin/questions?confirm=DELETE ALL QUESTIONS
   * Bulk deletion of all questions or filtered by subject.
   */
  async deleteAllQuestions(
    confirmText: string,
    subject?: string,
    signal?: AbortSignal
  ): Promise<DeleteResult> {
    const q = new URLSearchParams();
    q.set('confirm', confirmText);
    if (subject) q.set('subject', subject);
    const qs = q.toString();

    try {
      return await request<DeleteResult>(
        `/admin/questions?${qs}`,
        { method: 'DELETE', signal },
        TIMEOUTS.questions
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        // Fallback to legacy DELETE /questions/all?subject=...
        const legQs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
        return await request<DeleteResult>(
          `/questions/all${legQs}`,
          { method: 'DELETE', signal },
          TIMEOUTS.questions
        );
      }
      throw err;
    }
  },

  /**
   * GET /admin/taxonomy — fetch subject, topic, and subtopic taxonomy tree with counts.
   */
  async getTaxonomy(signal?: AbortSignal): Promise<TaxonomyResponse> {
    try {
      return await request<TaxonomyResponse>(
        '/admin/taxonomy',
        { method: 'GET', signal },
        TIMEOUTS.taxonomy
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        // Fallback: construct basic taxonomy from GET /questions/filters
        try {
          const filters = await request<{
            subjects: Array<{ value: string; count: number }>;
          }>('/questions/filters', { method: 'GET', signal }, TIMEOUTS.taxonomy);

          return {
            subjects: (filters.subjects || []).map((s) => ({
              id: s.value,
              name: s.value,
              questionCount: s.count,
              unclassifiedCount: s.count,
              topics: [],
            })),
            otherSubjects: [],
          };
        } catch {
          return { subjects: [], otherSubjects: [] };
        }
      }
      throw err;
    }
  },

  /**
   * POST /admin/taxonomy/subjects
   */
  async createSubject(
    body: { name: string; sortOrder?: number },
    signal?: AbortSignal
  ): Promise<TaxonomyEntry> {
    return request<TaxonomyEntry>(
      '/admin/taxonomy/subjects',
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
      },
      TIMEOUTS.taxonomy
    );
  },

  /**
   * POST /admin/taxonomy/topics
   * Permanent convention per backend AdminTaxonomyController:
   * Body: { subjectId, name, sortOrder? }
   */
  async createTopic(
    body: { subjectId: string; name: string; sortOrder?: number },
    signal?: AbortSignal
  ): Promise<TaxonomyEntry> {
    return request<TaxonomyEntry>(
      '/admin/taxonomy/topics',
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
      },
      TIMEOUTS.taxonomy
    );
  },

  /**
   * POST /admin/taxonomy/subtopics
   * Permanent convention per backend AdminTaxonomyController:
   * Body: { topicId, name, sortOrder? }
   */
  async createSubtopic(
    body: { topicId: string; name: string; sortOrder?: number },
    signal?: AbortSignal
  ): Promise<TaxonomyEntry> {
    return request<TaxonomyEntry>(
      '/admin/taxonomy/subtopics',
      {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
      },
      TIMEOUTS.taxonomy
    );
  },

  /**
   * PATCH /admin/taxonomy/{subjects|topics|subtopics}/:id
   */
  async patchTaxonomy(
    type: 'subjects' | 'topics' | 'subtopics',
    id: string,
    body: { name?: string; sortOrder?: number },
    signal?: AbortSignal
  ): Promise<TaxonomyEntry> {
    return request<TaxonomyEntry>(
      `/admin/taxonomy/${type}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
        signal,
      },
      TIMEOUTS.taxonomy
    );
  },

  /**
   * DELETE /admin/taxonomy/{subjects|topics|subtopics}/:id
   * Accepts force=true to delete even if questions are linked.
   */
  async deleteTaxonomy(
    type: 'subjects' | 'topics' | 'subtopics',
    id: string,
    force: boolean = false,
    signal?: AbortSignal
  ): Promise<DeletedTaxonomyEntry> {
    const qs = force ? '?force=true' : '';
    return request<DeletedTaxonomyEntry>(
      `/admin/taxonomy/${type}/${encodeURIComponent(id)}${qs}`,
      {
        method: 'DELETE',
        signal,
      },
      TIMEOUTS.taxonomy
    );
  },
};
