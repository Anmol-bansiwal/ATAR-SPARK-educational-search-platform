// admin/src/lib/admin-session.ts
import type {
  DraftFigure,
  ExtractResponse,
  PaperUploadMeta,
  ReviewDraft,
} from '../types/admin';

/**
 * In-memory handoff between /admin (upload & extract) and /admin/review (review & approve).
 */
export type AdminPendingSession = {
  file: File;
  pdfObjectUrl: string;
  meta: PaperUploadMeta;
  extract: ExtractResponse;
  drafts: ReviewDraft[];
  unassignedFigures: DraftFigure[];
};

let pending: AdminPendingSession | null = null;

export function setAdminPending(
  input: Omit<AdminPendingSession, 'pdfObjectUrl' | 'drafts' | 'unassignedFigures'> & {
    drafts?: ReviewDraft[];
    unassignedFigures?: DraftFigure[];
  }
): AdminPendingSession {
  if (pending?.pdfObjectUrl) {
    URL.revokeObjectURL(pending.pdfObjectUrl);
  }

  // Guide §2.3: Keep checkbox defaults on for each draft question
  const drafts: ReviewDraft[] =
    input.drafts ??
    input.extract.questions.map((q) => ({
      ...q,
      keep: true,
      topicOverride: q.topic || '',
      subtopicOverride: q.subtopic || '',
      difficultyOverride: q.difficulty,
      questionTypeOverride: q.questionType,
    }));

  const unassignedFigures: DraftFigure[] =
    input.unassignedFigures ?? input.extract.unassignedFigures ?? [];

  pending = {
    file: input.file,
    pdfObjectUrl: URL.createObjectURL(input.file),
    meta: input.meta,
    extract: input.extract,
    drafts,
    unassignedFigures,
  };

  return pending;
}

export function getAdminPending(): AdminPendingSession | null {
  return pending;
}

export function updateAdminDrafts(
  drafts: ReviewDraft[],
  unassignedFigures?: DraftFigure[]
): void {
  if (!pending) return;
  pending = {
    ...pending,
    drafts,
    unassignedFigures: unassignedFigures ?? pending.unassignedFigures,
  };
}

export function clearAdminPending(): void {
  if (pending?.pdfObjectUrl) {
    URL.revokeObjectURL(pending.pdfObjectUrl);
  }
  pending = null;
}
