'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AdminReviewPanel } from '../../../components/admin/review-panel';
import { AdminQuestionList } from '../../../components/admin/question-list';
import { ApiError, apiClient } from '../../../lib/api-client';
import {
  getAdminPending,
  type AdminPendingSession,
} from '../../../lib/admin-session';
import type { AdminListedQuestion } from '../../../types/admin';

export default function AdminReviewPage() {
  const [session, setSession] = useState<AdminPendingSession | null>(null);
  const [ready, setReady] = useState(false);
  const [notReady, setNotReady] = useState<AdminListedQuestion[]>([]);
  const [allItems, setAllItems] = useState<AdminListedQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getAdminPending());
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const [all, pending, failed] = await Promise.all([
          apiClient.listQuestions({ limit: 200 }),
          apiClient.listQuestions({ embeddingStatus: 'PENDING', limit: 200 }),
          apiClient.listQuestions({ embeddingStatus: 'FAILED', limit: 200 }),
        ]);
        if (cancelled) return;
        setAllItems(all.items);
        setTotal(all.total);
        setNotReady([...pending.items, ...failed.items]);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not load questions from the API.'
        );
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <p className="text-sm text-slate-500">Loading review session…</p>;
  }

  if (session) {
    return <AdminReviewPanel initial={session} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Review</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          New PDF drafts appear here only after you extract on Upload (kept in
          this browser until approve). Below is what is already in the database.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 space-y-3">
        <p className="text-sm text-slate-700">
          No PDF extract in progress in this tab.
        </p>
        <Link
          href="/admin"
          className="inline-flex rounded-xl bg-[#2665D9] px-4 py-2 text-sm font-semibold text-white"
        >
          Upload & extract a paper
        </Link>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Not approved / not searchable
        </h2>
        <p className="text-xs text-slate-500">
          PENDING or FAILED embedding status. These are not shown to students.
        </p>
        {busy ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        ) : (
          <AdminQuestionList
            items={notReady}
            emptyLabel="None — every question currently in the DB is already approved (READY)."
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">
            All questions in database ({total})
          </h2>
          <Link
            href="/admin/questions"
            className="text-xs font-semibold text-[#2665D9] hover:underline"
          >
            Open question bank →
          </Link>
        </div>
        {busy ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        ) : (
          <AdminQuestionList items={allItems} />
        )}
      </section>
    </div>
  );
}
