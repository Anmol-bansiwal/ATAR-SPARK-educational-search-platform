'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Image as ImageIcon } from 'lucide-react';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import { resolvePaperAssetUrl } from '../../lib/api-client';

export interface PaperCardSource {
  sourceId: string;
  title: string;
  filename?: string;
  questionText?: string;
  figureUrls?: string[];
  mediaType?: string;
}

export type SourceDocumentPart = {
  type?: string;
  sourceId?: string;
  mediaType?: string;
  title?: string;
  filename?: string;
  providerMetadata?: {
    edusearch?: {
      questionText?: string | null;
      figureUrls?: string[];
      fromPaper?: boolean;
    };
  };
};

interface PaperCardProps {
  source?: PaperCardSource;
  part?: SourceDocumentPart;
  defaultOpen?: boolean;
}

/**
 * Expandable card for exam-paper question citations with diagrams and formatted math.
 * Implements §2 of the Paper Diagrams specification.
 */
export function PaperCard({ source: sourceProp, part, defaultOpen = false }: PaperCardProps) {
  const source: PaperCardSource = sourceProp ?? {
    sourceId: part?.sourceId ?? '',
    title: part?.title ?? 'Exam Question',
    filename: part?.filename,
    questionText: part?.providerMetadata?.edusearch?.questionText ?? undefined,
    figureUrls: part?.providerMetadata?.edusearch?.figureUrls ?? [],
    mediaType: part?.mediaType,
  };

  const [open, setOpen] = useState(defaultOpen);
  const [broken, setBroken] = useState<Record<string, true>>({});

  const rawFigures = source.figureUrls ?? [];
  const figures = rawFigures
    .filter((url) => typeof url === 'string' && url.trim().length > 0 && !broken[url])
    .slice(0, 8);

  const hasFigures = figures.length > 0;

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 text-left transition-colors cursor-pointer select-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              hasFigures ? 'bg-blue-100/90 text-[#2665D9]' : 'bg-slate-200/70 text-slate-600'
            }`}
          >
            {hasFigures ? (
              <ImageIcon className="w-3.5 h-3.5" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {source.title}
              {source.filename ? ` · ${source.filename}` : ''}
            </p>
            {hasFigures ? (
              <p className="text-[10px] text-blue-600 font-medium">
                Includes {figures.length} paper diagram{figures.length === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">Exam Paper Reference</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            {open ? 'Collapse' : 'View Question'}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3.5 border-t border-slate-100 bg-white">
          {source.questionText && (
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans overflow-x-auto">
              <MarkdownMathRenderer content={source.questionText} />
            </div>
          )}

          {hasFigures && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                Original diagram{figures.length === 1 ? '' : 's'} from exam paper ({figures.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {figures.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePaperAssetUrl(src)}
                      alt={`Diagram ${i + 1} from the exam paper`}
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 320,
                        objectFit: 'contain',
                      }}
                      className="rounded-lg bg-white"
                      onError={() =>
                        setBroken((prev) => ({ ...prev, [src]: true }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
