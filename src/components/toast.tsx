'use client';

import React from 'react';
import { X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'info' | 'warning' | 'success' | 'error';

export interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  className?: string;
}

/**
 * Toast Component
 *
 * Floating pill toast notification styled according to the ATAR SPARK design system:
 * - Instrument Sans typography
 * - Frosted glass pill background (bg-white/95 backdrop-blur-md)
 * - Monsoon Glow soft shadow and subtle border
 * - Brand blue / amber status indicators
 * - Accessible status role with manual close and auto-dismiss support
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onDismiss,
  className = '',
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-[92vw] sm:max-w-md flex items-center gap-2.5 pl-3.5 pr-2 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_36px_rgba(38,101,217,0.18),0_2px_8px_rgba(0,0,0,0.06)] animate-toast select-none transition-all ${className}`}
      style={{
        fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)",
      }}
    >
      {/* Icon Indicator */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-[#2665D9]'
        }`}
      >
        {isWarning ? (
          <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.2} />
        ) : (
          <Info className="w-3.5 h-3.5" strokeWidth={2.2} />
        )}
      </div>

      {/* Message Text */}
      <span className="text-xs sm:text-[13px] font-medium text-[#0D0D0D] leading-tight tracking-normal">
        {message}
      </span>

      {/* Manual Dismiss Button */}
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-full text-slate-400 hover:text-[#0D0D0D] hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-1"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;
