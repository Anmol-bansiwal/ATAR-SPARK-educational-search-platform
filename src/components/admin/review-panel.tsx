'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
import type { ApprovePaperResponse, ReviewDraft } from '../../types/admin';

const MAX_APPROVE = 100;

export function AdminReviewPanel({
  initial,
}: {
  initial: AdminPendingSession;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<ReviewDraft[]>(initial.drafts);
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
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Untick cover pages and instructions. <strong>Page</strong> is for
            student citations — leave it. Subtopic is optional (blank is fine).
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

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-4">
          <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
            PDF preview
          </div>
          <iframe
            title="PDF preview"
            src={initial.pdfObjectUrl}
            className="w-full h-[70vh] bg-slate-100"
          />
        </div>

        <div className="space-y-4">
          {drafts.map((draft, index) => (
            <article
              key={index}
              className={`rounded-2xl border bg-white p-4 shadow-sm space-y-3 ${
                draft.keep ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.keep}
                    onChange={(e) =>
                      patchDraft(index, { keep: e.target.checked })
                    }
                    className="rounded border-slate-300"
                  />
                  Draft {index + 1}
                </label>
                <span className="text-[11px] text-slate-400">
                  Page {draft.pageReference}
                </span>
              </div>
              <textarea
                rows={5}
                value={draft.questionText}
                onChange={(e) =>
                  patchDraft(index, { questionText: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2665D9] focus:ring-2 focus:ring-[#2665D9]/20"
              />
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
                <label className="inline-flex items-center gap-1.5">
                  <span className="font-semibold">Page</span>
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
              {draft.figures?.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {draft.figures.map((fig) => (
                    <figure
                      key={`${fig.page}-${fig.index}`}
                      className="space-y-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvePaperAssetUrl(fig.url)}
                        alt={`Original figure from page ${fig.page}`}
                        className="max-h-28 rounded-lg border border-slate-200 bg-slate-50"
                      />
                      <figcaption className="text-[10px] text-slate-500">
                        Page {fig.page} · will publish with this question
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
