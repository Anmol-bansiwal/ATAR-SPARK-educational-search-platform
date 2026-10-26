import type { PaperUploadMeta } from '../types/admin';

/**
 * Infer paper metadata from the PDF filename when the paper itself
 * does not expose structured fields. Missing pieces use safe defaults.
 */
export function guessPaperMetaFromFilename(fileName: string): PaperUploadMeta {
  const base = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  const lower = base.toLowerCase();

  const subject =
    matchSubject(lower) ??
    (/\bmaths?\b|\bmathematics\b/.test(lower) ? 'Mathematics' : null) ??
    'General';

  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const examYear = yearMatch?.[0] ?? String(new Date().getFullYear());

  let examType = 'exam paper';
  if (/\bhsc\b/.test(lower)) examType = 'HSC';
  else if (/\bcbse\b/.test(lower)) examType = 'CBSE';
  else if (/\bsample\b|\bsqp\b/.test(lower)) examType = 'sample paper';
  else if (/\bpast\b/.test(lower)) examType = 'past paper';

  // Papers often mix MCQ / short / long — default SHORT until per-question
  // detection exists. Admin can override on Review / advanced settings.
  const questionType = /\bmcq\b|\bmultiple\s*choice\b/.test(lower)
    ? 'MCQ'
    : 'SHORT';

  return {
    title: base,
    subject,
    topic: 'General',
    subtopic: '',
    examYear,
    examType,
    difficulty: 'MEDIUM',
    questionType,
  };
}

function matchSubject(lower: string): string | null {
  if (/\bphysics\b/.test(lower)) return 'Physics';
  if (/\bchemistry\b|\bchem\b/.test(lower)) return 'Chemistry';
  if (/\bbiology\b|\bbiology\b/.test(lower)) return 'Biology';
  if (/\benglish\b/.test(lower)) return 'English';
  if (/\bmaths?\b|\bmathematics\b|\bmath\b/.test(lower)) return 'Mathematics';
  return null;
}
