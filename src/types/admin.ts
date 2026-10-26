/** Types for Nest POST /papers/extract and /papers/approve (demo admin). */

export type ApiQuestionType = 'MCQ' | 'SHORT' | 'LONG';
export type ApiDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type ExtractFigure = {
  page: number;
  index: number;
  width: number;
  height: number;
  url: string;
  association?: string;
};

export type ExtractDraft = {
  questionText: string;
  pageReference: string;
  figures: ExtractFigure[];
};

export type ExtractPaperResponse = {
  sourceDocument: string;
  fileHash: string;
  pageCount: number;
  storageProvider?: string;
  questions: ExtractDraft[];
  unassignedFigures?: ExtractFigure[];
};

export type ApprovePaperDraft = {
  subject: string;
  topic: string;
  subtopic?: string | null;
  examYear?: number | null;
  examType?: string | null;
  difficulty: ApiDifficulty;
  questionType: ApiQuestionType;
  questions: Array<{
    questionText: string;
    pageReference: string;
    subtopic?: string | null;
  }>;
};

export type ApprovePaperResponse = {
  fileHash: string;
  sourceDocument: string;
  fileUrl?: string | null;
  storageProvider?: string;
  saved: Array<{
    id: string;
    questionText: string;
    pageReference: string | null;
    sourceDocument: string | null;
    fileUrl?: string | null;
  }>;
  skipped: Array<{ questionText: string; pageReference: string }>;
  failed: Array<{
    questionText: string;
    pageReference: string;
    message: string;
  }>;
};

/** Paper metadata collected on the upload form. */
export type PaperUploadMeta = {
  title: string;
  subject: string;
  topic: string;
  subtopic: string;
  examYear: string;
  examType: string;
  difficulty: ApiDifficulty;
  questionType: ApiQuestionType;
};

export type ReviewDraft = ExtractDraft & {
  keep: boolean;
  subtopicOverride: string;
};

export type AdminListedQuestion = {
  id: string;
  questionText: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  examYear: number | null;
  examType: string | null;
  difficulty: string;
  questionType: string;
  sourceDocument: string | null;
  fileUrl: string | null;
  pageReference: string | null;
  embeddingStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminQuestionListResponse = {
  total: number;
  items: AdminListedQuestion[];
};
