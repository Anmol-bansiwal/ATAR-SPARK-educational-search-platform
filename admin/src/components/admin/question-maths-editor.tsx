// admin/src/components/admin/question-maths-editor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Undo2,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  Check,
  Edit3,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { apiClient, ApiError } from '../../lib/api-client';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import { MathLiveModal } from './mathlive-modal';
import {
  validateQuestionMath,
  replaceFormulaAtOccurrence,
} from '../../lib/utils';
import type { FormattedMathsResponse, UncertainMathsItem } from '../../types/admin';

interface QuestionMathsEditorProps {
  value: string;
  onChange: (next: string) => void;
  initialMathErrors?: string[];
  onMathErrorsChange?: (errors: string[]) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
  label?: string;
  defaultMode?: 'preview' | 'edit';
}

export function QuestionMathsEditor({
  value,
  onChange,
  initialMathErrors = [],
  onMathErrorsChange,
  placeholder = 'Enter question text...',
  minRows = 7,
  className = '',
  label = 'Question Text',
  defaultMode = 'preview',
}: QuestionMathsEditorProps) {
  // Part A: Open on Rendered Preview by Default ('preview')
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>(defaultMode);

  // Formatting & History state
  const [formatting, setFormatting] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState<UncertainMathsItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [mathErrors, setMathErrors] = useState<string[]>(initialMathErrors);
  const [apiError, setApiError] = useState<string | null>(null);
  const [alreadyFormattedNotice, setAlreadyFormattedNotice] = useState(false);
  const [fallbackToast, setFallbackToast] = useState<string | null>(null);

  // Part B: MathLive modal state
  const [mathliveModal, setMathliveModal] = useState<{
    isOpen: boolean;
    mode: 'edit' | 'insert';
    initialLatex: string;
    isDisplay: boolean;
    targetLatex?: string;
    occurrenceIndex?: number;
  }>({
    isOpen: false,
    mode: 'edit',
    initialLatex: '',
    isDisplay: false,
  });

  const previewRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initial / reactive KaTeX check on mount or when value changes externally
  useEffect(() => {
    if (initialMathErrors && initialMathErrors.length > 0) {
      setMathErrors(initialMathErrors);
    } else if (value.trim()) {
      const liveErrors = validateQuestionMath(value);
      setMathErrors(liveErrors);
    }
  }, [initialMathErrors, value]);

  // Part B.3: Intercept clicks on rendered KaTeX formulas in Preview mode
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const katexElem = target.closest('.katex') as HTMLElement | null;
    if (!katexElem) return;

    e.preventDefault();
    e.stopPropagation();

    // KaTeX embeds original LaTeX at .katex annotation[encoding="application/x-tex"]
    const annotation = katexElem.querySelector('annotation[encoding="application/x-tex"]');
    const targetLatex = annotation?.textContent?.trim() ?? '';
    if (!targetLatex) return;

    const isDisplay = Boolean(katexElem.closest('.katex-display'));

    // Count earlier .katex elements in preview container with the exact same annotation text
    const previewContainer = previewRef.current;
    let occurrenceIndex = 0;
    if (previewContainer) {
      const allKatex = Array.from(previewContainer.querySelectorAll('.katex'));
      const matching = allKatex.filter((el) => {
        const ann = el.querySelector('annotation[encoding="application/x-tex"]');
        return ann?.textContent?.trim() === targetLatex;
      });
      occurrenceIndex = matching.indexOf(katexElem);
      if (occurrenceIndex < 0) occurrenceIndex = 0;
    }

    setMathliveModal({
      isOpen: true,
      mode: 'edit',
      initialLatex: targetLatex,
      isDisplay,
      targetLatex,
      occurrenceIndex,
    });
  };

  // Part B: Save formula from MathLive modal back into questionText
  const handleMathLiveSave = (newLatex: string) => {
    if (mathliveModal.mode === 'edit' && mathliveModal.targetLatex !== undefined) {
      const res = replaceFormulaAtOccurrence(
        value,
        mathliveModal.targetLatex,
        newLatex,
        mathliveModal.isDisplay,
        mathliveModal.occurrenceIndex ?? 0
      );

      if (res.success) {
        onChange(res.text);
        const nextErrors = validateQuestionMath(res.text);
        setMathErrors(nextErrors);
        onMathErrorsChange?.(nextErrors);
      } else {
        // Fallback per Part B.3: Never guess, show toast
        setFallbackToast('Edit this formula in Edit text mode');
        setTimeout(() => setFallbackToast(null), 4000);
      }
    } else if (mathliveModal.mode === 'insert') {
      const textarea = textareaRef.current;
      let nextText = value;
      const inserted = mathliveModal.isDisplay ? `\n\n$$${newLatex}$$\n\n` : `$${newLatex}$`;

      if (textarea) {
        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;
        nextText = value.slice(0, start) + inserted + value.slice(end);
      } else {
        nextText = value ? `${value} ${inserted}` : inserted;
      }

      onChange(nextText);
      const nextErrors = validateQuestionMath(nextText);
      setMathErrors(nextErrors);
      onMathErrorsChange?.(nextErrors);
    }
  };

  // Part C: Format maths button for typed / pasted text
  const handleFormatMaths = async () => {
    const trimmed = value.trim();
    if (!trimmed || formatting) return;

    setFormatting(true);
    setApiError(null);
    setAlreadyFormattedNotice(false);

    try {
      const data: FormattedMathsResponse = await apiClient.formatMaths({ text: trimmed });

      if (data.changed) {
        setPreviousText(value);
        onChange(data.text);
      } else {
        setAlreadyFormattedNotice(true);
        setTimeout(() => setAlreadyFormattedNotice(false), 3000);
      }

      setUncertain(data.uncertain || []);
      setWarnings(data.warnings || []);

      // Part D: Combine backend check with live KaTeX check
      const liveErrors = validateQuestionMath(data.text || value);
      const combined = Array.from(new Set([...(data.mathErrors || []), ...liveErrors]));
      setMathErrors(combined);
      onMathErrorsChange?.(combined);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Could not format maths.';
      setApiError(msg);
    } finally {
      setFormatting(false);
    }
  };

  const handleUndo = () => {
    if (previousText === null) return;
    onChange(previousText);
    setPreviousText(null);
    setUncertain([]);
    setWarnings([]);
    const nextErrors = validateQuestionMath(previousText);
    setMathErrors(nextErrors);
    onMathErrorsChange?.(nextErrors);
    setAlreadyFormattedNotice(false);
  };

  // Textarea input handler with live KaTeX re-check (Part D)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    onChange(next);
    const liveErrors = validateQuestionMath(next);
    setMathErrors(liveErrors);
    onMathErrorsChange?.(liveErrors);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Interactive formula hover styling */}
      <style jsx global>{`
        .formula-interactive .katex {
          cursor: pointer;
          border-radius: 4px;
          padding: 1px 3px;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
        }
        .formula-interactive .katex:hover {
          background-color: rgba(48, 82, 130, 0.08);
          box-shadow: 0 0 0 1px rgba(48, 82, 130, 0.25);
        }
      `}</style>

      {/* Top Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-700">{label}</label>
          {mathErrors.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              {mathErrors.length} formula issue{mathErrors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {alreadyFormattedNotice && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium animate-in fade-in">
              <Check className="w-3 h-3" />
              Already formatted
            </span>
          )}

          {fallbackToast && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-in fade-in">
              <Info className="w-3 h-3" />
              {fallbackToast}
            </span>
          )}

          {/* Edit Mode specific controls */}
          {viewMode === 'edit' && (
            <>
              {previousText !== null && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                  title="Revert to previous text"
                >
                  <Undo2 className="w-3 h-3 text-slate-500" />
                  <span>Undo format</span>
                </button>
              )}

              {/* Part B: Insert formula button */}
              <button
                type="button"
                onClick={() =>
                  setMathliveModal({
                    isOpen: true,
                    mode: 'insert',
                    initialLatex: '',
                    isDisplay: false,
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="Insert a formula visually using MathLive"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Insert formula</span>
              </button>

              {/* Part C: Format maths button */}
              <button
                type="button"
                onClick={handleFormatMaths}
                disabled={formatting || !value.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                style={{
                  background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
                }}
                title="Format mathematical expressions"
              >
                {formatting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Formatting maths…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Format maths</span>
                  </>
                )}
              </button>

              {/* Part A: Done button to switch back to preview */}
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </>
          )}

          {/* Part A: Preview Mode 'Edit text' button */}
          {viewMode === 'preview' && (
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#305282]" />
              <span>Edit text</span>
            </button>
          )}
        </div>
      </div>

      {/* API / Service Error Alert */}
      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Formatting Error</span>
            <p className="text-[11px] text-rose-700 leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {/* Formula Errors Banner (Part D) */}
      {mathErrors.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-800 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Please resolve these formula issues before saving:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-700">
            {mathErrors.map((err, i) => (
              <li key={i} className="font-mono">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Verification Warnings Banner */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Please review — comparison signs or numbers were modified:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-800">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ambiguous Expressions Banner */}
      {uncertain.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-blue-800 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Please verify these expressions in the preview:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-blue-800">
            {uncertain.map((u, i) => (
              <li key={i}>
                <code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[10px] text-blue-900">
                  {u.expression}
                </code>
                {' — '}
                <span>{u.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Part A: Default Rendered Preview Mode */}
      {viewMode === 'preview' ? (
        <div className="space-y-1.5">
          <div
            ref={previewRef}
            onClick={handlePreviewClick}
            className="formula-interactive min-h-36 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-sans hover:border-slate-300 transition-colors"
          >
            <MarkdownMathRenderer content={value || '_Empty question text_'} />
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Click any equation above to edit visually with the formula keyboard.</span>
            <span>Click &quot;Edit text&quot; to edit full text.</span>
          </p>
        </div>
      ) : (
        /* Edit Mode: Side-by-Side Editor & Live Rendered Preview */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
          <div className="space-y-1">
            <span className="block text-[10px] font-medium text-slate-400">
              Editor
            </span>
            <textarea
              ref={textareaRef}
              rows={minRows}
              maxLength={20000}
              value={value}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              className="w-full h-48 rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282] focus:border-transparent transition-all resize-y"
            />
          </div>

          <div className="space-y-1">
            <span className="block text-[10px] font-medium text-slate-400">
              Live Preview
            </span>
            <div
              ref={previewRef}
              onClick={handlePreviewClick}
              className="formula-interactive h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs font-sans"
            >
              <MarkdownMathRenderer content={value || '_Empty question text_'} />
            </div>
          </div>
        </div>
      )}

      {/* Part B: MathLive Visual Formula Modal Dialog */}
      <MathLiveModal
        isOpen={mathliveModal.isOpen}
        onClose={() => setMathliveModal((prev) => ({ ...prev, isOpen: false }))}
        initialLatex={mathliveModal.initialLatex}
        isDisplay={mathliveModal.isDisplay}
        onSave={handleMathLiveSave}
        title={mathliveModal.mode === 'insert' ? 'Insert Formula' : 'Edit Formula'}
      />
    </div>
  );
}

export default QuestionMathsEditor;
