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
 * Normalizes mathematical markdown formatting for KaTeX:
 * 1. Converts LaTeX bracket notations \[...\] -> $$...$$ and \(...\) -> $...$
 * 2. Ensures display math $$...$$ delimiters sit on their own lines surrounded by blank lines
 *    so remark-math parses them as block display math rather than inline math.
 * Per FRONTEND_GUIDE.md §1 & FRONTEND_API.md §1:
 * Does NOT rewrite ^{...} or _{...} on Markdown+LaTeX question or chat text because KaTeX handles it.
 */
export function normalizeMarkdownMath(text: string): string {
  if (!text) return '';

  let normalized = text;

  // 1. Convert LaTeX bracket notations: \[ ... \] -> $$ ... $$ and \( ... \) -> $ ... $
  normalized = normalized.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n\n$$\n${math.trim()}\n$$\n\n`);
  normalized = normalized.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);

  // 2. Normalize display math $$ ... $$ so that $$ sits on its own line surrounded by blank lines
  normalized = normalized.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => `\n\n$$\n${math.trim()}\n$$\n\n`);

  return normalized;
}

/**
 * Compatibility alias for components that previously imported renderScriptsToKatex
 */
export function renderScriptsToKatex(text: string): string {
  return normalizeMarkdownMath(text);
}
