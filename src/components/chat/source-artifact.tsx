'use client';

import React, { useState } from 'react';
import { Box, FileText, X } from 'lucide-react';
import { resolvePaperAssetUrl } from '../../lib/api-client';

export type ArtifactSource = {
  sourceId: string;
  title: string;
  filename?: string;
  /** Bank question text cited for this source. */
  questionText?: string;
  /** Real figures from the uploaded paper (not AI-generated). */
  figureUrls?: string[];
};

interface SourceArtifactProps {
  sources: ArtifactSource[];
}

/**
 * ChatGPT-style sources artifact: citation chips + paper diagrams when present.
 */
export function SourceArtifact({ sources }: SourceArtifactProps) {
  const [open, setOpen] = useState(true);
  const [broken, setBroken] = useState<Record<string, true>>({});

  if (sources.length === 0) return null;

  const figureCount = sources.reduce(
    (n, s) =>
      n +
      (s.figureUrls ?? []).filter((url) => url && !broken[url]).length,
    0
  );

  return (
    <div className="w-full max-w-2xl mr-auto mt-2 space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-[#2665D9] transition-colors"
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
          role="dialog"
          aria-label="Source artifact"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#2665D9]/10 text-[#2665D9] flex items-center justify-center shrink-0">
                <Box className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Sources
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  From your exam archive
                  {figureCount > 0 ? ' · original figures from the paper' : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
              aria-label="Close artifact"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ul className="p-4 space-y-3">
            {sources.map((s) => {
              const visibleFigures = (s.figureUrls ?? []).filter(
                (url) => url && !broken[url]
              );
              return (
                <li
                  key={s.sourceId}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-[#2665D9] mt-0.5 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {s.title}
                      </p>
                      {s.filename && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {s.filename}
                        </p>
                      )}
                      {s.questionText && (
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                          {s.questionText}
                        </p>
                      )}
                    </div>
                  </div>
                  {visibleFigures.length > 0 && (
                    <div className="pl-6 space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Original figure from the paper
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {visibleFigures.map((url) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={url}
                            src={resolvePaperAssetUrl(url)}
                            alt="Original figure from the paper"
                            className="max-h-48 max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                            onError={() =>
                              setBroken((prev) => ({ ...prev, [url]: true }))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
