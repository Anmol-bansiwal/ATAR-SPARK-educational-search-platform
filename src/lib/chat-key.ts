// src/lib/chat-key.ts

const KEY_STORAGE = 'edusearch.chatKey';

/**
 * Returns this browser's private chat key (32 random bytes as base64url: 43 characters).
 * Sent as the X-Chat-Key header to authenticate access to /api/chat and /api/chats.
 * Created once per browser and persisted in localStorage.
 * Specification: FRONTEND_GUIDE.md §4.1 & FRONTEND_API.md §8.7.
 */
export function getChatKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    let key = localStorage.getItem(KEY_STORAGE);
    if (!key) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      key = btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      localStorage.setItem(KEY_STORAGE, key);
    }
    return key;
  } catch {
    return '';
  }
}

