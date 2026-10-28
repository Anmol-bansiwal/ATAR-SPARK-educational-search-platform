import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Converts ^{n} and _{n} script notation from REST responses into KaTeX inline math ($^{n}$ / $_{n}$)
 * so that MarkdownMathRenderer (remark-math + rehype-katex) renders them cleanly.
 */
export function renderScriptsToKatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\^\{([^}]{1,8})\}/g, '$^{$1}$')
    .replace(/_\{([^}]{1,8})\}/g, '$_{$1}$');
}
