'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  ApiError,
  apiClient,
  resolvePaperAssetUrl,
} from '../../lib/api-client';
import {
  clearAdminPending,
  getAdminPending,
  updateAdminDrafts,
  type AdminPendingSession,
} from '../../lib/admin-session';
import type {
  ApproveDraft,
  ApprovePaperResponse,
  Difficulty,
  DraftFigure,
  QuestionType,
  ReviewDraft,
  TaxonomyResponse,
  TaxonomySubject,
  TaxonomyTopic,
} from '../../types/admin';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import { AlertBanner } from '../ui/alert-banner';
import { DifficultyBadge } from '../ui/status-badge';
import { cn } from '../../lib/utils';

const MAX_APPROVE = 200; // §2.4: 1-200 questions

export function AdminReviewPanel({
  initial,
}: {
  initial: AdminPendingSession;
}) {
  const router = useRouter();
  const [sessionMeta, setSessionMeta] = useState(initial.meta);
  const [drafts, setDrafts] = useState<ReviewDraft[]>(initial.drafts);
  const [unassignedFigures, setUnassignedFigures] = useState<DraftFigure[]>(
    () => initial.unassignedFigures ?? []
  );

  // Taxonomy state
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // Per-question markdown editor preview mode: { [index]: boolean }
  const [mathPreviews, setMathPreviews] = useState<Record<number, boolean>>({});
  const [showUnassignedTray, setShowUnassignedTray] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApprovePaperResponse | null>(null);

  // Load taxonomy to populate topics and subtopics for the active subject
  useEffect(() => {
    let active = true;
    async function fetchTaxonomy() {
      try {
        setLoadingTaxonomy(true);
        const data = await apiClient.getTaxonomy();
        if (active) {
          setTaxonomy(data);
        }
      } catch (err) {
        console.warn('Could not load taxonomy in review panel:', err);
      } finally {
        if (active) setLoadingTaxonomy(false);
      }
    }
    fetchTaxonomy();
    return () => {
      active = false;
    };
  }, []);

  // Find the taxonomy subject definition
  const currentSubject: TaxonomySubject | undefined = useMemo(() => {
    if (!taxonomy?.subjects) return undefined;
    const name = sessionMeta.subject.toLowerCase();
    return taxonomy.subjects.find((s) => s.name.toLowerCase() === name);
  }, [taxonomy, sessionMeta.subject]);

  const keptCount = useMemo(
    () => drafts.filter((d) => d.keep && d.questionText.trim()).length,
    [drafts]
  );

  const patchDraft = (index: number, patch: Partial<ReviewDraft>) => {
    setDrafts((prev) => {
      const next = prev.map((d, i) => (i === index ? { ...d, ...patch } : d));
      updateAdminDrafts(next, unassignedFigures);
      return next;
    });
  };

  const toggleMathPreview = (index: number) => {
    setMathPreviews((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const attachFigureToDraft = (draftIndex: number, figure: DraftFigure) => {
    setDrafts((prev) => {
      const next = prev.map((d, i) => {
        if (i !== draftIndex) return d;
        const currentFigures = d.figures ?? [];
        if (currentFigures.length >= 8) return d; // §2.3 max 8 figures
        return { ...d, figures: [...currentFigures, figure] };
      });
      updateAdminDrafts(next);
      return next;
    });
    setUnassignedFigures((prev) =>
      prev.filter(
        (f) => !(f.page === figure.page && f.index === figure.index && f.url === figure.url)
      )
    );
  };

  const detachFigureFromDraft = (draftIndex: number, figureIndex: number) => {
    const draft = drafts[draftIndex];
    const detached = draft.figures?.[figureIndex];
    if (!detached) return;

    setDrafts((prev) => {
      const next = prev.map((d, i) =>
        i === draftIndex
          ? {
              ...d,
              figures: d.figures.filter((_, idx) => idx !== figureIndex),
            }
          : d
      );
      updateAdminDrafts(next);
      return next;
    });
    setUnassignedFigures((prev) => [...prev, detached]);
  };

  const moveFigure = (draftIndex: number, figureIndex: number, direction: 'up' | 'down') => {
    setDrafts((prev) => {
      const draft = prev[draftIndex];
      const figures = [...(draft.figures ?? [])];
      const targetIndex = direction === 'up' ? figureIndex - 1 : figureIndex + 1;
      if (targetIndex < 0 || targetIndex >= figures.length) return prev;

      const temp = figures[figureIndex];
      figures[figureIndex] = figures[targetIndex];
      figures[targetIndex] = temp;

      const next = prev.map((d, i) => (i === draftIndex ? { ...d, figures } : d));
      updateAdminDrafts(next);
      return next;
    });
  };

  const handleSelectAll = (select: boolean) => {
    setDrafts((prev) => {
      const next = prev.map((d) => ({ ...d, keep: select }));
      updateAdminDrafts(next);
      return next;
    });
  };

  const handleApprove = async () => {
    setError(null);
    const session = getAdminPending();
    if (!session) {
      setError('Session expired. Please upload the PDF again.');
      return;
    }
    const selected = drafts.filter((d) => d.keep && d.questionText.trim());
    if (selected.length === 0) {
      setError('Keep at least one draft question to approve.');
      return;
    }
    if (selected.length > MAX_APPROVE) {
      setError(`You can approve at most ${MAX_APPROVE} questions at once.`);
      return;
    }

    const year = Number.parseInt(sessionMeta.examYear, 10);
    const draftPayload: ApproveDraft = {
      subject: sessionMeta.subject.trim(),
      examYear: Number.isFinite(year) ? year : null,
      examType: sessionMeta.examType.trim() || null,
      questions: selected.map((d) => {
        // Enforce max 8 figure URLs per question per §2.3
        const figureUrls = (d.figures ?? [])
          .map((f) => f.url?.trim())
          .filter((u): u is string => Boolean(u))
          .slice(0, 8);

        return {
          questionText: d.questionText.trim(),
          pageReference: d.pageReference?.trim() || '1',
          questionNumber: d.questionNumber?.trim() || null,
          partLabel: d.partLabel?.trim() || null,
          questionType: d.questionTypeOverride || d.questionType || 'SHORT',
          difficulty: d.difficultyOverride || d.difficulty || 'MEDIUM',
          marks: typeof d.marks === 'number' ? d.marks : null,
          topicId: d.topicId || null,
          subtopicId: d.subtopicId || null,
          figureUrls,
        };
      }),
    };

    setBusy(true);
    try {
      const response = await apiClient.approvePaper(session.file, draftPayload);
      setResult(response);
      clearAdminPending();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Approve failed. The AI service may be temporarily unavailable.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  // Approval Success / Result View
  if (result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Paper Approved & Indexed</h2>
            <p className="text-xs text-slate-500 mt-1">
              Source: <span className="font-mono text-slate-700">{result.sourceDocument}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
            <span className="block text-2xl font-black text-emerald-700">
              {result.saved.length}
            </span>
            <span className="text-xs font-semibold text-emerald-800">Saved to Bank</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <span className="block text-2xl font-black text-slate-700">
              {result.skipped.length}
            </span>
            <span className="text-xs font-semibold text-slate-600">Skipped (Duplicates)</span>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center">
            <span className="block text-2xl font-black text-amber-700">
              {result.failed.length}
            </span>
            <span className="text-xs font-semibold text-amber-800">Failed</span>
          </div>
        </div>

        {result.failed.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-900">Failed Questions</h3>
            <p className="text-xs text-amber-800">
              Some questions could not generate embeddings. You can review or re-approve them in the
              question bank.
            </p>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              {result.failed.map((f, i) => (
                <li key={i}>
                  Page {f.pageReference}: {f.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/admin/questions"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
          >
            Go to Question Bank
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Upload Another Paper
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          type="error"
          title="Approval Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Header Summary & Paper Metadata */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Review & Approve Questions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source file: <span className="font-mono text-slate-700">{initial.file.name}</span> ·{' '}
              {initial.extract.pageCount} pages · {drafts.length} drafts extracted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="text-xs font-medium text-[#305282] hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="text-xs font-medium text-slate-500 hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Paper Metadata Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Subject</span>
            <input
              className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-[#305282] outline-none py-0.5"
              value={sessionMeta.subject}
              onChange={(e) => setSessionMeta((m) => ({ ...m, subject: e.target.value }))}
            />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Exam Year</span>
            <input
              type="number"
              className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-[#305282] outline-none py-0.5"
              value={sessionMeta.examYear}
              onChange={(e) => setSessionMeta((m) => ({ ...m, examYear: e.target.value }))}
            />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Exam Type</span>
            <input
              className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-[#305282] outline-none py-0.5"
              value={sessionMeta.examType}
              onChange={(e) => setSessionMeta((m) => ({ ...m, examType: e.target.value }))}
            />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">Kept for Approval</span>
            <span className="text-xs font-bold text-emerald-700 py-0.5 block">
              {keptCount} of {drafts.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Unassigned Figures Tray per §2.3 */}
      {unassignedFigures.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#305282]" />
              <h3 className="text-xs font-bold text-slate-800">
                Unassigned Figures Tray ({unassignedFigures.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Logos, formulas, and diagrams unassigned to any specific question stem.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUnassignedTray((v) => !v)}
              className="text-xs text-[#305282] hover:underline"
            >
              {showUnassignedTray ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showUnassignedTray && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
              {unassignedFigures.map((fig, idx) => {
                const src = resolvePaperAssetUrl(fig.url);
                return (
                  <div
                    key={`${fig.page}-${fig.index}-${idx}`}
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2.5 w-44 space-y-2 shadow-2xs"
                  >
                    <div className="h-24 w-full rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Figure p.${fig.page} #${fig.index}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>p. {fig.page}</span>
                      {fig.association === 'uncertain' && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Uncertain
                        </span>
                      )}
                    </div>
                    <select
                      className="w-full text-[11px] border border-slate-200 rounded-lg bg-white px-2 py-1 text-slate-700 focus:outline-none"
                      onChange={(e) => {
                        const targetIdx = Number(e.target.value);
                        if (!Number.isNaN(targetIdx)) {
                          attachFigureToDraft(targetIdx, fig);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Attach to Q#...
                      </option>
                      {drafts.map((d, dIdx) => (
                        <option key={dIdx} value={dIdx}>
                          Q{d.questionNumber || dIdx + 1}
                          {d.partLabel ? `(${d.partLabel})` : ''} (p.{d.pageReference})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List of Draft Questions */}
      <div className="space-y-4">
        {drafts.map((draft, index) => {
          const isPreviewing = mathPreviews[index] ?? false;
          const displayQNum = draft.questionNumber ? `Q${draft.questionNumber}` : `Item #${index + 1}`;
          const displayPart = draft.partLabel ? `(${draft.partLabel})` : '';

          // Find available subtopics for current topic
          const availableTopics: TaxonomyTopic[] = currentSubject?.topics || [];
          const selectedTopicObj = availableTopics.find(
            (t) => t.id === draft.topicId || t.name === draft.topic
          );
          const availableSubtopics = selectedTopicObj?.subtopics || [];

          return (
            <div
              key={index}
              className={cn(
                'rounded-2xl border transition-all bg-white p-5 shadow-sm space-y-4',
                draft.keep
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50/50 opacity-60'
              )}
            >
              {/* Question Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={draft.keep}
                      onChange={(e) => patchDraft(index, { keep: e.target.checked })}
                      className="w-4 h-4 rounded text-[#305282] focus:ring-[#305282] border-slate-300 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800">
                      {displayQNum} {displayPart}
                    </span>
                  </label>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-500">
                    Page {draft.pageReference}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMathPreview(index)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                  >
                    {isPreviewing ? (
                      <>
                        <Code2 className="w-3.5 h-3.5" />
                        Edit Markdown
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#305282]" />
                        Rendered Preview
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Question Number & Part Label Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Q Number
                  </label>
                  <input
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    value={draft.questionNumber || ''}
                    placeholder="e.g. 21"
                    onChange={(e) => patchDraft(index, { questionNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Part Label
                  </label>
                  <input
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    value={draft.partLabel || ''}
                    placeholder="e.g. (a)"
                    onChange={(e) => patchDraft(index, { partLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marks</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                    value={draft.marks ?? ''}
                    placeholder="e.g. 3"
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      patchDraft(index, { marks: val });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Difficulty
                  </label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                    value={draft.difficultyOverride || draft.difficulty || 'MEDIUM'}
                    onChange={(e) =>
                      patchDraft(index, { difficultyOverride: e.target.value as Difficulty })
                    }
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white"
                    value={draft.questionTypeOverride || draft.questionType || 'SHORT'}
                    onChange={(e) =>
                      patchDraft(index, { questionTypeOverride: e.target.value as QuestionType })
                    }
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="SHORT">SHORT</option>
                    <option value="LONG">LONG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Page Ref
                  </label>
                  <input
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                    value={draft.pageReference}
                    onChange={(e) => patchDraft(index, { pageReference: e.target.value })}
                  />
                </div>
              </div>

              {/* Taxonomy Classification Selectors per §2.3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Topic (filtered to {sessionMeta.subject})
                  </label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                    value={draft.topicId || ''}
                    onChange={(e) => {
                      const topicId = e.target.value || null;
                      const matched = availableTopics.find((t) => t.id === topicId);
                      patchDraft(index, {
                        topicId,
                        topic: matched?.name || null,
                        topicOverride: matched?.name || '',
                        subtopicId: null,
                        subtopic: null,
                        subtopicOverride: '',
                      });
                    }}
                  >
                    <option value="">Unclassified (No topic)</option>
                    {availableTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.questionCount} questions)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Subtopic
                  </label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                    value={draft.subtopicId || ''}
                    disabled={!draft.topicId}
                    onChange={(e) => {
                      const subtopicId = e.target.value || null;
                      const matched = availableSubtopics.find((st) => st.id === subtopicId);
                      patchDraft(index, {
                        subtopicId,
                        subtopic: matched?.name || null,
                        subtopicOverride: matched?.name || '',
                      });
                    }}
                  >
                    <option value="">Unclassified (No subtopic)</option>
                    {availableSubtopics.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.questionCount} questions)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Editable Markdown Area vs Live KaTeX Rendered Preview */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Question Text (Markdown + LaTeX)
                </label>
                {isPreviewing ? (
                  <div className="min-h-36 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-sans">
                    <MarkdownMathRenderer content={draft.questionText} />
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    value={draft.questionText}
                    onChange={(e) => patchDraft(index, { questionText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282] focus:border-transparent transition-all"
                    placeholder="Enter question markdown ($...$ inline math, $$...$$ display math)"
                  />
                )}
              </div>

              {/* Figures attached to this question per §2.3 */}
              {(draft.figures?.length ?? 0) > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Attached Figures ({draft.figures.length} / 8 max)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reorder, detach to unassigned tray, or inspect image quality.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {draft.figures.map((fig, fIdx) => {
                      const src = resolvePaperAssetUrl(fig.url);
                      return (
                        <div
                          key={`${fig.page}-${fig.index}-${fIdx}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-2 shadow-2xs relative group"
                        >
                          <div className="h-28 w-full rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Diagram ${fIdx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              #{fIdx + 1} (p.{fig.page})
                            </span>
                            {fig.association === 'uncertain' && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">
                                Needs review
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={fIdx === 0}
                                onClick={() => moveFigure(index, fIdx, 'up')}
                                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Earlier"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={fIdx === (draft.figures?.length ?? 1) - 1}
                                onClick={() => moveFigure(index, fIdx, 'down')}
                                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move Later"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => detachFigureFromDraft(index, fIdx)}
                              className="text-[11px] font-medium text-rose-600 hover:text-rose-800 hover:underline"
                            >
                              Detach
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-slate-900">
            Ready to Approve {keptCount} Questions
          </span>
          <p className="text-xs text-slate-500">
            Questions are persisted in PostgreSQL, embedded for vector search, and figures are hosted.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center"
          >
            Cancel & Re-upload
          </Link>
          <button
            type="button"
            disabled={keptCount === 0 || busy}
            onClick={handleApprove}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving & Embedding...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Save to Bank</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
