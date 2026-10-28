'use client';

import React, { useState } from 'react';
import { Box, X } from 'lucide-react';
import { PaperCard, type PaperCardSource } from './paper-card';

export type ArtifactSource = PaperCardSource;

interface SourceArtifactProps {
  sources: ArtifactSource[];
}

/**
 * Sources artifact: renders expandable PaperCards with full text,
 * KaTeX math rendering, and exam paper diagrams.
 */
export function SourceArtifact({ sources }: SourceArtifactProps) {
  const [open, setOpen] = useState(true);

  if (sources.length === 0) return null;

  const figureCount = sources.reduce(
    (n, s) => n + (s.figureUrls?.filter((u: string) => Boolean(u?.trim())).length ?? 0),
    0
  );

  return (
    <div className="w-full max-w-2xl mr-auto mt-2 space-y-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-[#2665D9] transition-colors cursor-pointer select-none"
      >
        <Box className="w-3.5 h-3.5 text-[#2665D9]" />
        Sources · {sources.length}
        {figureCount > 0
          ? ` · ${figureCount} diagram${figureCount === 1 ? '' : 's'}`
          : ''}
      </button>

      {open && (
        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] overflow-hidden"
          role="region"
          aria-label="Exam Paper Sources"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#2665D9]/10 text-[#2665D9] flex items-center justify-center shrink-0">
                <Box className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Referenced Exam Questions ({sources.length})
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  Full text and original diagrams from cited exam papers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 transition-colors"
              aria-label="Close sources"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {sources.map((source, index) => {
              const hasFigures = (source.figureUrls?.length ?? 0) > 0;
              return (
                <PaperCard
                  key={source.sourceId || `source-${index}`}
                  source={source}
                  defaultOpen={hasFigures || index === 0}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

