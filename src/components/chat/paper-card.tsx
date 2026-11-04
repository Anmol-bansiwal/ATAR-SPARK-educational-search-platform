'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Image as ImageIcon, Layers, Loader2 } from 'lucide-react';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import { apiClient, resolvePaperAssetUrl } from '../../lib/api-client';
import { extractQuestionPartsMeta } from '../../lib/question-parts';

export interface PaperCardSource {
  sourceId: string;
  title: string;
  filename?: string;
  questionText?: string;
  questionMarkdown?: boolean;
  figureUrls?: string[];
  mediaType?: string;
  card?: string | null;
  questionNumber?: number | string | null;
  partLabel?: string | null;
  sourceDocument?: string | null;
}

export type SourceDocumentPart = {
  type?: string;
  sourceId?: string;
  mediaType?: string;
  title?: string;
  filename?: string;
  questionMarkdown?: boolean;
  providerMetadata?: {
    edusearch?: {
      questionText?: string | null;
      questionMarkdown?: boolean;
      figureUrls?: string[];
      card?: string | null;
      fromPaper?: boolean;
      questionNumber?: number | string | null;
      partLabel?: string | null;
      sourceDocument?: string | null;
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
  const rawCard = part?.providerMetadata?.edusearch?.card ?? sourceProp?.card;
  let card: string | null | undefined;
  let cardTitle: string | undefined;

  if (rawCard === null) {
    card = null;
  } else if (typeof rawCard === 'string') {
    card = rawCard;
  } else if (rawCard && typeof rawCard === 'object' && 'markdown' in rawCard) {
    const cardObj = rawCard as { title?: unknown; markdown?: unknown };
    card = typeof cardObj.markdown === 'string' ? cardObj.markdown : undefined;
    cardTitle = typeof cardObj.title === 'string' ? cardObj.title : undefined;
  }

  // Sub-parts merged into a master card have card === null and should be skipped
  if (card === null) {
    return null;
  }

  const source: PaperCardSource = sourceProp ?? {
    sourceId: part?.sourceId ?? '',
    title: cardTitle || part?.title || 'Exam Question',
    filename: part?.filename,
    questionText: part?.providerMetadata?.edusearch?.questionText ?? undefined,
    questionMarkdown:
      part?.providerMetadata?.edusearch?.questionMarkdown ??
      part?.questionMarkdown ??
      true,
    figureUrls: part?.providerMetadata?.edusearch?.figureUrls ?? [],
    mediaType: part?.mediaType,
    card,
    questionNumber: part?.providerMetadata?.edusearch?.questionNumber,
    partLabel: part?.providerMetadata?.edusearch?.partLabel,
    sourceDocument: part?.providerMetadata?.edusearch?.sourceDocument,
  };

  const meta = useMemo(
    () =>
      extractQuestionPartsMeta(
        source.questionNumber,
        source.partLabel,
        source.questionText,
        source.title
      ),
    [source]
  );

  const [open, setOpen] = useState(defaultOpen);
  const [broken, setBroken] = useState<Record<string, true>>({});
  const [extraParts, setExtraParts] = useState<
    Array<{ partLabel: string; questionText: string; figureUrls?: string[] }>
  >([]);
  const [showExtraParts, setShowExtraParts] = useState(false);
  const [isFetchingParts, setIsFetchingParts] = useState(false);
  const [partsFetchMsg, setPartsFetchMsg] = useState<string | null>(null);

  const doc = source.filename || source.sourceDocument;

  const handleToggleOrFetchParts = async () => {
    if (extraParts.length > 0) {
      setShowExtraParts((prev) => !prev);
      return;
    }
    if (!meta.questionNumber || !doc || isFetchingParts) return;
    setIsFetchingParts(true);
    setPartsFetchMsg(null);
    try {
      const siblings = await apiClient.fetchSiblingParts(doc, meta.questionNumber);
      if (siblings.length > 0) {
        const parts = siblings.map((s) => {
          const sMeta = extractQuestionPartsMeta(s.questionNumber, s.partLabel, s.questionText);
          return {
            partLabel: sMeta.partLabel || '(main)',
            questionText: s.questionText,
            figureUrls: s.figureUrls,
          };
        });
        setExtraParts(parts);
        setShowExtraParts(true);
      } else {
        setPartsFetchMsg(`No additional parts found for Question ${meta.questionNumber} in this paper.`);
      }
    } catch (err) {
      console.error('[PaperCard] Failed to fetch sibling parts:', err);
      setPartsFetchMsg('Could not load additional parts.');
    } finally {
      setIsFetchingParts(false);
    }
  };

  const allPartsLabel = useMemo(() => {
    if (extraParts.length === 0) return '';
    return extraParts
      .map((p) => p.partLabel.replace(/[()]/g, ''))
      .filter((l) => l !== 'main')
      .join(', ');
  }, [extraParts]);

  const contentToRender = source.card || source.questionText;

  const rawFigures = source.figureUrls ?? [];
  const figures = rawFigures
    .filter((url) => typeof url === 'string' && url.trim().length > 0 && !broken[url])
    .filter((url) => !contentToRender || !contentToRender.includes(url))
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
            <p
              className="text-xs font-semibold text-slate-900 truncate"
              title={`${source.title}${source.filename && !source.title.includes(source.filename) ? ` · ${source.filename}` : ''}`}
            >
              {source.title}
              {source.filename && !source.title.includes(source.filename) ? ` · ${source.filename}` : ''}
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
          {contentToRender && (
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans overflow-x-auto select-text">
              {source.card || source.questionMarkdown !== false ? (
                <MarkdownMathRenderer content={contentToRender} />
              ) : (
                <p className="whitespace-pre-wrap font-sans text-slate-700">
                  {contentToRender}
                </p>
              )}
            </div>
          )}

          {/* Action button to view all parts if question has parts or questionNumber */}
          {meta.questionNumber && doc && !source.card && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 select-none">
              <button
                type="button"
                disabled={isFetchingParts}
                onClick={handleToggleOrFetchParts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-[#155dfc] text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              >
                {isFetchingParts ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                <span>
                  {isFetchingParts
                    ? `Loading parts of Question ${meta.questionNumber}...`
                    : showExtraParts
                    ? `Hide additional parts of Question ${meta.questionNumber}`
                    : `View all parts of Question ${meta.questionNumber}${allPartsLabel ? ` (${allPartsLabel})` : ''}`}
                </span>
              </button>
              {partsFetchMsg && (
                <span className="text-[11px] text-slate-400 italic">{partsFetchMsg}</span>
              )}
            </div>
          )}

          {/* Expanded extra parts */}
          {showExtraParts && extraParts.length > 0 && (
            <div className="space-y-3 pt-2">
              {extraParts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#155dfc] font-bold text-xs">
                    Part {p.partLabel}
                  </span>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans overflow-x-auto select-text">
                    <MarkdownMathRenderer content={p.questionText} />
                  </div>
                </div>
              ))}
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
