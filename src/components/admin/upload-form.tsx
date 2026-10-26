'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, FileUp, Loader2 } from 'lucide-react';
import { ApiError, apiClient } from '../../lib/api-client';
import { setAdminPending } from '../../lib/admin-session';
import { guessPaperMetaFromFilename } from '../../lib/guess-paper-meta';
import type {
  ApiDifficulty,
  ApiQuestionType,
  PaperUploadMeta,
} from '../../types/admin';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

function looksLikePdf(file: File): boolean {
  if (file.type === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

async function assertPdfMagic(file: File): Promise<void> {
  const head = await file.slice(0, 5).arrayBuffer();
  const sig = String.fromCharCode(...new Uint8Array(head));
  if (!sig.startsWith('%PDF')) {
    throw new Error('File does not look like a PDF (missing %PDF header).');
  }
}

export function AdminUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PaperUploadMeta | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onField = <K extends keyof PaperUploadMeta>(key: K, value: PaperUploadMeta[K]) => {
    setMeta((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onPickFile = (picked: File | null) => {
    setFile(picked);
    setError(null);
    if (picked) {
      setMeta(guessPaperMetaFromFilename(picked.name));
    } else {
      setMeta(null);
    }
  };

  const handleExtract = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file || !meta) {
      setError('Choose a PDF exam paper first.');
      return;
    }
    if (!looksLikePdf(file)) {
      setError('Only PDF files are accepted.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('PDF must be 10 MB or smaller.');
      return;
    }

    setBusy(true);
    try {
      await assertPdfMagic(file);
      const extract = await apiClient.extractPaper(file);
      if (!extract.questions?.length) {
        throw new Error(
          'No questions could be read from this PDF. Text-based PDFs work best (scanned/image-only papers need OCR later).'
        );
      }
      setAdminPending({
        file,
        meta: {
          ...meta,
          subject: meta.subject.trim() || 'General',
          topic: meta.topic.trim() || 'General',
          title: meta.title.trim() || file.name.replace(/\.pdf$/i, ''),
        },
        extract,
      });
      router.push('/admin/review');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Extraction failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleExtract} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Exam paper PDF</h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload the complete question paper. We pull questions from the file.
            Subject / year are guessed from the filename when possible; if
            MCQ/SHORT/difficulty are not labelled in the paper, safe defaults are
            used (you can change them below).
          </p>
        </div>
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-10 cursor-pointer hover:border-[#2665D9]/50 transition-colors">
          <FileUp className="w-8 h-8 text-[#2665D9]" />
          <span className="text-sm font-semibold text-slate-700">
            {file ? file.name : 'Choose complete exam paper PDF'}
          </span>
          {file && (
            <span className="text-[11px] text-slate-500">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          )}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {meta && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Auto-detected from filename</p>
            <p>
              Subject: <strong>{meta.subject}</strong>
              {' · '}
              Year: <strong>{meta.examYear}</strong>
              {' · '}
              Type: <strong>{meta.examType}</strong>
              {' · '}
              Default question style: <strong>{meta.questionType}</strong>
              {' · '}
              Difficulty: <strong>{meta.difficulty}</strong>
            </p>
            <p className="text-slate-500">
              Mixed papers (MCQ + short + long) are fine — missing labels fall
              back to SHORT / MEDIUM until per-question detection is added.
            </p>
          </div>
        )}
      </div>

      {meta && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Optional overrides (only if auto-detect is wrong)</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showAdvanced && (
            <div className="border-t border-slate-100 p-5 grid sm:grid-cols-2 gap-4">
              <Field label="Subject">
                <input
                  className={inputClass}
                  value={meta.subject}
                  onChange={(e) => onField('subject', e.target.value)}
                />
              </Field>
              <Field label="Topic">
                <input
                  className={inputClass}
                  value={meta.topic}
                  onChange={(e) => onField('topic', e.target.value)}
                />
              </Field>
              <Field label="Exam year">
                <input
                  className={inputClass}
                  type="number"
                  min={1950}
                  max={2100}
                  value={meta.examYear}
                  onChange={(e) => onField('examYear', e.target.value)}
                />
              </Field>
              <Field label="Exam / board">
                <input
                  className={inputClass}
                  value={meta.examType}
                  onChange={(e) => onField('examType', e.target.value)}
                />
              </Field>
              <Field label="Default difficulty (if not in paper)">
                <select
                  className={inputClass}
                  value={meta.difficulty}
                  onChange={(e) =>
                    onField('difficulty', e.target.value as ApiDifficulty)
                  }
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </Field>
              <Field label="Default question type (if not in paper)">
                <select
                  className={inputClass}
                  value={meta.questionType}
                  onChange={(e) =>
                    onField('questionType', e.target.value as ApiQuestionType)
                  }
                >
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT">SHORT</option>
                  <option value="LONG">LONG</option>
                </select>
              </Field>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !file}
        className="inline-flex items-center gap-2 rounded-xl bg-[#2665D9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f54b8] disabled:opacity-60 transition-colors"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Reading paper…
          </>
        ) : (
          'Extract questions from paper'
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2665D9] focus:ring-2 focus:ring-[#2665D9]/20';
