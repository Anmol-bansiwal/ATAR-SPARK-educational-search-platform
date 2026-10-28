// src/app/chat/page.tsx
'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { UserMessageCard } from '../../components/chat/user-message-card';
import { MessageStream } from '../../components/chat/message-stream';
import { ClosestQuestionsCard } from '../../components/chat/closest-questions-card';
import { SearchBox } from '../../components/search-box';
import { Toast, type ToastType } from '../../components/toast';
import { useQuestionSearch, useQuestionFilters } from '../../hooks/use-questions';
import { toChatFilters } from '../../lib/api-client';
import {
  createChatId,
  getChatSession,
  titleFromPrompt,
  toStoredMessages,
  upsertChatSession,
} from '../../lib/chat-history';
import type {
  SearchFilterState,
  DifficultyLevel,
} from '../../types/question';
import { DIFFICULTIES, SUBJECTS } from '../../types/question';
import type { StoredChatMessage, ChatMetadata } from '../../types/chat';

type ChatMessage = UIMessage<ChatMetadata>;

/**
 * Extracts plain text from Vercel AI SDK UIMessage structured parts.
 */
function getMessageText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) return '';
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function getMessageSources(message: UIMessage): {
  sourceId: string;
  title: string;
  filename?: string;
  questionText?: string;
  figureUrls?: string[];
  mediaType?: string;
}[] {
  if (!message.parts || message.parts.length === 0) return [];
  return message.parts.flatMap((p) => {
    if (p.type !== 'source-document') return [];
    const sourceId = typeof p.sourceId === 'string' ? p.sourceId : '';
    if (!sourceId) return [];
    const meta = (
      p as {
        providerMetadata?: {
          edusearch?: { figureUrls?: unknown; questionText?: unknown };
        };
      }
    ).providerMetadata?.edusearch;
    const rawFigures = meta?.figureUrls;
    const figureUrls = Array.isArray(rawFigures)
      ? rawFigures.filter((u): u is string => typeof u === 'string' && u.trim() !== '')
      : [];
    const questionText =
      typeof meta?.questionText === 'string' && meta.questionText.trim()
        ? meta.questionText.trim()
        : undefined;
    const mediaType =
      typeof (p as { mediaType?: unknown }).mediaType === 'string'
        ? (p as { mediaType: string }).mediaType
        : undefined;

    return [
      {
        sourceId,
        title: typeof p.title === 'string' && p.title.trim() ? p.title : 'Source',
        filename: typeof p.filename === 'string' ? p.filename : undefined,
        mediaType,
        ...(questionText ? { questionText } : {}),
        ...(figureUrls.length > 0 ? { figureUrls } : {}),
      },
    ];
  });
}

function parseSubject(val: string | null): string {
  const trimmed = val?.trim();
  return trimmed ? trimmed : 'All';
}

function parseTimePeriod(val: string | null): string {
  const trimmed = val?.trim();
  return trimmed ? trimmed : 'All Years';
}

function parseDifficulty(val: string | null): DifficultyLevel | 'All' {
  if (val && (DIFFICULTIES as readonly string[]).includes(val)) {
    return val as DifficultyLevel;
  }
  // Accept REST-style MEDIUM from a shared link
  if (val) {
    const label = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    if ((DIFFICULTIES as readonly string[]).includes(label)) {
      return label as DifficultyLevel;
    }
  }
  return 'All';
}

function parseYear(val: string | null): number | 'All' {
  if (!val || val === 'All') return 'All';
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? 'All' : parsed;
}

const DEFAULT_PAPER_TAG = 'Exam paper';

