// src/components/math/markdown-math-renderer.tsx
'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { normalizeMarkdownMath } from '../../lib/utils';
import { resolvePaperAssetUrl } from '../../lib/api-client';

interface MarkdownMathRendererProps {
  content: string;
  className?: string;
}

/**
 * Normalizes question markdown to guarantee MCQ options A, B, C, D appear on separate lines.
 */
function normalizeMcqLines(text: string): string {
  if (!text) return text;
  // Ensure options like "A. foo B. bar C. baz D. qux" are separated by double newlines
  return text.replace(/([^\n])\s+([A-D]\.|\([A-D]\))\s+/g, '$1\n\n$2 ');
}

export const MarkdownMathRenderer: React.FC<MarkdownMathRendererProps> = ({
  content,
  className = '',
}) => {
  const processedContent = useMemo(
    () => normalizeMarkdownMath(normalizeMcqLines(content)),
    [content]
  );

  return (
    <div
      className={`prose-sm sm:prose max-w-full min-w-0 break-words [overflow-wrap:anywhere] text-slate-800 leading-relaxed font-sans ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false, // Prevents throwing unhandled exceptions if an equation is malformed
              strict: false,
              trust: true,
            },
          ],
        ]}
        components={{
          // Headers
          h1: ({ node: _node, ...props }) => (
            <h1 className="font-bold text-base sm:text-lg text-slate-900 mt-5 mb-2.5" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-4 mb-2" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-3 mb-1.5" {...props} />
          ),
          // Paragraphs with MCQ option detection
          p: ({ node: _node, children, ...props }) => {
            const childArray = React.Children.toArray(children);
            const firstChild = childArray[0];

            // Detect multiple-choice option lines like "A. 4 g" or "(A) 4 g"
            if (typeof firstChild === 'string') {
              const mcqMatch = firstChild.match(/^([A-D]\.|\([A-D]\))\s*(.*)/);
              if (mcqMatch) {
                const otherChildren = childArray.slice(1);
                return (
                  <div className="ml-4 sm:ml-6 my-1.5 flex items-baseline gap-2.5 text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-[#155dfc] w-5 shrink-0 select-none">
                      {mcqMatch[1]}
                    </span>
                    <span className="leading-relaxed">
                      {mcqMatch[2]}
                      {otherChildren}
                    </span>
                  </div>
                );
              }
            }

            return (
              <p className="mb-2.5 leading-relaxed text-slate-700 text-xs sm:text-sm" {...props}>
                {children}
              </p>
            );
          },
          // Ordered Lists (Step-by-step mathematical reasoning)
          ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-3 my-3 text-xs sm:text-sm text-slate-700 leading-relaxed" {...props} />
          ),
          // Unordered Lists
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc pl-5 space-y-1.5 my-2.5 text-xs sm:text-sm text-slate-700" {...props} />
          ),
          // List Items
          li: ({ node: _node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          // Strong / Bold
          strong: ({ node: _node, ...props }) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
          // Blockquotes (e.g. "From your exam papers" quoted past paper stems)
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-3 border-[#305282] bg-slate-50/90 pl-3.5 pr-3 py-2.5 my-3 rounded-r-xl text-xs sm:text-sm text-slate-700 italic shadow-2xs"
              {...props}
            />
          ),
          // Markdown Images: render diagrams inside questions/replies per FRONTEND_GUIDE.md §1
          img: ({ node: _node, src, alt, ...props }) => {
            const srcStr = typeof src === 'string' ? src : '';
            const resolvedSrc = srcStr ? resolvePaperAssetUrl(srcStr) : '';
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={alt || 'Exam paper diagram'}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  maxHeight: '320px',
                  display: 'block',
                  objectFit: 'contain',
                }}
                className="my-3 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs"
                {...props}
              />
            );
          },
          // Table element support
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left" {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th className="bg-slate-50 px-3 py-2 font-semibold text-slate-800" {...props} />
          ),
          td: ({ node: _node, ...props }) => (
            <td className="px-3 py-2 border-t border-slate-100 text-slate-700" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMathRenderer;

/**
 * Standard alias matching FRONTEND_GUIDE.md §1.2 specification:
 * `<MathMarkdown>{content}</MathMarkdown>`
 */
export const MathMarkdown: React.FC<{ children: string; className?: string }> = ({
  children,
  className = '',
}) => <MarkdownMathRenderer content={children} className={className} />;
