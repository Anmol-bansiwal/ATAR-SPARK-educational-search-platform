// src/hooks/use-questions.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient, ApiError, toQuestionAnswerParams, toQuestionSearchParams } from '../lib/api-client';
import { useDebounce } from './use-debounce';
import type {
  HealthResponse,
  QuestionFiltersResponse,
  QuestionSearchResponse,
  HybridSearchResponse,
  QuestionAnswerResponse,
  SearchFilterState,
  ExamQuestion,
  TimePeriodOption,
} from '../types/question';

/** Minimum cosine similarity to show a result (per API guide) */
export const MIN_SCORE = 0.3;

/**
 * Fallback filter options when the backend is loading or unavailable.
 * Years are generated relative to the current date so this never rots.
 */
export function getDefaultFilterOptions(): QuestionFiltersResponse {
  const currentYear = new Date().getFullYear();
  return {
    subjects: [
      { value: 'Mathematics', count: 0 },
      { value: 'Physics', count: 0 },
      { value: 'Chemistry', count: 0 },
    ],
    years: Array.from({ length: 4 }, (_, i) => ({
      value: currentYear - 1 - i,
      count: 0,
    })),
    difficulties: [
      { value: 'EASY', count: 0 },
      { value: 'MEDIUM', count: 0 },
      { value: 'HARD', count: 0 },
    ],
    timePeriods: [
      { label: 'Last 3 Years', yearFrom: currentYear - 2, yearTo: currentYear, count: 0 },
      { label: 'Last 5 Years', yearFrom: currentYear - 4, yearTo: currentYear, count: 0 },
      { label: 'Last 10 Years', yearFrom: currentYear - 9, yearTo: currentYear, count: 0 },
    ],
    total: 0,
  };
}

/**
 * GET /health — backend & database status.
 */
export function useHealthCheck(enabled: boolean = true) {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: ({ signal }) => apiClient.getHealth(signal),
    enabled,
    staleTime: 1000 * 15,
    retry: false, // fail fast — a down backend shouldn't be hammered
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * GET /questions/filters — dynamic dropdown options.
 */
export function useQuestionFilters() {
  return useQuery<QuestionFiltersResponse, ApiError>({
    queryKey: ['question-filters'],
    queryFn: ({ signal }) => apiClient.getFilters(signal),
    staleTime: 1000 * 60 * 10, // 10 minutes — matches integration plan
    gcTime: 1000 * 60 * 30,
    // So time-period labels can resolve to yearFrom/yearTo before first fetch settles
    placeholderData: getDefaultFilterOptions(),
  });
}

interface SearchHookOptions {
  enabled?: boolean;
  debounceMs?: number;
  limit?: number;
}

/**
 * POST /questions/search — semantic vector search.
 * Debounced (300ms), hides results with score < 0.3, keeps previous
 * results visible while the next search runs.
 */
export function useQuestionSearch(
  filters: SearchFilterState,
  timePeriodOptions?: TimePeriodOption[],
  options?: SearchHookOptions
) {
  const debouncedQuery = useDebounce(filters.query.trim(), options?.debounceMs ?? 300);

  const searchParams = toQuestionSearchParams(
    { ...filters, query: debouncedQuery },
    timePeriodOptions,
    options?.limit ?? 10
  );

  const query = useQuery<QuestionSearchResponse, ApiError>({
    queryKey: ['questions-search', searchParams],
    queryFn: ({ signal }) => apiClient.searchQuestions(searchParams, signal),
    enabled: (options?.enabled ?? true) && debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 3,
    placeholderData: keepPreviousData, // no loading flash between keystrokes
  });

  // Memoized transformation — cache stores the RAW response
  const filteredResults: ExamQuestion[] =
    query.data?.results?.filter((q) => q.score >= MIN_SCORE) ?? [];

  return { ...query, filteredResults };
}

/**
 * POST /questions/search/hybrid — vector + lexical full-text search.
 */
export function useHybridSearch(
  filters: SearchFilterState,
  timePeriodOptions?: TimePeriodOption[],
  options?: SearchHookOptions
) {
  const debouncedQuery = useDebounce(filters.query.trim(), options?.debounceMs ?? 300);

  const searchParams = toQuestionSearchParams(
    { ...filters, query: debouncedQuery },
    timePeriodOptions,
    options?.limit ?? 10
  );

  return useQuery<HybridSearchResponse, ApiError>({
    queryKey: ['questions-hybrid-search', searchParams],
    queryFn: ({ signal }) => apiClient.searchHybrid(searchParams, signal),
    enabled: (options?.enabled ?? true) && debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 3,
    placeholderData: keepPreviousData,
  });
}

/**
 * POST /questions/answer — verified source-grounded answer.
 * NOT debounced: this fires on explicit submit ("Search" click), not typing.
 */
export function useQuestionAnswer(
  filters: SearchFilterState,
  timePeriodOptions?: TimePeriodOption[],
  options?: { enabled?: boolean }
) {
  const answerParams = toQuestionAnswerParams(filters, timePeriodOptions);

  return useQuery<QuestionAnswerResponse, ApiError>({
    queryKey: ['question-answer', answerParams],
    queryFn: ({ signal }) => apiClient.getAnswer(answerParams, signal),
    enabled: (options?.enabled ?? true) && answerParams.query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}