// src/components/math/markdown-math-renderer.tsx
'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { renderScriptsToKatex, cn } from '../../lib/utils';

interface MarkdownMathRendererProps {
  content: string;
  className?: string;
}

export const MarkdownMathRenderer: React.FC<MarkdownMathRendererProps> = ({
  content,
  className = '',
}) => {
  const processedContent = useMemo(
    () => renderScriptsToKatex(content),
    [content]
  );

  return (
    <div
      className={cn(
        'prose-sm sm:prose max-w-full min-w-0 break-words [overflow-wrap:anywhere] text-slate-800 leading-relaxed font-sans',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h3: ({ node: _node, ...props }) => (
            <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-5 mb-2" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="mb-2.5 leading-relaxed text-slate-700 text-xs sm:text-sm" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 mb-3 text-xs sm:text-sm text-slate-700" {...props} />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          strong: ({ node: _node, ...props }) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMathRenderer;
