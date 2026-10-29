// admin/src/components/admin/question-maths-editor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Undo2,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  Check,
} from 'lucide-react';
import { apiClient, ApiError } from '../../lib/api-client';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import type { FormattedMathsResponse, UncertainMathsItem } from '../../types/admin';

interface QuestionMathsEditorProps {
  value: string;
  onChange: (next: string) => void;
  initialMathErrors?: string[];
  placeholder?: string;
  minRows?: number;
  className?: string;
  label?: string;
}

export function QuestionMathsEditor({
  value,
  onChange,
  initialMathErrors = [],
  placeholder = "Type question text or plain maths (e.g. 1 < Re(z) <= 3, 2NO2 -> N2O4) and click 'Format maths'…",
  minRows = 7,
  className = '',
  label = 'Question Text (Markdown + LaTeX)',
}: QuestionMathsEditorProps) {
  const [formatting, setFormatting] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState<UncertainMathsItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [mathErrors, setMathErrors] = useState<string[]>(initialMathErrors);
  const [apiError, setApiError] = useState<string | null>(null);
  const [alreadyFormattedNotice, setAlreadyFormattedNotice] = useState(false);

  // Sync initial math errors if props change
  useEffect(() => {
    if (initialMathErrors && initialMathErrors.length > 0) {
      setMathErrors(initialMathErrors);
    }
  }, [initialMathErrors]);

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
      setMathErrors(data.mathErrors || []);
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
    setMathErrors(initialMathErrors);
    setAlreadyFormattedNotice(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar / Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-700">{label}</label>
          {mathErrors.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              {mathErrors.length} formula error{mathErrors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {alreadyFormattedNotice && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium animate-in fade-in">
              <Check className="w-3 h-3" />
              Already formatted
            </span>
          )}

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

          <button
            type="button"
            onClick={handleFormatMaths}
            disabled={formatting || !value.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
            title="Convert plain maths to LaTeX and format formulas"
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
        </div>
      </div>

      {/* API / Service Error Alert */}
      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Maths Formatter Error</span>
            <p className="text-[11px] text-rose-700 leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {/* KaTeX Math Errors Banner */}
      {mathErrors.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-800 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Fix these formula errors before saving or approving:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-700">
            {mathErrors.map((err, i) => (
              <li key={i} className="font-mono">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Verification Warnings Banner (Comparison signs or numbers altered) */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Check carefully — comparison signs or numbers changed:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-800">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ambiguous / Uncertain Expressions Banner */}
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

      {/* Side-by-Side Editor & Live Rendered Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <div className="space-y-1">
          <span className="block text-[10px] font-medium text-slate-400">
            Raw Markdown Editor
          </span>
          <textarea
            rows={minRows}
            maxLength={20000}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              // Clear stale server mathErrors once the teacher edits the text
              if (mathErrors.length > 0) setMathErrors([]);
            }}
            placeholder={placeholder}
            className="w-full h-44 rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282] focus:border-transparent transition-all resize-y"
          />
        </div>

        <div className="space-y-1">
          <span className="block text-[10px] font-medium text-slate-400">
            Live KaTeX Preview
          </span>
          <div className="h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs font-sans">
            <MarkdownMathRenderer content={value || '_Empty question text_'} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionMathsEditor;

