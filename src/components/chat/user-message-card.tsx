'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MessageCardProps {
  paperTag: string;
  query: string;
}

/** User bubble - paperTag is filter context only (no file upload on student API). */
export const UserMessageCard: React.FC<MessageCardProps> = ({
  paperTag,
  query,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!query) return;
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const hasFilterTag = Boolean(paperTag && paperTag !== 'Exam paper');

  return (
    <div className="w-full flex justify-end pr-2 sm:pr-4 animate-in fade-in slide-in-from-top-2">
      <div
        className="relative group w-[240px] max-w-[85vw] text-white rounded-[24px] p-3 shadow-xs space-y-3"
        style={{
          backgroundColor: '#2665D9',
          border: '1px solid #E6E6E6',
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied prompt' : 'Copy prompt'}
          title={copied ? 'Copied!' : 'Copy prompt'}
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer z-10 flex items-center gap-1 text-[11px] backdrop-blur-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span className="font-medium text-white">Copied</span>
            </>
          ) : (
            <Copy className="w-3.5 h-3.5 text-white" />
          )}
        </button>

        {hasFilterTag && (
          <div className="bg-white/20 backdrop-blur-xs rounded-xl px-3.5 py-2.5 inline-flex flex-col gap-1.5 w-fit max-w-[calc(100%-36px)]">
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-white leading-tight">
              Filter
            </span>
            <span className="text-xs font-medium text-white leading-tight truncate max-w-full">
              {paperTag}
            </span>
          </div>
        )}
        <p className={`text-sm font-medium text-white leading-relaxed break-words ${hasFilterTag ? '' : 'pr-7'}`}>
          {query}
        </p>
      </div>
    </div>
  );
};

export default UserMessageCard;
