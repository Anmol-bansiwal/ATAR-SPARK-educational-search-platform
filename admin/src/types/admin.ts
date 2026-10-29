/**
 * EduSearch AI — Admin TypeScript Type Definitions
 * Matches EduSearch AI frontend guide §5
 */

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ' | 'SHORT' | 'LONG';

// Legacy aliases for backward compatibility across components
export type ApiDifficulty = Difficulty;
export type ApiQuestionType = QuestionType;

/**
 * Standard error shape:
 * message is an array of "field: problem" strings for 400 validation errors,
 * or a single string message for other errors (404, 413, 422, 503).
 */
export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

export type DraftFigure = {
  page: number;
  index: number;
  width: number;
  height: number;
  url: string;
  association: 'attached' | 'uncertain';
};

// Legacy alias
export type ExtractFigure = DraftFigure;

export type DraftQuestion = {
  questionNumber: string;
  partLabel: string | null;
  questionText: string; // Markdown + LaTeX
  questionType: QuestionType;
  marks: number | null;
  difficulty: Difficulty;
  topicId: string | null;
  topic: string | null;
  subtopicId: string | null;
  subtopic: string | null;
  pageReference: string;
  pages: number[];
  figures: DraftFigure[];
  /** Formulas in questionText that cannot render; empty array when valid. */
  mathErrors?: string[];
};

export type UncertainMathsItem = {
  expression: string;
  note: string;
};

export type FormattedMathsResponse = {
  /** Markdown + LaTeX for the editor and live preview. */
  text: string;
  /** False when the text had no maths or was already formatted in the same way. */
  changed: boolean;
  /** Ambiguous expressions the teacher should double-check in the preview. */
  uncertain: UncertainMathsItem[];
  /** Warnings when a comparison sign (<, ≤, >, ≥, =) or number changed. */
  warnings: string[];
  /** Formulas that KaTeX cannot render (same check enforced on save). */
  mathErrors: string[];
};

// Legacy alias
export type ExtractDraft = DraftQuestion;

export type ExtractionJob = {
  jobId: string;
  status: 'processing' | 'done' | 'failed';
  subject: string;
  sourceDocument: string;
  pageCount: number;
  pagesRead: number;
  result: ExtractResponse | null; // set when done
  error: { statusCode: number; message: string } | null; // set when failed
  createdAt: string;
  updatedAt: string;
};

export type ExtractResponse = {
  sourceDocument: string;
  fileHash: string;
  pageCount: number;
  storageProvider: 'cloudinary' | 's3' | 'none';
  subject: string;
  classified: boolean;
  examYear: number | null;
  failedPages: number[];
  questions: DraftQuestion[];
  unassignedFigures: DraftFigure[];
};

// Legacy alias
export type ExtractPaperResponse = ExtractResponse;

export type ApproveDraft = {
  subject: string;
  examYear?: number | null;
  examType?: string | null;
  questions: Array<{
    questionText: string;
    pageReference: string;
    questionNumber?: string | null;
    partLabel?: string | null;
    questionType: QuestionType;
    difficulty: Difficulty;
    marks?: number | null;
    topicId?: string | null;
    subtopicId?: string | null;
    figureUrls: string[];
  }>;
};

// Legacy alias
export type ApprovePaperDraft = ApproveDraft;

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

export type DeleteResult = {
  deleted: number;
  files: { removed: number; failed: number };
};

export type AdminQuestion = {
  id: string;
  questionText: string; // Markdown + LaTeX
  subject: string;
  topic: string;
  subtopic: string | null; // display names ("Unclassified" when none)
  topicId: string | null;
  subtopicId: string | null;
  difficulty: Difficulty;
  questionType: QuestionType;
  marks: number | null;
  questionNumber: string | null;
  partLabel: string | null;
  examYear: number | null;
  examType: string | null;
  sourceDocument: string | null;
  fileUrl: string | null;
  pageReference: string | null;
  figures: Array<{ url: string; description?: string | null }>;
  figureUrls?: string[]; // for direct access
  embeddingStatus: 'PENDING' | 'READY' | 'FAILED' | string;
  createdAt: string;
  updatedAt: string;
};

// Legacy alias
export type AdminListedQuestion = AdminQuestion;

export type AdminQuestionListResponse = {
  total: number;
  limit?: number;
  offset?: number;
  items: AdminQuestion[];
};

export type AdminQuestionQueryParams = {
  subject?: string | null;
  topicId?: string | null;
  subtopicId?: string | null;
  unclassified?: boolean;
  difficulty?: Difficulty | null;
  questionType?: QuestionType | null;
  marks?: number | null;
  marksMin?: number | null;
  marksMax?: number | null;
  examYear?: number | null;
  sourceDocument?: string | null;
  search?: string | null;
  embeddingStatus?: 'PENDING' | 'READY' | 'FAILED' | string | null;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
};

export type QuestionPatch = Partial<{
  questionText: string;
  subject: string;
  topicId: string | null;
  subtopicId: string | null;
  difficulty: Difficulty;
  questionType: QuestionType;
  marks: number | null;
  examYear: number | null;
  examType: string | null;
  pageReference: string | null;
  questionNumber: string | null;
  partLabel: string | null;
  figureUrls: string[];
}>;

export type TaxonomySubtopic = {
  id: string;
  name: string;
  questionCount: number;
  sortOrder?: number;
};

export type TaxonomyTopic = {
  id: string;
  name: string;
  questionCount: number;
  subtopics: TaxonomySubtopic[];
  sortOrder?: number;
};

export type TaxonomySubject = {
  id: string;
  name: string;
  questionCount: number;
  unclassifiedCount: number;
  topics: TaxonomyTopic[];
  sortOrder?: number;
};

export type OtherSubject = {
  name: string;
  questionCount: number;
};

export type TaxonomyResponse = {
  subjects: TaxonomySubject[];
  otherSubjects: OtherSubject[];
};

export type TaxonomyEntry = {
  id: string;
  name: string;
  sortOrder: number;
};

export type DeletedTaxonomyEntry = {
  deleted: 1;
  unclassifiedQuestions: number;
};

/** Paper metadata collected on the upload form. */
export type PaperUploadMeta = {
  title: string;
  subject: string;
  topic: string;
  subtopic: string;
  examYear: string;
  examType: string;
  difficulty: Difficulty;
  questionType: QuestionType;
};

export type ReviewDraft = DraftQuestion & {
  keep: boolean;
  subtopicOverride?: string;
  topicOverride?: string;
  difficultyOverride?: Difficulty;
  questionTypeOverride?: QuestionType;
};