function ChatPageInner() {
  const searchParams = useSearchParams();

  // Honest params: no query -> no auto-send, no invented defaults.
  const initialQuery = searchParams.get('q')?.trim() ?? '';
  const paperTag = searchParams.get('paper') ?? DEFAULT_PAPER_TAG;
  const chatIdParam = searchParams.get('chat')?.trim() ?? '';

  const [sessionId] = useState(() => chatIdParam || createChatId());
  const [filters, setFilters] = useState<SearchFilterState>({
    query: '',
    subject: parseSubject(searchParams.get('subject')),
    timePeriod: parseTimePeriod(searchParams.get('timePeriod')),
    difficulty: parseDifficulty(searchParams.get('difficulty')),
    year: parseYear(searchParams.get('year')),
  });

  // Toast with auto-dismiss (matches SearchBox behavior)
  const [toast, setToast] = useState<{ message: string; type?: ToastType } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);
  const createdAtRef = useRef<string>(new Date().toISOString());
  const sentQueryRef = useRef<string | null>(null);

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

  // Filter definitions — needed to resolve time-period labels into year ranges
  const { data: filtersData } = useQuestionFilters();

  const subjectOptions: string[] = [
    'All',
    ...((filtersData?.subjects?.map((s) => s.value).filter(Boolean) as string[]) ?? [
      ...SUBJECTS,
    ]),
  ];
  const timePeriodOptions: string[] = [
    'All Years',
    ...((filtersData?.timePeriods?.map((t) => t.label).filter(Boolean) as string[]) ?? [
      'Last 3 Years',
      'Last 5 Years',
      'Last 10 Years',
    ]),
  ];
  const difficultyFromApi: DifficultyLevel[] =
    filtersData?.difficulties
      ?.map((d) => {
        const label = `${d.value.charAt(0)}${d.value.slice(1).toLowerCase()}`;
        if (label === 'Easy' || label === 'Medium' || label === 'Hard') return label;
        return null;
      })
      .filter((d): d is DifficultyLevel => d !== null) ?? [];
  const difficultyOptions: (DifficultyLevel | 'All')[] = [
    'All',
    ...(difficultyFromApi.length > 0
      ? difficultyFromApi
      : (['Easy', 'Medium', 'Hard'] as DifficultyLevel[])),
  ];
  const yearOptions: (number | 'All')[] = [
    'All',
    ...(filtersData?.years?.map((y) => y.value) ?? []),
  ];

  // Vercel AI SDK v7 UI message stream → Next /api/chat proxy → Nest pipeUIMessageStreamToResponse
  const transport = useRef(
    new DefaultChatTransport<ChatMessage>({ api: '/api/chat' })
  ).current;

  const { messages, setMessages, sendMessage, status, error } = useChat<ChatMessage>({
    id: sessionId,
    transport,
  });
  const isLoading = status === 'submitted' || status === 'streaming';

  // Top-level filters body required by EduSearch Nest parseChatRequest
  const chatBodyFilters = useCallback(
    () => ({ filters: toChatFilters(filters) }),
    [filters]
  );

  // Restore a saved thread when opening from Recent Chats (?chat=id).
  useEffect(() => {
    if (!chatIdParam || restoredRef.current) return;
    const saved = getChatSession(chatIdParam);
    if (!saved?.messages?.length) return;
    restoredRef.current = true;
    createdAtRef.current = saved.createdAt || createdAtRef.current;
    setMessages(saved.messages as ChatMessage[]);
    sentQueryRef.current = '__restored__';
  }, [chatIdParam, setMessages]);

  // Surface chat streaming errors as toast instead of alerts
  useEffect(() => {
    if (error) {
      showToast(error.message || 'Failed to stream response from backend.', 'error');
    }
  }, [error, showToast]);

  // Auto-send the initial query once per unique ?q= value.
  // Do not auto-send when restoring an earlier chat from the sidebar.
  useEffect(() => {
    if (chatIdParam) return;
    if (!initialQuery) return;
    if (sentQueryRef.current === '__restored__') return;

    const isNewQuery = sentQueryRef.current !== initialQuery;
    const isChatEmptyAndReady = messages.length === 0 && (status === 'ready' || status === 'error');

    if (isNewQuery || isChatEmptyAndReady) {
      sentQueryRef.current = initialQuery;
      sendMessage({ text: initialQuery }, { body: chatBodyFilters() });
    }
  }, [chatIdParam, initialQuery, messages.length, status, sendMessage, chatBodyFilters]);

  // Persist the thread locally so Recent Chats can reopen it.
  useEffect(() => {
    if (status !== 'ready' || messages.length === 0 || isLoading) return;
    const firstUser = messages.find((m) => m.role === 'user');
    const prompt = firstUser ? getMessageText(firstUser) : '';
    if (!prompt) return;

    const id = chatIdParam || sessionId;
    upsertChatSession({
      id,
      title: titleFromPrompt(prompt),
      paperTag,
      userPrompt: prompt,
      messages: toStoredMessages(messages) as StoredChatMessage[],
      createdAt: createdAtRef.current,
      updatedAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined' && !chatIdParam) {
      const url = new URL(window.location.href);
      url.searchParams.set('chat', id);
      window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`);
    }
  }, [messages, status, isLoading, chatIdParam, sessionId, paperTag]);

  // Submit follow-up query from docked SearchBox (voice or typed)
  const handleFollowUpSearch = () => {
    const trimmed = filters.query.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed }, { body: chatBodyFilters() });
    setFilters((prev) => ({ ...prev, query: '' }));
  };

  // Submit follow-up query from assistant suggestion chips
  const handleSuggestionClick = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed }, { body: chatBodyFilters() });
  };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]?.id : undefined;
  const lastAssistantStatus = lastAiMessage?.metadata?.status;

  // Closest-questions list follows the latest user query only
  const latestQueryText = lastUserMessage
    ? getMessageText(lastUserMessage)
    : initialQuery;

  // Mirror Nest query-intent: don't hit archive search for greetings /
  // bare subjects ("maths") / vague study words — ask intent first.
  const looksLikeGuidanceQuery =
    /^(?:hi|hey|hello|hola|namaste|yo|sup|hiya|good\s+(?:morning|afternoon|evening)|thanks|thank\s+you|thx|bye|goodbye|ok|okay|cool|nice|help(?:\s+me)?|what\s+can\s+you\s+do|how\s+(?:do\s+you\s+work|does\s+this\s+work)|who\s+are\s+you|what\s+is\s+this|(?:(?:help(?:\s+me)?(?:\s+with)?|about|for)\s+)?(?:maths?|mathematics|math|physics|chemistry|biology|english|science|history|geography|study|studies|exam(?:s)?|paper(?:s)?|homework|questions?|revision|notes?|topics?)(?:\s+(?:please|help|questions?|paper|exam|homework|revision|notes?))?)[\s!.?]*$/i.test(
      latestQueryText.trim()
    );

  const {
    filteredResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useQuestionSearch(
    {
      query: latestQueryText,
      subject: filters.subject,
      timePeriod: filters.timePeriod,
      difficulty: filters.difficulty,
      year: filters.year,
    },
    filtersData?.timePeriods,
    {
      enabled:
        latestQueryText.length > 0 &&
        lastAssistantStatus !== 'guidance' &&
        !looksLikeGuidanceQuery,
      debounceMs: 300,
      limit: 10,
    }
  );

  useEffect(() => {
    if (searchError) {
      showToast(searchError.message || 'Failed to retrieve related questions.', 'error');
    }
  }, [searchError, showToast]);

  const hasConversation = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Scrollable Conversation Workspace — full history, not only the last turn */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-2 pb-48 sm:pb-52 space-y-5">
        {hasConversation ? (
          <>
            {messages.map((message) => {
              const text = getMessageText(message);
              if (message.role === 'user') {
                return (
                  <UserMessageCard
                    key={message.id}
                    paperTag={paperTag}
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
                    sources={getMessageSources(message)}
                    suggestions={isLast ? message.metadata?.suggestions : undefined}
                    onSuggestionClick={handleSuggestionClick}
                  />
                );
              }
              return null;
            })}
            {/* Hide closest-list for guidance (hey / help) — suggestions are in the reply */}
            {lastAssistantStatus !== 'guidance' && !looksLikeGuidanceQuery && (
              <ClosestQuestionsCard
                questions={filteredResults}
                isLoading={isSearchLoading}
                error={searchError}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center select-none">
            <p className="text-sm text-slate-400 font-medium">
              Ask a question below to search the exam archive.
            </p>
          </div>
        )}
      </div>

      {/* Docked search — compact pill without filters, size reduced by 30% (max-w-[525px]) */}
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

function ChatPageKeyed() {
  const searchParams = useSearchParams();
  // Remount when switching between saved chats / new ?q= searches.
  const key =
    searchParams.get('chat')?.trim() ||
    searchParams.get('q')?.trim() ||
    'new';
  return <ChatPageInner key={key} />;
}

// Suspense boundary required by Next.js App Router for useSearchParams
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-transparent" />}>
      <ChatPageKeyed />
    </Suspense>
  );
}