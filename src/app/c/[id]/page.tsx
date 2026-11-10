// src/app/c/[id]/page.tsx
'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import Link from 'next/link';
import { Sparkles, ArrowLeft, MessageSquareOff } from 'lucide-react';
import { UserMessageCard } from '../../../components/chat/user-message-card';
import { MessageStream } from '../../../components/chat/message-stream';
import { SearchBox } from '../../../components/search-box';
import { Toast, type ToastType } from '../../../components/toast';
import { useQuestionFilters } from '../../../hooks/use-questions';
import { apiClient, toChatFilters, chatErrorText } from '../../../lib/api-client';
import { getChatKey } from '../../../lib/chat-key';
import { CHATS_UPDATED_EVENT } from '../../../lib/chat-history';
import type { SearchFilterState, DifficultyLevel } from '../../../types/question';
import { SUBJECTS, DIFFICULTIES } from '../../../types/question';
import type { ChatMetadata } from '../../../types/chat';
import type { PaperCardSource } from '../../../components/chat/paper-card';

type ChatMessage = UIMessage<ChatMetadata>;

const DEFAULT_FILTERS: SearchFilterState = {
  query: '',
  subject: 'All',
  timePeriod: 'All Years',
  difficulty: 'All',
  year: 'All',
};

function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) return '';
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function getMessageSources(message: UIMessage): PaperCardSource[] {
  if (!message.parts || message.parts.length === 0) return [];
  return message.parts.flatMap((p) => {
    if (p.type !== 'source-document') return [];
    const sourceId = typeof p.sourceId === 'string' ? p.sourceId : '';
    if (!sourceId) return [];
    const meta = (
      p as {
        providerMetadata?: {
          edusearch?: {
            figureUrls?: unknown;
            questionText?: unknown;
            questionMarkdown?: unknown;
            card?: unknown;
            questionNumber?: unknown;
            partLabel?: unknown;
            sourceDocument?: unknown;
          };
        };
      }
    ).providerMetadata?.edusearch;
    const rawCard = meta?.card;
    let cardMarkdown: string | undefined;
    let cardTitle: string | undefined;

    // Sub-parts merged into a master card have card === null and MUST be skipped (FRONTEND_GUIDE.md §4)
    if (rawCard === null) {
      return [];
    } else if (typeof rawCard === 'string') {
      cardMarkdown = rawCard;
    } else if (rawCard && typeof rawCard === 'object' && 'markdown' in rawCard) {
      const cardObj = rawCard as { title?: unknown; markdown?: unknown };
      if (typeof cardObj.markdown === 'string') cardMarkdown = cardObj.markdown;
      if (typeof cardObj.title === 'string') cardTitle = cardObj.title;
    }

    const rawFigures = meta?.figureUrls;
    const figureUrls = Array.isArray(rawFigures)
      ? rawFigures.filter((u): u is string => typeof u === 'string' && u.trim() !== '')
      : [];
    const questionText =
      typeof meta?.questionText === 'string' && meta.questionText.trim()
        ? meta.questionText.trim()
        : undefined;
    const rawMarkdown =
      meta?.questionMarkdown ??
      (p as { questionMarkdown?: unknown }).questionMarkdown;
    const questionMarkdown =
      typeof rawMarkdown === 'boolean' ? rawMarkdown : true;
    const mediaType =
      typeof (p as { mediaType?: unknown }).mediaType === 'string'
        ? (p as { mediaType: string }).mediaType
        : undefined;

    return [
      {
        sourceId,
        title:
          cardTitle ||
          (typeof p.title === 'string' && p.title.trim() ? p.title : 'Source'),
        filename: typeof p.filename === 'string' ? p.filename : undefined,
        mediaType,
        questionMarkdown,
        ...(cardMarkdown ? { card: cardMarkdown } : {}),
        ...(questionText ? { questionText } : {}),
        ...(figureUrls.length > 0 ? { figureUrls } : {}),
        ...(meta?.questionNumber != null ? { questionNumber: meta.questionNumber as number | string } : {}),
        ...(typeof meta?.partLabel === 'string' ? { partLabel: meta.partLabel } : {}),
        ...(typeof meta?.sourceDocument === 'string' ? { sourceDocument: meta.sourceDocument } : {}),
      },
    ];
  });
}

