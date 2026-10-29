import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import katex from 'katex';

/**
 * Utility function to merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Regex matching LaTeX math spans in Markdown:
 * 1. $$...$$ display math
 * 2. \[...\] display math
 * 3. \(...\) inline math
 * 4. $...$ inline math (ignoring escaped \$)
 */
export const ANY_MATH =
  /(?<!\\)\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([^\n]+?)\\\)|(?<!\\)\$((?:\\\$|[^$\n])+?)\$/g;

/**
 * Validates all math formulas in questionText using KaTeX client-side (Part D specification).
 * Matches backend validation 1:1:
 * - Checks unescaped dollar sign parity.
 * - Validates each formula using katex.renderToString({ throwOnError: true }).
 */
export function validateQuestionMath(text: string): string[] {
  if (!text || !text.trim()) return [];

  const errors: string[] = [];

  // 1. Check for unclosed $ signs (odd count of unescaped $)
  let unescapedDollars = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '$') {
      let backslashes = 0;
      let j = i - 1;
      while (j >= 0 && text[j] === '\\') {
        backslashes++;
        j--;
      }
      if (backslashes % 2 === 0) {
        unescapedDollars++;
      }
    }
  }

  if (unescapedDollars % 2 !== 0) {
    errors.push('Odd number of $ signs — a formula is not closed (use \\$ for money)');
  }

  // 2. Validate all math expressions
  ANY_MATH.lastIndex = 0;
  let match: RegExpExecArray | null;
  let formulaIndex = 1;

  while ((match = ANY_MATH.exec(text)) !== null) {
    const raw = match[0];
    const isDisplay = raw.startsWith('$$') || raw.startsWith('\\[');
    const mathBody = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? '').trim();

    if (!mathBody) {
      errors.push(`Formula ${formulaIndex} is empty`);
      formulaIndex++;
      continue;
    }

    try {
      katex.renderToString(mathBody, {
        throwOnError: true,
        displayMode: isDisplay,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Cannot be rendered';
      const snippet = mathBody.length > 25 ? `${mathBody.slice(0, 25)}…` : mathBody;
      errors.push(`Formula ${formulaIndex} (${snippet}) cannot be shown: ${errMsg}`);
    }

    formulaIndex++;
  }

  return errors;
}

/**
 * Locates and replaces a clicked formula in questionText by occurrence index (Part B Section 3 specification).
 */
export function replaceFormulaAtOccurrence(
  questionText: string,
  targetLatex: string,
  newLatex: string,
  isDisplay: boolean,
  occurrenceIndex: number
): { success: boolean; text: string } {
  const trimmedTarget = targetLatex.trim();
  let match: RegExpExecArray | null;
  let currentOcc = 0;
  let targetMatch: RegExpExecArray | null = null;

  ANY_MATH.lastIndex = 0;
  while ((match = ANY_MATH.exec(questionText)) !== null) {
    const innerBody = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? '').trim();
    if (innerBody === trimmedTarget) {
      if (currentOcc === occurrenceIndex) {
        targetMatch = match;
        break;
      }
      currentOcc++;
    }
  }

  if (!targetMatch) {
    return { success: false, text: questionText };
  }

  const replacement = isDisplay
    ? `\n\n$$${newLatex}$$\n\n`
    : `$${newLatex}$`;

  const before = questionText.slice(0, targetMatch.index);
  const after = questionText.slice(targetMatch.index + targetMatch[0].length);

  return { success: true, text: before + replacement + after };
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
