import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts ^{n} and _{n} notation into standard HTML <sup> and <sub> tags
 * (Specification: FRONTEND_API.md §1).
 */
export function renderScripts(text: string): string {
  if (!text) return '';
  return text
    .replace(/\^\{([^}]{1,8})\}/g, '<sup>$1</sup>')
    .replace(/_\{([^}]{1,8})\}/g, '<sub>$1</sub>');
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

