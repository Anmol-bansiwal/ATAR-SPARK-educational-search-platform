'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface AlertBannerProps {
  variant?: AlertVariant;
  type?: AlertVariant;
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  { container: string; icon: string; IconComponent: React.ComponentType<{ className?: string }> }
> = {
  error: {
    container: 'border-red-200 bg-red-50/90 text-red-800',
    icon: 'text-red-600',
    IconComponent: AlertCircle,
  },
  warning: {
    container: 'border-amber-300 bg-amber-50 text-amber-900',
    icon: 'text-amber-700',
    IconComponent: AlertTriangle,
  },
  info: {
    container: 'border-blue-200 bg-blue-50/80 text-blue-900',
    icon: 'text-blue-600',
    IconComponent: Info,
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    IconComponent: CheckCircle2,
  },
};

/**
 * Reusable accessible Alert Banner for errors, warnings, and notifications.
 */
export function AlertBanner({
  variant,
  type,
  title,
  message,
  children,
  onDismiss,
  className,
}: AlertBannerProps) {
  const effectiveVariant = variant || type || 'error';
  const content = message ?? children;
  if (!content && !title) return null;

  const { container, icon, IconComponent } = VARIANT_STYLES[effectiveVariant];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border px-4 py-3 text-sm flex items-start gap-2.5 transition-colors',
        container,
        className
      )}
    >
      <IconComponent className={cn('w-4 h-4 shrink-0 mt-0.5', icon)} />
      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
        {title && <p className="font-bold text-xs uppercase tracking-wide mb-0.5">{title}</p>}
        {content && <div>{content}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
