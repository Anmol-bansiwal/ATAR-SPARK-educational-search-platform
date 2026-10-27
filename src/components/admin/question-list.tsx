'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { AdminListedQuestion } from '../../types/admin';
import { resolvePaperAssetUrl } from '../../lib/api-client';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';

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
    <ul className="space-y-4">
      {items.map((q) => {
        const status = (q.embeddingStatus || 'READY').toUpperCase();
        const badge =
          STATUS_STYLE[status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
        const studentReady = status === 'READY';
        const figures = q.figureUrls?.filter(Boolean) ?? [];

        return (
          <li
            key={q.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
          >
            {/* Top metadata pill bar */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100 pb-2">
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
              <span className="text-slate-800">{q.subject}</span>
              <span>·</span>
              <span>{q.topic}</span>
              {q.subtopic && (
                <>
                  <span>·</span>
                  <span className="text-slate-600">{q.subtopic}</span>
                </>
              )}
              {q.examYear != null && (
                <>
                  <span>·</span>
                  <span>{q.examYear}</span>
                </>
              )}
              {q.difficulty && (
                <>
                  <span>·</span>
                  <span className="uppercase text-[10px] tracking-wide px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                    {q.difficulty}
                  </span>
                </>
              )}
              {q.pageReference && (
                <span className="ml-auto text-slate-400 font-normal">
                  Page {q.pageReference}
                </span>
              )}
            </div>

            {/* Question Text with Math & Table formatting */}
            <div className="text-sm text-slate-800 leading-relaxed overflow-x-auto">
              <MarkdownMathRenderer content={q.questionText} />
            </div>

            {/* Attached Diagrams, Maps & Tables */}
            {figures.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ImageIcon className="w-3.5 h-3.5 text-[#2665D9]" />
                  <span>
                    Attached Diagrams & Tables ({figures.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  {figures.map((url, figIdx) => (
                    <figure
                      key={`${url}-${figIdx}`}
                      className="border border-slate-200 rounded-lg bg-white p-1.5 shadow-xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvePaperAssetUrl(url)}
                        alt={`Figure ${figIdx + 1} for question`}
                        className="max-h-36 max-w-[280px] rounded object-contain bg-slate-50"
                        loading="lazy"
                      />
                      <figcaption className="text-[10px] text-slate-400 text-center pt-1">
                        Diagram {figIdx + 1}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with source document */}
            {q.sourceDocument && (
              <p className="text-[11px] text-slate-400 truncate pt-1 border-t border-slate-50">
                Source: {(q.sourceDocument || '').split('#')[0]}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

