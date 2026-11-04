// src/components/chat/closest-questions-card.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  Layers,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import type { ExamQuestion, ApiDifficulty } from '../../types/question';
import { apiClient, resolvePaperAssetUrl, type ApiError } from '../../lib/api-client';
import { MIN_SCORE } from '../../hooks/use-questions';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import {
  groupQuestionsByParts,
  extractQuestionPartsMeta,
  splitStemAndPart,
  type GroupedQuestion,
  type QuestionPartItem,
} from '../../lib/question-parts';

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

/**
 * Individual grouped question card supporting multiple parts (a, b, c)
 * and fetching sibling parts belonging to the same questionNumber.
 */
function GroupedQuestionCard({
  group,
  index,
  broken,
  setBroken,
}: {
  group: GroupedQuestion;
  index: number;
  broken: Record<string, true>;
  setBroken: React.Dispatch<React.SetStateAction<Record<string, true>>>;
}) {
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const [showAllParts, setShowAllParts] = useState(false);
  const [fetchedSiblings, setFetchedSiblings] = useState<QuestionPartItem[]>([]);
  const [isFetchingSiblings, setIsFetchingSiblings] = useState(false);
  const [fetchSiblingsMsg, setFetchSiblingsMsg] = useState<string | null>(null);

  // Merge pre-grouped parts with any dynamically fetched sibling parts
  const allParts: QuestionPartItem[] = useMemo(() => {
    const map = new Map<string, QuestionPartItem>();
    for (const p of group.parts) {
      map.set(p.partLabel, p);
    }
    for (const p of fetchedSiblings) {
      if (!map.has(p.partLabel)) {
        map.set(p.partLabel, p);
      }
    }
    const merged = Array.from(map.values());
    merged.sort((a, b) => a.partLabel.localeCompare(b.partLabel));
    return merged;
  }, [group.parts, fetchedSiblings]);

  const hasMultiple = allParts.length > 1;
  const allLabels = useMemo(() => {
    return allParts
      .map((p) => p.partLabel.replace(/[()]/g, ''))
      .filter((l) => l !== 'main')
      .join(', ');
  }, [allParts]);

  const activeQuestion = allParts[selectedPartIndex]?.question ?? group.primary;
  const matchPercent = Math.round(group.primary.score * 100);
  const difficulty = (group.primary.difficulty || 'MEDIUM').toUpperCase() as ApiDifficulty;

  // Split shared stem and sub-parts for clean presentation when viewing all parts
  const { stem: sharedStem } = useMemo(() => {
    const firstWithStem = allParts.find((p) => p.question.questionText);
    if (!firstWithStem) return { stem: '' };
    return splitStemAndPart(firstWithStem.question.questionText, firstWithStem.partLabel);
  }, [allParts]);

  const handleFetchSiblings = async () => {
    if (!group.questionNumber || !group.sourceDocument || isFetchingSiblings) return;
    setIsFetchingSiblings(true);
    setFetchSiblingsMsg(null);
    try {
      const siblings = await apiClient.fetchSiblingParts(
        group.sourceDocument,
        group.questionNumber
      );
      if (siblings.length > 0) {
        const newItems: QuestionPartItem[] = siblings.map((q) => {
          const meta = extractQuestionPartsMeta(q.questionNumber, q.partLabel, q.questionText);
          return {
            partLabel: meta.partLabel || '(main)',
            question: q,
          };
        });
        setFetchedSiblings(newItems);
        setShowAllParts(true);
      } else {
        setFetchSiblingsMsg(`No other parts found for Question ${group.questionNumber} in this paper.`);
      }
    } catch (err) {
      console.error('[handleFetchSiblings] Error:', err);
      setFetchSiblingsMsg('Could not load additional parts.');
    } finally {
      setIsFetchingSiblings(false);
    }
  };

  const renderFigures = (figureUrls?: string[]) => {
    const valid = (figureUrls || []).filter((u) => u && !broken[u]);
    if (valid.length === 0) return null;
    return (
      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 select-none flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-blue-500" />
          Original figure{valid.length > 1 ? 's' : ''} from paper ({valid.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {valid.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={resolvePaperAssetUrl(url)}
              alt="Original figure from the paper"
              className="max-h-40 max-w-full rounded-xl border border-slate-200 bg-white object-contain shadow-2xs"
              onError={() => setBroken((prev) => ({ ...prev, [url]: true }))}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <article
      key={group.id || `question-${index}`}
      className="group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(38,101,217,0.08)] hover:border-blue-200/90 transition-all select-text overflow-hidden min-w-0 max-w-full space-y-3"
    >
      {/* Question Metadata Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 select-none">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-medium">
          {group.questionNumber && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#155dfc] font-bold border border-blue-100">
              Question {group.questionNumber}
            </span>
          )}

          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {group.primary.subject}
          </span>

          {group.primary.examYear && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Year {group.primary.examYear}
            </span>
          )}

          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${
              DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.MEDIUM
            }`}
          >
            {toUiLabel(group.primary.difficulty)}
          </span>

          {group.primary.questionType && (
            <span className="text-slate-400 font-normal hidden sm:inline">
              · {group.primary.questionType}
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
      {(group.primary.topic || group.primary.subtopic) && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium select-none">
          <span>{group.primary.topic}</span>
          {group.primary.subtopic && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>{group.primary.subtopic}</span>
            </>
          )}
        </div>
      )}

      {/* Part Selectors and Sibling Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 select-none">
        {hasMultiple && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500">Parts:</span>
            {allParts.map((part, pIdx) => {
              const isSelected = selectedPartIndex === pIdx && !showAllParts;
              return (
                <button
                  key={part.partLabel || pIdx}
                  type="button"
                  onClick={() => {
                    setSelectedPartIndex(pIdx);
                    setShowAllParts(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#155dfc] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {part.partLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* "View all parts of Question 28 (a, b, c)" Button */}
        {hasMultiple ? (
          <button
            type="button"
            onClick={() => setShowAllParts((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-[#155dfc] text-xs font-semibold shadow-2xs transition-all cursor-pointer ml-auto"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {showAllParts
                ? `Show single part of Question ${group.questionNumber || ''}`
                : `View all parts of Question ${group.questionNumber || ''} (${allLabels})`}
            </span>
          </button>
        ) : group.questionNumber && group.sourceDocument ? (
          <button
            type="button"
            disabled={isFetchingSiblings}
            onClick={handleFetchSiblings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-[#155dfc] text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60 ml-auto"
          >
            {isFetchingSiblings ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#155dfc]" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-[#155dfc]" />
            )}
            <span>
              {isFetchingSiblings
                ? `Loading parts of Question ${group.questionNumber}...`
                : `View all parts of Question ${group.questionNumber}`}
            </span>
          </button>
        ) : null}
      </div>

      {fetchSiblingsMsg && (
        <p className="text-[11px] text-slate-500 italic select-none">
          {fetchSiblingsMsg}
        </p>
      )}

      {/* Question Text Rendering */}
      {showAllParts ? (
        <div className="space-y-4 pt-1">
          {sharedStem && (
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans overflow-x-auto select-text">
                <MarkdownMathRenderer content={sharedStem} />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {allParts.map((part, pIdx) => {
              const { partBody } = splitStemAndPart(
                part.question.questionText,
                part.partLabel
              );
              const content = sharedStem ? partBody : part.question.questionText;
              return (
                <div
                  key={part.partLabel || pIdx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#155dfc] font-bold text-xs border border-blue-100">
                      Part {part.partLabel}
                    </span>
                    {part.question.pageReference && (
                      <span className="text-[11px] text-slate-400">
                        {formatPageReference(part.question.pageReference)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed min-w-0 max-w-full break-words [overflow-wrap:anywhere] overflow-x-auto select-text">
                    <MarkdownMathRenderer content={content} />
                  </div>
                  {renderFigures(part.question.figureUrls)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {allParts.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#155dfc] select-none">
              <span>Part {allParts[selectedPartIndex]?.partLabel}</span>
            </div>
          )}
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed min-w-0 max-w-full break-words [overflow-wrap:anywhere] overflow-x-auto">
            <MarkdownMathRenderer content={activeQuestion.questionText} />
          </div>
          {renderFigures(activeQuestion.figureUrls)}
        </div>
      )}

      {/* Source Document Reference */}
      {(group.primary.sourceDocument || group.primary.pageReference) && (
        <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {group.primary.sourceDocument
                ? group.primary.sourceDocument.split('#')[0]
                : 'Exam Paper'}
            </span>
            {group.primary.pageReference && (
              <span className="text-slate-400 shrink-0">
                ({formatPageReference(group.primary.pageReference)})
              </span>
            )}
          </div>
          {hasMultiple && (
            <span className="text-[10px] font-medium text-slate-400 shrink-0">
              {allParts.length} sub-parts ({allLabels})
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export const ClosestQuestionsCard: React.FC<ClosestQuestionsCardProps> = ({
  questions,
  isLoading,
  error,
}) => {
  void error; // surfaced via Toast by parent — card intentionally renders nothing
  const [broken, setBroken] = useState<Record<string, true>>({});

  // Group questions by sibling parts
  const groupedQuestions = useMemo(() => {
    return groupQuestionsByParts(questions);
  }, [questions]);

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
            Closest Exam Questions ({groupedQuestions.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Source Grounded · Score ≥ {MIN_SCORE.toFixed(2)}
        </span>
      </div>

      {/* List of Closest Exam Questions (Grouped by Sibling Parts) */}
      <div className="space-y-3">
        {groupedQuestions.map((group, index) => (
          <GroupedQuestionCard
            key={group.key || group.id}
            group={group}
            index={index}
            broken={broken}
            setBroken={setBroken}
          />
        ))}
      </div>
    </div>
  );
};
