'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ApiError, apiClient } from '../../../lib/api-client';
import { AdminQuestionList } from '../../../components/admin/question-list';
import { AlertBanner } from '../../../components/ui/alert-banner';
import { cn } from '../../../lib/utils';
import type {
  AdminQuestion,
  Difficulty,
  QuestionType,
  TaxonomyResponse,
  TaxonomyTopic,
} from '../../../types/admin';

export default function AdminQuestionBankPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // Filters state per §3.1
  const [subject, setSubject] = useState<string>('All');
  const [topicId, setTopicId] = useState<string>('');
  const [subtopicId, setSubtopicId] = useState<string>('');
  const [unclassified, setUnclassified] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [questionType, setQuestionType] = useState<QuestionType | 'All'>('All');
  const [marksExact, setMarksExact] = useState<string>('');
  const [marksMin, setMarksMin] = useState<string>('');
  const [marksMax, setMarksMax] = useState<string>('');
  const [examYear, setExamYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminQuestion[]>([]);
  const [total, setTotal] = useState(0);

  // Bulk delete modal state per §3.5
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkConfirmText, setBulkConfirmText] = useState('');
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Load taxonomy for filter options
  useEffect(() => {
    let active = true;
    async function loadTaxonomy() {
      try {
        setLoadingTaxonomy(true);
        const data = await apiClient.getTaxonomy();
        if (active) setTaxonomy(data);
      } catch (err) {
        console.warn('Could not load taxonomy in Question Bank:', err);
      } finally {
        if (active) setLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
    return () => {
      active = false;
    };
  }, []);

  // Topics and subtopics for currently selected subject
  const currentSubjectObj = taxonomy?.subjects?.find(
    (s) => s.name.toLowerCase() === subject.toLowerCase()
  );
  const availableTopics: TaxonomyTopic[] = currentSubjectObj?.topics || [];
  const currentTopicObj = availableTopics.find((t) => t.id === topicId);
  const availableSubtopics = currentTopicObj?.subtopics || [];

  // Fetch questions
  const loadQuestions = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await apiClient.listQuestions({
        subject: subject === 'All' ? null : subject,
        topicId: topicId || null,
        subtopicId: subtopicId || null,
        unclassified: unclassified ? true : undefined,
        difficulty: difficulty === 'All' ? null : difficulty,
        questionType: questionType === 'All' ? null : questionType,
        marks: marksExact ? Number(marksExact) : null,
        marksMin: marksMin ? Number(marksMin) : null,
        marksMax: marksMax ? Number(marksMax) : null,
        examYear: examYear ? Number(examYear) : null,
        search: searchQuery.trim() || null,
        limit,
        offset,
      });

      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      setItems([]);
      setTotal(0);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Could not load questions from the bank.'
      );
    } finally {
      setBusy(false);
    }
  }, [
    subject,
    topicId,
    subtopicId,
    unclassified,
    difficulty,
    questionType,
    marksExact,
    marksMin,
    marksMax,
    examYear,
    searchQuery,
    limit,
    offset,
  ]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    void loadQuestions();
  };

  const handleResetFilters = () => {
    setSubject('All');
    setTopicId('');
    setSubtopicId('');
    setUnclassified(false);
    setDifficulty('All');
    setQuestionType('All');
    setMarksExact('');
    setMarksMin('');
    setMarksMax('');
    setExamYear('');
    setSearchQuery('');
    setOffset(0);
  };

  // Bulk deletion handler per §3.5
  const handleBulkDelete = async () => {
    if (bulkConfirmText !== 'DELETE ALL QUESTIONS') return;
    setBulkDeleting(true);
    setError(null);
    try {
      await apiClient.deleteAllQuestions(
        'DELETE ALL QUESTIONS',
        subject !== 'All' ? subject : undefined
      );
      setShowBulkDeleteModal(false);
      setBulkConfirmText('');
      setOffset(0);
      void loadQuestions();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to delete all questions.';
      setError(msg);
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  const inputClass =
    'text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282] transition-all';

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          type="error"
          title="Question Bank Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse, search, edit, and curate stored exam questions across subjects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadQuestions()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', busy && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          {/* Bulk Delete per §3.5 */}
          <button
            type="button"
            onClick={() => {
              setBulkConfirmText('');
              setShowBulkDeleteModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar per §3.1 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text or concepts (press Enter)..."
              className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#305282]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm cursor-pointer"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
            <select
              className={cn(inputClass, 'w-full')}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setTopicId('');
                setSubtopicId('');
                setOffset(0);
              }}
            >
              <option value="All">All Subjects</option>
              {taxonomy?.subjects?.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.questionCount})
                </option>
              ))}
              {taxonomy?.otherSubjects?.map((os) => (
                <option key={os.name} value={os.name}>
                  {os.name} ({os.questionCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Topic</label>
            <select
              className={cn(inputClass, 'w-full')}
              value={topicId}
              disabled={subject === 'All'}
              onChange={(e) => {
                setTopicId(e.target.value);
                setSubtopicId('');
                setOffset(0);
              }}
            >
              <option value="">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.questionCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtopic</label>
            <select
              className={cn(inputClass, 'w-full')}
              value={subtopicId}
              disabled={!topicId}
              onChange={(e) => {
                setSubtopicId(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">All Subtopics</option>
              {availableSubtopics.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.questionCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Difficulty
            </label>
            <select
              className={cn(inputClass, 'w-full')}
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as Difficulty | 'All');
                setOffset(0);
              }}
            >
              <option value="All">All Difficulties</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
            <select
              className={cn(inputClass, 'w-full')}
              value={questionType}
              onChange={(e) => {
                setQuestionType(e.target.value as QuestionType | 'All');
                setOffset(0);
              }}
            >
              <option value="All">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="SHORT">SHORT</option>
              <option value="LONG">LONG</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam Year</label>
            <input
              type="number"
              min={1950}
              max={2100}
              placeholder="e.g. 2024"
              className={cn(inputClass, 'w-full')}
              value={examYear}
              onChange={(e) => {
                setExamYear(e.target.value);
                setOffset(0);
              }}
            />
          </div>
        </div>

        {/* Second Filter Row: Marks & Unclassified */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unclassified}
                onChange={(e) => {
                  setUnclassified(e.target.checked);
                  setOffset(0);
                }}
                className="w-3.5 h-3.5 rounded text-[#305282] focus:ring-[#305282] border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">Only Unclassified</span>
            </label>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500">Marks:</span>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Min"
                className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1"
                value={marksMin}
                onChange={(e) => {
                  setMarksMin(e.target.value);
                  setOffset(0);
                }}
              />
              <span>–</span>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Max"
                className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1"
                value={marksMax}
                onChange={(e) => {
                  setMarksMax(e.target.value);
                  setOffset(0);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Results Header and Pagination Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing{' '}
          <strong className="text-slate-800">
            {total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, total)}
          </strong>{' '}
          of <strong className="text-slate-800">{total}</strong> questions
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px]">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setOffset(0);
              }}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 text-xs"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      {/* Questions List */}
      {busy && items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#305282]" />
          <span>Loading questions from database...</span>
        </div>
      ) : (
        <AdminQuestionList
          items={items}
          taxonomy={taxonomy}
          onItemUpdated={(updated) => {
            setItems((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
          }}
          onItemDeleted={(id) => {
            setItems((prev) => prev.filter((q) => q.id !== id));
            setTotal((prev) => Math.max(0, prev - 1));
          }}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={offset === 0 || busy}
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="text-xs text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={offset + limit >= total || busy}
            onClick={() => setOffset((prev) => prev + limit)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bulk Deletion Modal per §3.5 */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Bulk Question Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action is <strong>irreversible</strong>. It will delete all matching questions
              {subject !== 'All' ? ` for subject "${subject}"` : ' in the entire database'},
              along with all search embeddings and non-shared diagram files.
            </p>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Type &quot;DELETE ALL QUESTIONS&quot; to confirm:
              </label>
              <input
                className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={bulkConfirmText}
                placeholder="DELETE ALL QUESTIONS"
                onChange={(e) => setBulkConfirmText(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkConfirmText !== 'DELETE ALL QUESTIONS' || bulkDeleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {bulkDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
