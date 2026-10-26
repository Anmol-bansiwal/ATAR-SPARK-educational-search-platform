// =============================================================
// Domain types (UI-facing)
// =============================================================

export const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry'] as const;
export type SubjectType = (typeof SUBJECTS)[number];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = (typeof DIFFICULTIES)[number];

/** REST API difficulty contract */
export const API_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type ApiDifficulty = (typeof API_DIFFICULTIES)[number];

export const TIME_PERIODS = ['Last 3 Years', 'Last 5 Years', 'Last 10 Years', 'All Years'] as const;
export type TimePeriodType = (typeof TIME_PERIODS)[number];

// -------------------------------------------------------------
// Search filter state
// -------------------------------------------------------------

export interface SearchFilterState {
  query: string;
  /** Exact subject string from GET /questions/filters (or 'All') */
  subject: string;
  timePeriod: string;
  difficulty: DifficultyLevel | 'All';
  year: number | 'All';
}

// -------------------------------------------------------------
// GET /health
// -------------------------------------------------------------

export interface HealthResponse {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  message?: string;
}

// -------------------------------------------------------------
// GET /questions/filters
// -------------------------------------------------------------

export interface FilterOption<T extends string | number = string> {
  value: T;
  count: number;
}

export interface TimePeriodOption {
  /** Prefer exact labels from GET /questions/filters */
  label: string;
  yearFrom: number;
  yearTo: number;
  count: number;
}

export interface QuestionFiltersResponse {
  subjects: FilterOption<string>[];        // may include subjects beyond the 3 seeded ones
  years: FilterOption<number>[];
  difficulties: FilterOption<ApiDifficulty>[];
  timePeriods: TimePeriodOption[];
  total: number;
}

// -------------------------------------------------------------
// POST /questions/search & /questions/search/hybrid
// -------------------------------------------------------------

export interface QuestionSearchParams {
  query: string;
  subject?: string | null;
  examYear?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  difficulty?: ApiDifficulty | null;
  limit?: number; // default 10
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  examYear?: number;
  examType?: string;
  difficulty: ApiDifficulty;
  questionType?: 'MCQ' | 'SHORT' | 'LONG';
  sourceDocument?: string;
  fileUrl?: string | null;
  pageReference?: string; // e.g. "p. 12"
  /** Real paper diagrams (Cloudinary HTTPS or Nest /papers/figures/...). */
  figureUrls?: string[];
  /** Cosine similarity 0–1; UI should hide results below 0.3 */
  score: number;
}

export interface QuestionSearchResponse {
  results: ExamQuestion[];
}

export interface HybridSearchResult {
  id: string;
  questionText: string;
  pageReference?: string;
  rank?: number;
  vectorRank?: number | null;
  lexicalRank?: number | null;
}

export interface HybridSearchResponse {
  vector: HybridSearchResult[];
  lexical: HybridSearchResult[];
  hybrid: HybridSearchResult[];
}

// -------------------------------------------------------------
// POST /questions/answer
// -------------------------------------------------------------

export interface QuestionAnswerParams {
  query: string;
  subject?: string | null;
  examYear?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  difficulty?: ApiDifficulty | null;
}

export type AnswerStatus =
  | 'answered'
  | 'insufficient'
  | 'out_of_scope'
  | 'guidance';

export interface AnswerSource {
  id: string;
  questionText: string;
  pageReference?: string;
  score: number;
}

export interface QuestionAnswerResponse {
  status: AnswerStatus;
  /** Markdown answer text */
  answer: string;
  /** Present only when status === 'insufficient' (AI-generated gap fill) */
  explanation: string | null;
  sources: AnswerSource[];
}

// -------------------------------------------------------------
// POST /api/chat (Vercel AI SDK streaming — SSE)
// -------------------------------------------------------------

/**
 * Filters forwarded to the chat endpoint.
 * NOTE: chat expects UI-style difficulty ('Medium'), NOT the REST 'MEDIUM' —
 * conversion happens in api-transformers.ts.
 */
export interface ChatFilters {
  subject?: string;
  timePeriod?: string;
  difficulty?: DifficultyLevel;
  year?: number;
}

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  filters?: ChatFilters;
}

// Chat response is a text/event-stream — typed by the AI SDK, no interface needed.