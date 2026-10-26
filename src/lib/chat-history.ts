import type { RecentChatSession, StoredChatMessage } from '../types/chat';

const STORAGE_KEY = 'edusearch.chat.sessions.v1';
export const CHATS_UPDATED_EVENT = 'edusearch:chats-updated';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readAll(): RecentChatSession[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSession);
  } catch {
    return [];
  }
}

function writeAll(sessions: RecentChatSession[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 40)));
  window.dispatchEvent(new Event(CHATS_UPDATED_EVENT));
}

function isSession(value: unknown): value is RecentChatSession {
  if (!value || typeof value !== 'object') return false;
  const row = value as RecentChatSession;
  return (
    typeof row.id === 'string' &&
    typeof row.title === 'string' &&
    Array.isArray(row.messages)
  );
}

export function listChatSessions(): RecentChatSession[] {
  return readAll().sort((a, b) =>
    (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)
  );
}

export function getChatSession(id: string): RecentChatSession | null {
  return readAll().find((s) => s.id === id) ?? null;
}

export function upsertChatSession(session: RecentChatSession): void {
  const all = readAll().filter((s) => s.id !== session.id);
  all.unshift(session);
  writeAll(all);
}

export function deleteChatSession(id: string): void {
  const all = readAll().filter((s) => s.id !== id);
  writeAll(all);
}

export function clearAllChatSessions(): void {
  writeAll([]);
}

export function createChatId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `chat-${Date.now()}`;
}

export function titleFromPrompt(text: string): string {
  const one = text.replace(/\s+/g, ' ').trim();
  if (!one) return 'New chat';
  if (one.length <= 36) return one;
  const head = one.slice(0, 36);
  const space = head.lastIndexOf(' ');
  return `${(space > 12 ? head.slice(0, space) : head).trim()}…`;
}

export function toStoredMessages(
  messages: Array<{
    id: string;
    role: string;
    parts?: unknown[];
    metadata?: unknown;
  }>
): StoredChatMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: Array.isArray(m.parts) ? m.parts : [],
      ...(m.metadata !== undefined ? { metadata: m.metadata } : {}),
    }));
}
