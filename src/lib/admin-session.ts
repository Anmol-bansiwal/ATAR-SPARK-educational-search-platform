import type {
  ExtractPaperResponse,
  PaperUploadMeta,
  ReviewDraft,
} from '../types/admin';

/**
 * In-memory handoff between /admin (extract) and /admin/review (approve).
 * Refreshing the review page clears this — re-upload for the demo.
 */
export type AdminPendingSession = {
  file: File;
  pdfObjectUrl: string;
  meta: PaperUploadMeta;
  extract: ExtractPaperResponse;
  drafts: ReviewDraft[];
};

let pending: AdminPendingSession | null = null;

export function setAdminPending(
  input: Omit<AdminPendingSession, 'pdfObjectUrl' | 'drafts'> & {
    drafts?: ReviewDraft[];
  }
): AdminPendingSession {
  if (pending?.pdfObjectUrl) {
    URL.revokeObjectURL(pending.pdfObjectUrl);
  }
  const drafts: ReviewDraft[] =
    input.drafts ??
    input.extract.questions.map((q) => ({
      ...q,
      // Skip cover pages / section instructions by default — admin can re-check.
      keep: looksLikeExamQuestion(q.questionText),
      subtopicOverride: '',
    }));
  pending = {
    file: input.file,
    pdfObjectUrl: URL.createObjectURL(input.file),
    meta: input.meta,
    extract: input.extract,
    drafts,
  };
  return pending;
}

export function getAdminPending(): AdminPendingSession | null {
  return pending;
}

export function updateAdminDrafts(drafts: ReviewDraft[]): void {
  if (!pending) return;
  pending = { ...pending, drafts };
}

export function clearAdminPending(): void {
  if (pending?.pdfObjectUrl) {
    URL.revokeObjectURL(pending.pdfObjectUrl);
  }
  pending = null;
}

/** Heuristic: cover sheets and section blurbs are not student Q&A. */
function looksLikeExamQuestion(text: string): boolean {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length < 40) return false;
  if (t.length > 12000) return false;
  const lower = t.toLowerCase();
  if (
    /higher school certificate|education standards authority|nsw education|allow about \d+ minutes|attempt questions|total marks|general instructions|section [ivx]+\b.*marks/i.test(
      lower
    )
  ) {
    return false;
  }
  // Prefer drafts that look numbered like real questions
  if (/^(?:\d+[.)]|q(?:uestion)?\s*\d+)/i.test(t)) return true;
  if (/\?\s*$/.test(t) || /\b(find|calculate|show that|prove|explain|solve)\b/i.test(t)) {
    return true;
  }
  // Keep mid-length content by default; admin can untick
  return t.length >= 80 && t.length <= 6000;
}
