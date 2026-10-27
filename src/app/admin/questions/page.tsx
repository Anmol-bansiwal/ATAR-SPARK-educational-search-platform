'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { ApiError, apiClient } from '../../../lib/api-client';
import { useQuestionFilters } from '../../../hooks/use-questions';
import { AdminQuestionList } from '../../../components/admin/question-list';
import type { AdminListedQuestion } from '../../../types/admin';
import type { ExamQuestion } from '../../../types/question';

type Tab = 'all' | 'ready' | 'pending';

export default function AdminQuestionBankPage() {
  const { data: filters } = useQuestionFilters();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminListedQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [searchHits, setSearchHits] = useState<ExamQuestion[] | null>(null);

  const loadList = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSearchHits(null);
    try {
      const embeddingStatus =
        tab === 'ready' ? 'READY' : tab === 'pending' ? 'PENDING' : null;
      // "pending" tab also shows FAILED (not student-ready)
      if (tab === 'pending') {
        const [pending, failed] = await Promise.all([
          apiClient.listQuestions({
            subject: subject === 'All' ? null : subject,
            embeddingStatus: 'PENDING',
            limit: 200,
          }),
          apiClient.listQuestions({
            subject: subject === 'All' ? null : subject,
            embeddingStatus: 'FAILED',
            limit: 200,
          }),
        ]);
        const merged = [...pending.items, ...failed.items];
        setItems(merged);
        setTotal(merged.length);
      } else {
        const response = await apiClient.listQuestions({
          subject: subject === 'All' ? null : subject,
          embeddingStatus,
          limit: 200,
        });
        setItems(response.items);
        setTotal(response.total);
      }
    } catch (err) {
      setItems([]);
      setTotal(0);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not load questions. Is Nest running on :3000 with latest code?'
      );
    } finally {
      setBusy(false);
    }
  }, [tab, subject]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      void loadList();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await apiClient.searchQuestions({
        query: trimmed,
        subject: subject === 'All' ? null : subject,
        limit: 20,
      });
      setSearchHits(response.results ?? []);
    } catch (err) {
      setSearchHits(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Search failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const notReadyCount = items.filter(
    (i) => i.embeddingStatus !== 'READY'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Question bank
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          All questions stored in PostgreSQL. Approved (READY) ones are
          searchable by students.
          {typeof filters?.total === 'number' && (
            <> Filters report <strong>{filters.total}</strong> ready.</>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'All in DB'],
            ['ready', 'Approved (READY)'],
            ['pending', 'Not approved yet'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
              tab === id
                ? 'bg-[#2665D9] text-white border-[#2665D9]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Optional: semantic search in READY bank…"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#2665D9] focus:ring-2 focus:ring-[#2665D9]/20"
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
        >
          <option value="All">All subjects</option>
          {(filters?.subjects ?? []).map((s) => (
            <option key={s.value} value={s.value}>
              {s.value} ({s.count})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2665D9] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search / refresh'}
        </button>
      </form>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {searchHits ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Semantic search · {searchHits.length} hit
            {searchHits.length === 1 ? '' : 's'}
          </p>
          <AdminQuestionList
            items={searchHits.map((h) => ({
              id: h.id,
              questionText: h.questionText,
              subject: h.subject,
              topic: h.topic || '',
              subtopic: h.subtopic ?? null,
              examYear: h.examYear ?? null,
              examType: h.examType ?? null,
              difficulty: h.difficulty,
              questionType: h.questionType || 'SHORT',
              sourceDocument: h.sourceDocument ?? null,
              fileUrl: null,
              pageReference: h.pageReference ?? null,
              figureUrls: h.figureUrls ?? [],
              embeddingStatus: 'READY',
              createdAt: '',
              updatedAt: '',
            }))}
            emptyLabel="No semantic matches."
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Showing {items.length} of {total}
            {tab === 'pending' && notReadyCount === 0
              ? ' · none waiting — everything in DB is already approved'
              : ''}
          </p>
          {busy && items.length === 0 ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading from database…
            </p>
          ) : (
            <AdminQuestionList
              items={items}
              emptyLabel={
                tab === 'pending'
                  ? 'No unapproved questions in the database. Upload + extract creates drafts only in Review until you approve.'
                  : 'No questions in the database yet.'
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
