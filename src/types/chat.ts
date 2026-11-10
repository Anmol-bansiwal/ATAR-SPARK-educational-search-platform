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
  transformation?: 'practice' | string | null;
  suggestions?: ChatSuggestion[];
}

export interface ChatSummary {
  id: string; // UUID, the /c/<id> in the URL
  title: string; // first question, <= 60 characters; "New chat" if none
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601, last reply
}

export interface SavedChat extends ChatSummary {
  messages: StoredChatMessage[];
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