function SavedChatPageInner() {
  const params = useParams();
  const router = useRouter();
  const chatId = typeof params?.id === 'string' ? params.id : '';

  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);

  const [toast, setToast] = useState<{ message: string; type?: ToastType } | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  const initialSentRef = useRef(false);
  const initialRequestStartedRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const transport = useRef(
    new DefaultChatTransport<ChatMessage>({
      api: '/api/chat',
      headers: () => {
        const key = getChatKey();
        const headers: Record<string, string> = {};
        if (key) headers['X-Chat-Key'] = key;
        return headers;
      },
    })
  ).current;

  const { messages, setMessages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    id: chatId,
    transport,
    onFinish: () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(`edusearch.newChat.${chatId}`);
        window.dispatchEvent(new Event(CHATS_UPDATED_EVENT));
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const chatBodyFilters = useCallback(
    () => ({ filters: toChatFilters(filters) }),
    [filters]
  );

  // Load existing chat session from server, or consume pending prompt from landing page
  useEffect(() => {
    if (!chatId) return;

    let isMounted = true;

    async function loadChat() {
      // The first response is still being persisted by the backend. Do not
      // replace the active stream with a premature GET /api/chats/:id.
      if (initialRequestStartedRef.current) return;

      const newChatKey = `edusearch.newChat.${chatId}`;
      const isClientCreatedChat =
        typeof window !== 'undefined' && window.sessionStorage.getItem(newChatKey) === '1';

      // 1. Check if there is a pending search passed from landing page in sessionStorage
      if (typeof window !== 'undefined') {
        const pendingKey = `edusearch.pendingPrompt.${chatId}`;
        const rawPending = window.sessionStorage.getItem(pendingKey);
        if (rawPending) {
          try {
            const pending = JSON.parse(rawPending) as { prompt: string; filters?: SearchFilterState };
            window.sessionStorage.removeItem(pendingKey);
            if (pending.filters) {
              setFilters(pending.filters);
            }
            if (!initialSentRef.current && pending.prompt) {
              initialSentRef.current = true;
              initialRequestStartedRef.current = true;
              setIsLoadingSaved(false);
              sendMessage(
                { text: pending.prompt },
                { body: { filters: toChatFilters(pending.filters ?? DEFAULT_FILTERS) } }
              );
              return;
            }
          } catch {
            window.sessionStorage.removeItem(pendingKey);
          }
        }
      }

      // The first response for a client-created chat is persisted only after
      // streaming completes, so its GET endpoint may briefly return 404.
      if (isClientCreatedChat) {
        setIsLoadingSaved(false);
        return;
      }

      // 2. Fetch thread from GET /api/chats/:id
      try {
        const saved = await apiClient.getChat(chatId);
        if (!isMounted) return;
        if (saved?.messages && Array.isArray(saved.messages)) {
          setMessages(saved.messages as ChatMessage[]);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const statusCode = err && typeof err === 'object' && 'statusCode' in err ? Number(err.statusCode) : 0;
        if (statusCode === 404 && !initialRequestStartedRef.current) {
          // Another browser's chat, deleted, or wrong link -> show "Chat not found"
          setIsNotFound(true);
        } else if (statusCode === 503) {
          showToast('Saved chats are temporarily unavailable. You can continue asking questions.', 'info');
        } else {
          console.error('[SavedChat] Error loading thread:', err);
        }
      } finally {
        if (isMounted) setIsLoadingSaved(false);
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [chatId, sendMessage, setMessages, showToast]);

  // Display transport errors
  useEffect(() => {
    if (error) {
      console.error('[Chat Stream Error]:', error);
      showToast(chatErrorText(error), 'error');
    }
  }, [error, showToast]);

  const handleFollowUpSearch = () => {
    const trimmed = filters.query.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed }, { body: chatBodyFilters() });
    setFilters((prev) => ({ ...prev, query: '' }));
  };

  const handleSuggestionClick = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed }, { body: chatBodyFilters() });
  };

  if (isNotFound) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <MessageSquareOff className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Chat not found</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          This conversation may have been deleted, belongs to another browser, or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2665D9] hover:bg-[#155dfc] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start a new search</span>
        </Link>
      </div>
    );
  }

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]?.id : undefined;
  const hasConversation = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Scrollable Conversation Workspace */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-2 pb-48 sm:pb-52 space-y-5">
        {isLoadingSaved ? (
          <div className="w-full max-w-2xl mr-auto flex items-center gap-2.5 text-xs text-slate-500 py-4 px-5 rounded-2xl bg-[#F5F5F5] border border-[#E6E6E6] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#2665D9] animate-ping" />
            Loading conversation...
          </div>
        ) : hasConversation ? (
          messages.map((message) => {
            const text = getMessageText(message);
            if (message.role === 'user') {
              return (
                <UserMessageCard
                  key={message.id}
                  paperTag={filters.subject !== 'All' ? filters.subject : ''}
                  query={text || '(empty)'}
                />
              );
            }
            if (message.role === 'assistant') {
              const isLast = message.id === lastMessageId;
              return (
                <MessageStream
                  key={message.id}
                  content={text}
                  isStreaming={isLast && isLoading}
                  status={message.metadata?.status}
                  answerOrigin={message.metadata?.answerOrigin}
                  transformation={message.metadata?.transformation}
                  sources={getMessageSources(message)}
                  suggestions={isLast ? message.metadata?.suggestions : undefined}
                  onSuggestionClick={handleSuggestionClick}
                />
              );
            }
            return null;
          })
        ) : (
          <div className="flex-1 flex items-center justify-center select-none pt-24 text-center">
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Ask a topic (e.g. vectors, glucose reactions) or exam question below to search past papers.
            </p>
          </div>
        )}
      </div>

      {/* Docked Search Box */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-10 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-[525px]">
          <SearchBox
            filters={filters}
            onFilterChange={setFilters}
            onSearchSubmit={handleFollowUpSearch}
            variant="pill"
            showSubject={false}
            showTimePeriod={false}
            showDifficulty={false}
            showYear={false}
          />
        </div>
      </div>
    </div>
  );
}

export default function SavedChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-transparent" />}>
      <SavedChatPageInner />
    </Suspense>
  );
}
