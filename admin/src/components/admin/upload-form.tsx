'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  FileUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ApiError, apiClient } from '../../lib/api-client';
import { setAdminPending } from '../../lib/admin-session';
import { guessPaperMetaFromFilename } from '../../lib/guess-paper-meta';
import { AlertBanner } from '../ui/alert-banner';
import { cn } from '../../lib/utils';
import type {
  Difficulty,
  ExtractResponse,
  PaperUploadMeta,
  QuestionType,
  TaxonomyResponse,
} from '../../types/admin';

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB per §2.2

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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  // Taxonomy loaded from GET /admin/taxonomy
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [meta, setMeta] = useState<PaperUploadMeta | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Fetch taxonomy on mount to populate the subject list
  useEffect(() => {
    let active = true;
    async function loadTaxonomy() {
      try {
        setLoadingTaxonomy(true);
        const data = await apiClient.getTaxonomy();
        if (active) {
          setTaxonomy(data);
          if (data.subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(data.subjects[0].name);
          }
        }
      } catch (err) {
        console.warn('Failed to load taxonomy for upload form:', err);
      } finally {
        if (active) setLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
    return () => {
      active = false;
    };
  }, []);

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const onField = <K extends keyof PaperUploadMeta>(key: K, value: PaperUploadMeta[K]) => {
    setMeta((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onPickFile = (picked: File | null) => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    setFile(picked);
    setError(null);
    setWarning(null);

    if (picked) {
      const guessed = guessPaperMetaFromFilename(picked.name);
      setMeta(guessed);
      // Auto-select subject from taxonomy if guessed subject matches
      if (taxonomy?.subjects) {
        const match = taxonomy.subjects.find(
          (s) => s.name.toLowerCase() === guessed.subject.toLowerCase()
        );
        if (match) {
          setSelectedSubject(match.name);
        } else if (guessed.subject && guessed.subject !== 'General') {
          setSelectedSubject(guessed.subject);
        }
      }
      try {
        const url = URL.createObjectURL(picked);
        setPdfPreviewUrl(url);
      } catch {
        // Preview creation failure non-blocking
      }
    } else {
      setMeta(null);
    }
  };

  const handleExtract = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setWarning(null);

    if (!file) {
      setError('Choose a PDF exam paper first.');
      return;
    }
    if (!selectedSubject.trim()) {
      setError('Subject is required to extract and classify questions.');
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
    setProgressStatus('Uploading paper and starting extraction...');

    try {
      await assertPdfMagic(file);

      const extract: ExtractResponse = await apiClient.extractPaper(
        file,
        selectedSubject.trim(),
        (pagesRead, pageCount) => {
          setProgressStatus(`Reading page ${pagesRead} of ${pageCount}...`);
        }
      );

      if (!extract.questions || extract.questions.length === 0) {
        throw new Error(
          'No questions could be read from this PDF. Please ensure the paper contains selectable text and try again.'
        );
      }

      // Check failedPages per §2.2
      if (extract.failedPages && extract.failedPages.length > 0) {
        setWarning(
          `Pages ${extract.failedPages.join(
            ', '
          )} could not be read. Please review those questions manually in the next step.`
        );
      }

      setAdminPending({
        file,
        meta: {
          title: meta?.title || file.name.replace(/\.pdf$/i, ''),
          subject: selectedSubject.trim(),
          topic: meta?.topic || '',
          subtopic: meta?.subtopic || '',
          examYear: String(extract.examYear || meta?.examYear || new Date().getFullYear()),
          examType: meta?.examType || 'HSC',
          difficulty: meta?.difficulty || 'MEDIUM',
          questionType: meta?.questionType || 'SHORT',
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
      setProgressStatus(null);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282] focus:border-transparent transition-all';

  return (
    <form onSubmit={handleExtract} className="space-y-6">
      {error && (
        <AlertBanner
          type="error"
          title="Extraction Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {warning && (
        <AlertBanner
          type="warning"
          title="Partial Read Warning"
          message={warning}
          onDismiss={() => setWarning(null)}
        />
      )}

      {/* Main File Drop Zone Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Upload Exam Paper (PDF)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pick a complete exam paper PDF (up to 10 MB and 80 pages). Questions, diagrams, marks,
            and formulas are automatically extracted and classified.
          </p>
        </div>

        {/* Required Subject Selector per §2.1 */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Subject <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            {loadingTaxonomy ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#305282]" />
                Loading taxonomy subjects...
              </div>
            ) : taxonomy && taxonomy.subjects.length > 0 ? (
              <select
                className={inputClass}
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  if (meta) onField('subject', e.target.value);
                }}
                required
              >
                <option value="" disabled>
                  -- Select a subject from taxonomy --
                </option>
                {taxonomy.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.questionCount} questions in bank)
                  </option>
                ))}
                {taxonomy.otherSubjects?.map((os) => (
                  <option key={os.name} value={os.name}>
                    {os.name} ({os.questionCount} in bank)
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                placeholder="e.g. Physics, Chemistry, Mathematics"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  if (meta) onField('subject', e.target.value);
                }}
                required
              />
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Classification uses the chosen subject&apos;s topics and subtopics from the taxonomy.
          </p>
        </div>

        {/* File Drop Target */}
        <label className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 cursor-pointer hover:border-[#305282] hover:bg-slate-100/60 transition-all group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#305282] group-hover:scale-105 transition-transform">
            <FileUp className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {file ? file.name : 'Click or drag PDF exam paper here'}
          </span>
          <span className="text-[11px] text-slate-500">
            {file ? `${(file.size / 1024).toFixed(0)} KB · Ready to extract` : 'PDF only, max 10 MB'}
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {/* In-browser PDF Preview per §2.1 */}
        {file && pdfPreviewUrl && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#305282]" />
                <span className="text-xs font-semibold text-slate-800">
                  In-Browser PDF Preview ({file.name})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfPreview((v) => !v)}
                className="text-xs text-[#305282] hover:underline font-medium"
              >
                {showPdfPreview ? 'Hide preview' : 'Show preview'}
              </button>
            </div>
            {showPdfPreview && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
                <object
                  data={pdfPreviewUrl}
                  type="application/pdf"
                  className="w-full h-80 sm:h-96"
                >
                  <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                    <p className="text-xs text-slate-500 mb-2">
                      PDF preview is ready in your browser.
                    </p>
                    <a
                      href={pdfPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#305282] hover:underline"
                    >
                      Open PDF in new tab
                    </a>
                  </div>
                </object>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Overrides Accordion */}
      {meta && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Optional metadata overrides (auto-detected from filename)</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform',
                showAdvanced && 'rotate-180'
              )}
            />
          </button>
          {showAdvanced && (
            <div className="border-t border-slate-100 p-5 grid sm:grid-cols-2 gap-4">
              <Field label="Paper Title">
                <input
                  className={inputClass}
                  value={meta.title}
                  onChange={(e) => onField('title', e.target.value)}
                />
              </Field>
              <Field label="Exam Year">
                <input
                  className={inputClass}
                  type="number"
                  min={1950}
                  max={2100}
                  value={meta.examYear}
                  onChange={(e) => onField('examYear', e.target.value)}
                />
              </Field>
              <Field label="Exam / Board">
                <input
                  className={inputClass}
                  value={meta.examType}
                  onChange={(e) => onField('examType', e.target.value)}
                  placeholder="e.g. HSC, CBSE, VCE"
                />
              </Field>
              <Field label="Default Difficulty">
                <select
                  className={inputClass}
                  value={meta.difficulty}
                  onChange={(e) => onField('difficulty', e.target.value as Difficulty)}
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </Field>
              <Field label="Default Question Type">
                <select
                  className={inputClass}
                  value={meta.questionType}
                  onChange={(e) => onField('questionType', e.target.value as QuestionType)}
                >
                  <option value="MCQ">MCQ (Multiple Choice)</option>
                  <option value="SHORT">SHORT (Short Answer)</option>
                  <option value="LONG">LONG (Extended Response)</option>
                </select>
              </Field>
            </div>
          )}
        </div>
      )}

      {/* Action / Extract Button with Polling Progress */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-slate-500">
          Extraction reads questions into draft mode. Nothing is saved until you review and approve.
        </p>

        <button
          type="submit"
          disabled={!file || !selectedSubject.trim() || busy}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          style={{
            background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
          }}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progressStatus || 'Extracting questions...'}</span>
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              <span>Extract Questions</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
