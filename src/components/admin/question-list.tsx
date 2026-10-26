'use client';

import React from 'react';
import type { AdminListedQuestion } from '../../types/admin';

const STATUS_STYLE: Record<string, string> = {
  READY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
};

export function AdminQuestionList({
  items,
  emptyLabel = 'No questions found.',
}: {
  items: AdminListedQuestion[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((q) => {
        const status = (q.embeddingStatus || 'READY').toUpperCase();
        const badge =
          STATUS_STYLE[status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
        const studentReady = status === 'READY';
        return (
          <li
            key={q.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span
                className={`rounded-full border px-2 py-0.5 ${badge}`}
                title={
                  studentReady
                    ? 'Approved — searchable by students'
                    : 'Not searchable by students yet'
                }
              >
                {studentReady ? 'Approved · READY' : `Not approved · ${status}`}
              </span>
              <span>{q.subject}</span>
              <span>·</span>
              <span>{q.topic}</span>
              {q.examYear != null && (
                <>
                  <span>·</span>
                  <span>{q.examYear}</span>
                </>
              )}
              {q.pageReference && (
                <>
                  <span>·</span>
                  <span>Page {q.pageReference}</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {q.questionText}
            </p>
            {q.sourceDocument && (
              <p className="text-[11px] text-slate-400 truncate">
                {(q.sourceDocument || '').split('#')[0]}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
