import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
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
 * Converts ^{n} and _{n} script notation from REST responses into KaTeX inline math ($^{n}$ / $_{n}$)
 * so that MarkdownMathRenderer (remark-math + rehype-katex) renders them cleanly.
 */
export function renderScriptsToKatex(text: string): string {
  return normalizeMarkdownMath(text);
}

/**
 * Cleans over-LaTeXified numbers and units (e.g. `$120\ \mathrm{g}$` or `$4\ \text{g}$`)
 * into natural plain text (`120 g`, `4 g`), while strictly preserving genuine math formulas ($E = mc^2$).
 */
export function cleanMathQuantities(text: string): string {
  if (!text) return '';
  return text
    // Replace standalone simple quantities $\d+\ \mathrm{unit}$ or $\d+\ \text{unit}$ that have no operators
    .replace(
      /\$([0-9]+(?:\.[0-9]+)?)\s*(?:\\(?:,|;|\s|\quad))*\\(?:mathrm|text)\{([a-zA-Z%°/]+)\}\$/g,
      '$1 $2'
    );
}
