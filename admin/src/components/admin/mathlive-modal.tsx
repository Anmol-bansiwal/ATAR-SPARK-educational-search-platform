// admin/src/components/admin/mathlive-modal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import katex from 'katex';

interface MathLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLatex: string;
  isDisplay?: boolean;
  onSave: (latex: string) => void;
  title?: string;
}

export function MathLiveModal({
  isOpen,
  onClose,
  initialLatex,
  isDisplay = false,
  onSave,
  title = 'Visual Formula Editor',
}: MathLiveModalProps) {
  const mathFieldRef = useRef<HTMLElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mathliveReady, setMathliveReady] = useState(false);

  // Dynamically load MathLive in the browser
  useEffect(() => {
    let active = true;
    import('mathlive')
      .then(() => {
        if (active) setMathliveReady(true);
      })
      .catch((err) => {
        console.error('Failed to load MathLive:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Initialize math-field value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      // Brief delay to ensure web component has mounted in DOM
      const timer = setTimeout(() => {
        if (mathFieldRef.current) {
          const mf = mathFieldRef.current as any;
          if (typeof mf.setValue === 'function') {
            mf.setValue(initialLatex || '', { format: 'latex' });
          } else {
            mf.value = initialLatex || '';
          }
          if (typeof mf.focus === 'function') {
            mf.focus();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialLatex, mathliveReady]);

  if (!isOpen) return null;

  const handleSave = () => {
    setValidationError(null);
    const mf = mathFieldRef.current as any;
    if (!mf) return;

    // Part B.2: Always read with getValue('latex-expanded') (not .value).
    // The expanded form converts MathLive-specific macros into standard LaTeX that KaTeX renders.
    const latex =
      typeof mf.getValue === 'function'
        ? mf.getValue('latex-expanded')
        : mf.value || '';

    const trimmed = latex.trim();
    if (!trimmed) {
      setValidationError('This formula is not complete yet.');
      return;
    }

    // Validate with KaTeX before closing the modal
    try {
      katex.renderToString(trimmed, {
        throwOnError: true,
        displayMode: isDisplay,
      });
    } catch {
      setValidationError('This formula is not complete yet.');
      return;
    }

    onSave(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Edit the equation visually using standard notation or the on-screen keyboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* MathLive Field Container */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-700">
            Formula
          </label>
          <div className="rounded-xl border border-slate-200 p-2 bg-slate-50/50 focus-within:border-[#305282] focus-within:ring-2 focus-within:ring-[#305282]/20 transition-all">
            {React.createElement('math-field', {
              ref: mathFieldRef,
              style: {
                display: 'block',
                width: '100%',
                minHeight: '52px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                fontSize: '18px',
                outline: 'none',
              },
            })}
          </div>
          <span className="block text-[10px] text-slate-400">
            Click symbols or use fraction (<code>/</code>), power (<code>^</code>), square root (<code>\sqrt</code>), pi (<code>\pi</code>).
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-all cursor-pointer active:scale-95"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save formula</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MathLiveModal;
