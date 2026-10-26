// src/components/chat/closest-questions-card.tsx
'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import type { ExamQuestion, ApiDifficulty } from '../../types/question';
import { resolvePaperAssetUrl, type ApiError } from '../../lib/api-client';
import { MIN_SCORE } from '../../hooks/use-questions';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';

interface ClosestQuestionsCardProps {
  questions: ExamQuestion[];
  isLoading: boolean;
  /** Errors are surfaced via Toast by the parent; card just omits itself */
  error?: ApiError | null;
}

/** REST enum -> tailwind badge classes */
const DIFFICULTY_STYLES: Record<ApiDifficulty, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HARD: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** 'MEDIUM' -> 'Medium' — API sends uppercase enums; UI reads title-case */
function toUiLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * pageReference arrives as e.g. "p. 12" — don't wrap it in another "Page".
 * Falls back to stripping a bare number out if the format ever changes.
 */
function formatPageReference(ref: string): string {
  const trimmed = ref.trim();
  return /^\d+$/.test(trimmed) ? `Page ${trimmed}` : trimmed;
}

export const ClosestQuestionsCard: React.FC<ClosestQuestionsCardProps> = ({
  questions,
  isLoading,
  error,
}) => {
  void error; // surfaced via Toast by parent — card intentionally renders nothing
  const [broken, setBroken] = useState<Record<string, true>>({});

  // Loading and nothing cached yet
  if (isLoading && questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mr-auto mt-4 p-5 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm animate-pulse space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded-full" />
          <div className="h-4 w-44 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-5/6 bg-slate-100 rounded" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  // Search completed but nothing met the score threshold
  if (!isLoading && questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mr-auto mt-4 p-4 rounded-2xl bg-slate-50/90 border border-dashed border-slate-200 text-center select-none">
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
          No closely matching questions found in the archive for this query.
        </p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mr-auto mt-5 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-[#2665D9] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h4
            className="text-xs sm:text-sm font-semibold text-[#0D0D0D] tracking-tight"
            style={{ fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)" }}
          >
            Closest Exam Questions ({questions.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Source Grounded · Score ≥ {MIN_SCORE.toFixed(2)}
        </span>
      </div>

      {/* List of Closest Exam Questions */}
      <div className="space-y-3">
        {questions.map((q, index) => {
          const matchPercent = Math.round(q.score * 100);
          const difficulty = q.difficulty.toUpperCase() as ApiDifficulty;

          return (
            <article
              key={q.id || `question-${index}`}
              className="group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(38,101,217,0.08)] hover:border-blue-200/90 transition-all select-text overflow-hidden min-w-0 max-w-full"
            >
              {/* Question Metadata Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 select-none">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {q.subject}
                  </span>

                  {q.examYear && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Year {q.examYear}
                    </span>
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${
                      DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.MEDIUM
                    }`}
                  >
                    {toUiLabel(q.difficulty)}
                  </span>

                  {q.questionType && (
                    <span className="text-slate-400 font-normal hidden sm:inline">
                      · {q.questionType}
                    </span>
                  )}
                </div>

                {/* Similarity Score Pill */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100/80">
                  <CheckCircle2 className="w-3 h-3 text-[#2665D9]" />
                  <span>{matchPercent}% Match</span>
                </div>
              </div>

              {/* Topic / Subtopic Breadcrumb */}
              {(q.topic || q.subtopic) && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-2 select-none">
                  <span>{q.topic}</span>
                  {q.subtopic && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span>{q.subtopic}</span>
                    </>
                  )}
                </div>
              )}

              {/* Question Text with Math KaTeX Rendering */}
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed min-w-0 max-w-full break-words [overflow-wrap:anywhere] overflow-x-auto">
                <MarkdownMathRenderer content={q.questionText} />
              </div>

              {/* Source Document Reference */}
              {(q.sourceDocument || q.pageReference) && (
                <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 select-none">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {q.sourceDocument ? q.sourceDocument.split('#')[0] : 'Exam Paper'}
                    </span>
                    {q.pageReference && (
                      <span className="text-slate-400 shrink-0">
                        ({formatPageReference(q.pageReference)})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(q.figureUrls?.length ?? 0) > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-50 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 select-none">
                    Original figure from the paper
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.figureUrls!
                      .filter((url) => url && !broken[url])
                      .map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={resolvePaperAssetUrl(url)}
                          alt="Original figure from the paper"
                          className="max-h-40 max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                          onError={() =>
                            setBroken((prev) => ({ ...prev, [url]: true }))
                          }
                        />
                      ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};