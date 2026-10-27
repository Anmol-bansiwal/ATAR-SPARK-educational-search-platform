'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  Eye,
  Code2,
  Image as ImageIcon,
  Layers,
  Plus,
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
  ApprovePaperResponse,
  ReviewDraft,
  ExtractFigure,
} from '../../types/admin';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';

const MAX_APPROVE = 100;

export function AdminReviewPanel({
  initial,
}: {
  initial: AdminPendingSession;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<ReviewDraft[]>(initial.drafts);
  const [unassignedFigures, setUnassignedFigures] = useState<ExtractFigure[]>(
    () => initial.extract.unassignedFigures ?? []
  );
  const [mathPreviews, setMathPreviews] = useState<Record<number, boolean>>({});
  const [showUnassignedGallery, setShowUnassignedGallery] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApprovePaperResponse | null>(null);

  const keptCount = useMemo(
    () => drafts.filter((d) => d.keep && d.questionText.trim()).length,
    [drafts]
  );

  const patchDraft = (index: number, patch: Partial<ReviewDraft>) => {
    setDrafts((prev) => {
      const next = prev.map((d, i) => (i === index ? { ...d, ...patch } : d));
      updateAdminDrafts(next);
      return next;
    });
  };

  const toggleMathPreview = (index: number) => {
    setMathPreviews((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const attachFigureToDraft = (draftIndex: number, figure: ExtractFigure) => {
    setDrafts((prev) => {
      const next = prev.map((d, i) =>
        i === draftIndex
          ? { ...d, figures: [...(d.figures ?? []), figure] }
          : d
      );
      updateAdminDrafts(next);
      return next;
    });
    setUnassignedFigures((prev) =>
      prev.filter(
        (f) => !(f.page === figure.page && f.index === figure.index)
      )
    );
  };

  const detachFigureFromDraft = (
    draftIndex: number,
    figureIndex: number
  ) => {
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

  const handleApprove = async () => {
    setError(null);
    const session = getAdminPending();
    if (!session) {
      setError('Session expired. Upload the PDF again.');
      return;
    }
    const selected = drafts.filter((d) => d.keep && d.questionText.trim());
    if (selected.length === 0) {
      setError('Keep at least one draft to approve.');
      return;
    }
    if (selected.length > MAX_APPROVE) {
      setError(`You can approve at most ${MAX_APPROVE} questions at once.`);
      return;
    }

    const year = Number.parseInt(session.meta.examYear, 10);
    setBusy(true);
    try {
      const response = await apiClient.approvePaper(session.file, {
        subject: session.meta.subject.trim(),
        topic: session.meta.topic.trim(),
        subtopic: session.meta.subtopic.trim() || null,
        examYear: Number.isFinite(year) ? year : null,
        examType: session.meta.examType.trim() || null,
        difficulty: session.meta.difficulty,
        questionType: session.meta.questionType,
        questions: selected.map((d) => ({
          questionText: d.questionText.trim(),
          pageReference: d.pageReference.trim() || '1',
          subtopic: d.subtopicOverride.trim() || null,
          figureUrls: (d.figures ?? [])
            .map((f) => f.url)
            .filter((url): url is string => Boolean(url?.trim())),
          subject: d.subject?.trim() || null,
          topic: d.topicOverride?.trim() || d.topic?.trim() || null,
          difficulty: d.difficultyOverride || d.difficulty || null,
          questionType: d.questionTypeOverride || d.questionType || null,
        })),
      });
      setResult(response);
      clearAdminPending();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Approve failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Approved</h2>
            <p className="text-sm text-slate-600 mt-1">
              Saved {result.saved.length} · Skipped {result.skipped.length} ·
              Failed {result.failed.length}
            </p>
            {result.fileUrl && (
              <p className="text-xs text-slate-500 mt-2 break-all">
                Cloud file:{' '}
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2665D9] underline"
                >
                  {result.fileUrl}
                </a>
              </p>
            )}
          </div>
        </div>
        {result.failed.length > 0 && (
          <ul className="text-xs text-red-700 space-y-1">
            {result.failed.map((f, i) => (
              <li key={i}>
                Page {f.pageReference}: {f.message}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/admin/questions"
            className="rounded-xl bg-[#2665D9] px-4 py-2 text-sm font-semibold text-white"
          >
            Open question bank
          </Link>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Question review</h1>
          <p className="text-sm text-slate-500 mt-1">
            {initial.meta.title || initial.extract.sourceDocument} ·{' '}
            {initial.extract.pageCount} pages · {drafts.length} drafts · keeping{' '}
            {keptCount}
            {unassignedFigures.length > 0
              ? ` · ${unassignedFigures.length} unassigned diagrams`
              : ''}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Untick cover pages and instructions. Verify formulas in the live
            math preview and attach any diagrams extracted from the pages.
          </p>
        </div>
        <button
          type="button"
          onClick={handleApprove}
          disabled={busy || keptCount === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2665D9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f54b8] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving…
            </>
          ) : (
            `Approve ${keptCount} selected`
          )}
        </button>
      </div>

      {initial.extract.ocrApplied && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-xs text-blue-800 flex items-center gap-2">
          <span className="font-semibold">OCR Pipeline Active:</span>
          Scanned images and vector page layers were processed to extract text,
          mathematical notation, and diagrams.
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* PDF Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-4">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
            PDF preview
          </div>
          <iframe
            title="PDF preview"
            src={initial.pdfObjectUrl}
            className="w-full h-[75vh] bg-slate-100"
          />
        </div>

        {/* Questions and Diagrams Column */}
        <div className="space-y-4">
          {/* Unassigned Diagrams Gallery */}
          {unassignedFigures.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                    Extracted Paper Diagrams ({unassignedFigures.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnassignedGallery((v) => !v)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                >
                  {showUnassignedGallery ? 'Hide Gallery' : 'Show Gallery'}
                </button>
              </div>

              {showUnassignedGallery && (
                <>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    These diagrams were clipped from the PDF pages. Use the
                    dropdown below each image to attach it to any question draft.
                  </p>
                  <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto p-1">
                    {unassignedFigures.map((fig) => (
                      <div
                        key={`${fig.page}-${fig.index}`}
                        className="bg-white border border-amber-200/90 rounded-xl p-2 space-y-1.5 shadow-xs w-44 shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolvePaperAssetUrl(fig.url)}
                          alt={`Extracted diagram page ${fig.page}`}
                          className="h-24 w-full object-contain rounded bg-slate-50 border border-slate-100"
                        />
                        <div className="text-[11px] text-slate-700 font-semibold truncate">
                          Page {fig.page} · #{fig.index}
                        </div>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const targetIdx = Number.parseInt(
                              e.target.value,
                              10
                            );
                            if (!Number.isNaN(targetIdx)) {
                              attachFigureToDraft(targetIdx, fig);
                            }
                          }}
                          className="w-full text-xs rounded border border-slate-200 px-1.5 py-1 bg-white text-slate-700 outline-none focus:border-[#2665D9]"
                        >
                          <option value="" disabled>
                            Attach to Draft…
                          </option>
                          {drafts.map((d, dIdx) => (
                            <option key={dIdx} value={dIdx}>
                              Draft {dIdx + 1} (Page {d.pageReference})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Draft Questions List */}
          {drafts.map((draft, index) => {
            const isPreview = mathPreviews[index] ?? false;

            return (
              <article
                key={index}
                className={`rounded-2xl border bg-white p-4 shadow-sm space-y-3 transition-colors ${
                  draft.keep
                    ? 'border-slate-200'
                    : 'border-slate-100 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Header row: Checkbox, Draft #, Page, View Toggle */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.keep}
                      onChange={(e) =>
                        patchDraft(index, { keep: e.target.checked })
                      }
                      className="rounded border-slate-300 text-[#2665D9] focus:ring-[#2665D9]"
                    />
                    <span>Draft {index + 1}</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Page {draft.pageReference}
                    </span>

                    {/* Math Preview Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleMathPreview(index)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                        isPreview
                          ? 'bg-blue-50 text-[#2665D9] border-blue-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={
                        isPreview
                          ? 'Switch to edit raw text'
                          : 'Preview LaTeX math equations'
                      }
                    >
                      {isPreview ? (
                        <>
                          <Code2 className="w-3 h-3" />
                          <span>Edit Text</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-[#2665D9]" />
                          <span>Math Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Badges: Marks, Topic, Difficulty, Confidence */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {draft.marks != null && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        draft.marksExplicit
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                      title={
                        draft.marksExplicit
                          ? 'Explicitly stated in paper'
                          : 'Inferred by AI'
                      }
                    >
                      {draft.marks} {draft.marks === 1 ? 'Mark' : 'Marks'}
                      {!draft.marksExplicit && (
                        <span className="text-[10px] opacity-75">
                          (inferred)
                        </span>
                      )}
                    </span>
                  )}

                  {draft.topic && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                      {draft.topic}
                    </span>
                  )}

                  {draft.difficulty && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                        draft.difficulty === 'HARD'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : draft.difficulty === 'MEDIUM'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {draft.difficulty}
                    </span>
                  )}

                  {draft.questionType && (
                    <span className="rounded-md bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px] font-medium">
                      {draft.questionType}
                    </span>
                  )}

                  {draft.classificationConfidence != null && (
                    <span className="text-[10px] text-slate-400 ml-auto">
                      AI confidence:{' '}
                      {Math.round(draft.classificationConfidence * 100)}%
                    </span>
                  )}
                </div>

                {/* Question Body: Raw Textarea OR KaTeX Math Preview */}
                {isPreview ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 min-h-[120px] text-sm text-slate-900 leading-relaxed overflow-x-auto">
                    <MarkdownMathRenderer content={draft.questionText} />
                  </div>
                ) : (
                  <textarea
                    rows={5}
                    value={draft.questionText}
                    onChange={(e) =>
                      patchDraft(index, { questionText: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2665D9] focus:ring-2 focus:ring-[#2665D9]/20 font-sans"
                    placeholder="Question text with math or instructions…"
                  />
                )}

                {/* Character count & Citation Page */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>
                    {draft.questionText.length.toLocaleString()} chars
                    {draft.questionText.length > 12000 ? (
                      <span className="text-red-600 font-semibold">
                        {' '}
                        — too long (max 12,000)
                      </span>
                    ) : null}
                  </span>
                  <label className="inline-flex items-center gap-1.5 ml-auto">
                    <span className="font-semibold text-slate-700">Page</span>
                    <input
                      value={draft.pageReference}
                      onChange={(e) =>
                        patchDraft(index, { pageReference: e.target.value })
                      }
                      className="w-14 rounded border border-slate-200 px-1.5 py-1 text-xs"
                      title="Source page for student citations"
                    />
                  </label>
                </div>

                {/* Detected Mathematical Formulas (LaTeX Preview) */}
                {draft.formulaLatex && draft.formulaLatex.length > 0 && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Extracted Mathematical Formulas (
                        {draft.formulaLatex.length})
                      </span>
                    </p>
                    <div className="space-y-1.5">
                      {draft.formulaLatex.map((formula, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-white/90 rounded-lg border border-blue-100 px-3 py-1.5 overflow-x-auto text-slate-900 text-sm"
                        >
                          <MarkdownMathRenderer content={`$$${formula}$$`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Diagrams for this Draft */}
                {draft.figures && draft.figures.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#2665D9]" />
                      <span>Attached Diagrams ({draft.figures.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {draft.figures.map((fig, figIdx) => (
                        <figure
                          key={`${fig.page}-${fig.index}-${figIdx}`}
                          className="relative border border-slate-200 rounded-lg bg-slate-50 p-1.5 space-y-1"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolvePaperAssetUrl(fig.url)}
                            alt={`Diagram from page ${fig.page}`}
                            className="max-h-28 max-w-[220px] rounded object-contain bg-white border border-slate-100"
                          />
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>
                              Page {fig.page} · #{fig.index}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                detachFigureFromDraft(index, figIdx)
                              }
                              className="text-red-600 hover:text-red-800 font-semibold px-1 py-0.5 rounded hover:bg-red-50 flex items-center gap-0.5"
                              title="Detach from this question"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Detach</span>
                            </button>
                          </div>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Attach from Unassigned Figures */}
                {unassignedFigures.length > 0 && (
                  <div className="pt-1">
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Plus className="w-3 h-3 text-[#2665D9]" />
                      <span className="font-medium text-slate-700">
                        Attach diagram:
                      </span>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const targetFig = unassignedFigures.find(
                            (f) =>
                              `${f.page}-${f.index}` === e.target.value
                          );
                          if (targetFig) {
                            attachFigureToDraft(index, targetFig);
                            e.target.value = '';
                          }
                        }}
                        className="text-xs rounded border border-slate-200 px-2 py-1 bg-white text-slate-700 outline-none focus:border-[#2665D9]"
                      >
                        <option value="" disabled>
                          Select from paper ({unassignedFigures.length}{' '}
                          available)…
                        </option>
                        {unassignedFigures.map((f) => (
                          <option
                            key={`${f.page}-${f.index}`}
                            value={`${f.page}-${f.index}`}
                          >
                            Page {f.page} · #{f.index} ({f.width}x{f.height})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

