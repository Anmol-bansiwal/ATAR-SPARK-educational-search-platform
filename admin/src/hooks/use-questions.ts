// src/hooks/use-questions.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../lib/api-client';
import type {
  QuestionFiltersResponse,
  QuestionSearchParams,
  QuestionSearchResponse,
} from '../types/question';
import type { AdminQuestionListResponse } from '../types/admin';

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
 * GET /questions/filters — dynamic dropdown options and stats.
 */
export function useQuestionFilters() {
  return useQuery<QuestionFiltersResponse, ApiError>({
    queryKey: ['question-filters'],
    queryFn: ({ signal }) => apiClient.getFilters(signal),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    placeholderData: getDefaultFilterOptions(),
  });
}

/**
 * GET /questions/list — admin browse of database questions by subject & embedding status.
 */
export function useAdminQuestionsList(params: {
  subject?: string | null;
  embeddingStatus?: 'PENDING' | 'READY' | 'FAILED' | null;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { subject, embeddingStatus, limit = 200, offset = 0, enabled = true } = params;

  return useQuery<AdminQuestionListResponse, ApiError>({
    queryKey: ['admin-questions-list', { subject, embeddingStatus, limit, offset }],
    queryFn: ({ signal }) =>
      apiClient.listQuestions({
        subject: subject && subject !== 'All' ? subject : null,
        embeddingStatus: embeddingStatus ?? null,
        limit,
        offset,
        signal,
      }),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * POST /questions/search — semantic vector search query for admin question bank inspection.
 */
export function useAdminQuestionSearch(
  params: QuestionSearchParams,
  options?: { enabled?: boolean }
) {
  const enabled = (options?.enabled ?? true) && Boolean(params.query.trim());

  return useQuery<QuestionSearchResponse, ApiError>({
    queryKey: ['admin-questions-search', params],
    queryFn: ({ signal }) => apiClient.searchQuestions(params, signal),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
