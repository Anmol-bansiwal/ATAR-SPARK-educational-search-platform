'use client';

import React from 'react';
import { useHealthCheck } from '../../hooks/use-questions';

/**
 * Live Backend Status Indicator
 *
 * Checks /health every 30s (and on window focus) using React Query.
 * Displays a live status badge (Online / Offline / Checking) with a ping animation.
 * Clicking the badge triggers an immediate re-check.
 */
export function BackendStatusBadge({ className = '' }: { className?: string }) {
  const { data, isError, refetch, isFetching } = useHealthCheck();

  const isOnline = !isError && data?.status === 'ok';

  return (
    <button
      type="button"
      onClick={() => refetch()}
      title={
        isFetching
          ? 'Checking backend status...'
          : isOnline
          ? `Backend is online (${data?.database === 'up' ? 'Database connected' : 'Database issue'}). Click to recheck.`
          : 'Backend is offline or unreachable. Click to retry.'
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border select-none ${
        isFetching
          ? 'bg-slate-50 border-slate-200 text-slate-600'
          : isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && !isFetching && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isFetching
              ? 'bg-slate-400 animate-pulse'
              : isOnline
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          }`}
        />
      </span>
      <span>
        {isFetching
          ? 'Checking...'
          : isOnline
          ? 'API Online'
          : 'API Offline'}
      </span>
    </button>
  );
}

export default BackendStatusBadge;
