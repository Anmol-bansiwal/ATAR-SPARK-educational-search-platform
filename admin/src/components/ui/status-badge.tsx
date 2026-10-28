'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import type { ApiDifficulty } from '../../types/question';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLE_MAP: Record<string, string> = {
  READY: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  FAILED: 'bg-rose-50 text-rose-800 border-rose-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || 'READY').toUpperCase();
  const studentReady = normalized === 'READY';
  const style =
    STATUS_STYLE_MAP[normalized] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight',
        style,
        className
      )}
      title={
        studentReady
          ? 'Approved — student searchable'
          : 'Pending review or processing'
      }
    >
      {studentReady ? 'Approved · READY' : `Not approved · ${normalized}`}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty?: ApiDifficulty | string | null;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  if (!difficulty) return null;
  const normalized = difficulty.toUpperCase();

  const colorClass =
    normalized === 'HARD'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : normalized === 'MEDIUM'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <span
      className={cn(
        'rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-wider',
        colorClass,
        className
      )}
    >
      {normalized}
    </span>
  );
}

