// src/app/chat/layout.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '../../components/layout/sidebar';
import {
  CHATS_UPDATED_EVENT,
  listChatSessions,
  deleteChatSession,
  clearAllChatSessions,
} from '../../lib/chat-history';
import type { RecentChatSession } from '../../types/chat';
import { MoreVertical } from 'lucide-react';
import { BackendStatusBadge } from '../../components/layout/backend-status-badge';

function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentChats, setRecentChats] = useState<RecentChatSession[]>([]);

  const activeChatId = searchParams.get('chat')?.trim() ?? '';

  const refreshChats = useCallback(() => {
    setRecentChats(listChatSessions());
  }, []);

  const handleDeleteChat = useCallback(
    (id: string) => {
      deleteChatSession(id);
      if (activeChatId === id) {
        router.push('/');
      }
    },
    [activeChatId, router]
  );

  const handleClearChats = useCallback(() => {
    clearAllChatSessions();
    if (activeChatId) {
      router.push('/');
    }
  }, [activeChatId, router]);

  useEffect(() => {
    refreshChats();
    window.addEventListener(CHATS_UPDATED_EVENT, refreshChats);
    window.addEventListener('storage', refreshChats);
    return () => {
      window.removeEventListener(CHATS_UPDATED_EVENT, refreshChats);
      window.removeEventListener('storage', refreshChats);
    };
  }, [refreshChats]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsSidebarOpen(window.innerWidth >= 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans select-none">
      <Sidebar
        recentChats={recentChats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          router.push(`/chat?chat=${encodeURIComponent(id)}`);
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        onNewChat={() => {
          router.push('/');
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        onDeleteChat={handleDeleteChat}
        onClearChats={handleClearChats}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gradient-to-b from-blue-50 via-slate-50 to-sky-100">
        <header className="relative z-10 px-6 py-3 flex items-center justify-end gap-3 shrink-0">
          <BackendStatusBadge />
          <button className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white/30 transition-colors cursor-pointer">
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        <div className="relative z-10 flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={<div className="flex h-screen w-full bg-white" />}>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </React.Suspense>
  );
}
