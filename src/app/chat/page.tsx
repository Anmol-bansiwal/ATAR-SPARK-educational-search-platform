// src/app/chat/page.tsx
'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DifficultyLevel } from '../../types/question';

/**
 * Backward compatibility route:
 * Migrates legacy /chat?chat=<id> or /chat?q=<query> to the new canonical /c/<id> routes
 * as specified in FRONTEND_GUIDE.md §4.1 & FRONTEND_API.md §8.7.
 */
function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const existingChatId = searchParams.get('chat')?.trim();
    if (existingChatId) {
      router.replace(`/c/${encodeURIComponent(existingChatId)}`);
      return;
    }

    const initialQuery = searchParams.get('q')?.trim();
    const newChatId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `chat-${Date.now()}`;

    if (initialQuery && typeof window !== 'undefined') {
      const subject = searchParams.get('subject') || searchParams.get('paper') || 'All';
      const timePeriod = searchParams.get('timePeriod') || 'All Years';
      const difficulty = (searchParams.get('difficulty') as DifficultyLevel) || 'All';
      const rawYear = searchParams.get('year');
      const year = rawYear && rawYear !== 'All' ? parseInt(rawYear, 10) || 'All' : 'All';

      window.sessionStorage.setItem(
        `edusearch.pendingPrompt.${newChatId}`,
        JSON.stringify({
          prompt: initialQuery,
          filters: { query: '', subject, timePeriod, difficulty, year },
        })
      );
      window.sessionStorage.setItem(`edusearch.newChat.${newChatId}`, '1');
      router.replace(`/c/${newChatId}`);
      return;
    }

    router.replace('/');
  }, [router, searchParams]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-xs text-slate-400">
      Redirecting to conversation...
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-transparent" />}>
      <ChatPageInner />
    </Suspense>
  );
}
