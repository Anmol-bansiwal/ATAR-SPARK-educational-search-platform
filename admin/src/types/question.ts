// Domain types for Question Bank & Search
export const API_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type ApiDifficulty = (typeof API_DIFFICULTIES)[number];

// -------------------------------------------------------------
// GET /questions/filters
// -------------------------------------------------------------

export interface FilterOption<T extends string | number = string> {
  value: T;
  count: number;
}

export interface TimePeriodOption {
  label: string;
  yearFrom: number;
  yearTo: number;
  count: number;
}

export interface QuestionFiltersResponse {
  subjects: FilterOption<string>[];
  years: FilterOption<number>[];
  difficulties: FilterOption<ApiDifficulty>[];
  timePeriods: TimePeriodOption[];
  total: number;
}

// -------------------------------------------------------------
// POST /questions/search
// -------------------------------------------------------------

export interface QuestionSearchParams {
  query: string;
  subject?: string | null;
  examYear?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  difficulty?: ApiDifficulty | null;
  limit?: number;
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
  pageReference?: string;
  figureUrls?: string[];
  score: number;
}

export interface QuestionSearchResponse {
  results: ExamQuestion[];
}
