import type { AnswerStatus } from './question';

export type AnswerOrigin =
  | 'knowledge_base'
  | 'general'
  | 'guidance'
  | 'transformed'
  | 'paper_questions'
  | null;

export interface ChatSuggestion {
  label: string;
  prompt: string;
}

export interface ChatMetadata {
  status?: AnswerStatus;
  activeSubject?: string | null;
  kind?: string | null;
  answerOrigin?: AnswerOrigin;
  suggestions?: ChatSuggestion[];
}

export interface QuestionItems {
  number: number;
  questionRef: string;
  topic: string;
  subtopic: string;
  whyDifficult: string;
  coreConcept: string;
  formulaLatex?: string;
  sourcePaper?: string;
}

/** Serializable UI message snapshot for local chat history. */
export type StoredChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: unknown[];
  metadata?: unknown;
};

export interface RecentChatSession {
  id: string;
  title: string;
  paperTag: string;
  userPrompt: string;
  /** Full thread — required to reopen earlier chats. */
  messages: StoredChatMessage[];
  createdAt: string;
  updatedAt: string;
}
