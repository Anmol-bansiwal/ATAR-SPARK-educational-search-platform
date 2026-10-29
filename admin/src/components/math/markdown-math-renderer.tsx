// admin/src/components/math/markdown-math-renderer.tsx
'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { cleanMathQuantities, normalizeMarkdownMath, cn } from '../../lib/utils';

interface MarkdownMathRendererProps {
  content: string;
  className?: string;
}

export const MarkdownMathRenderer: React.FC<MarkdownMathRendererProps> = ({
  content,
  className = '',
}) => {
  const processedContent = useMemo(() => {
    // 1. Clean accidental LaTeX on standalone physical quantities (e.g. $120\ \mathrm{g}$ -> 120 g)
    const cleaned = cleanMathQuantities(content);
    // 2. Normalize display math blocks $$...$$ to KaTeX notation safely
    return normalizeMarkdownMath(cleaned);
  }, [content]);

  return (
    <div
      className={cn(
        'prose-sm sm:prose max-w-full min-w-0 break-words [overflow-wrap:anywhere] text-slate-800 leading-relaxed font-sans',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false,
              strict: false,
              trust: true,
            },
          ],
        ]}
        components={{
          h3: ({ node: _node, ...props }) => (
            <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-5 mb-2" {...props} />
          ),
          p: ({ node: _node, children, ...props }) => {
            const childArray = React.Children.toArray(children);
            const firstChild = childArray[0];

            // Detect multiple-choice option lines like "A. 4 g" or "(A) 4 g"
            if (typeof firstChild === 'string') {
              const mcqMatch = firstChild.match(/^([A-D]\.|\([A-D]\))\s*(.*)/);
              if (mcqMatch) {
                const otherChildren = childArray.slice(1);
                return (
                  <div className="ml-5 sm:ml-8 my-1.5 flex items-baseline gap-2.5 text-xs sm:text-sm text-slate-800">
                    <span className="font-bold text-slate-900 w-5 shrink-0 select-none">
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
          ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-3 my-3 text-xs sm:text-sm text-slate-700 leading-relaxed" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 mb-3 text-xs sm:text-sm text-slate-700" {...props} />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-3 border-[#305282] bg-slate-50/90 pl-3.5 pr-3 py-2.5 my-3 rounded-r-xl text-xs sm:text-sm text-slate-700 italic shadow-2xs"
              {...props}
            />
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
