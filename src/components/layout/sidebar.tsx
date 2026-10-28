'use client';
import React from "react";
import Link from "next/link";
import logo from '../../assets/image 10.svg';
import wechatLogo from '../../assets/WechatLogo.svg';
import magnifyingGlass from '../../assets/MagnifyingGlass.svg';
import imagesIcon from '../../assets/Images.svg';
import textOutdent from '../../assets/TextOutdent.svg';
import { Trash2 } from 'lucide-react';
import type { RecentChatSession } from "../../types/chat";
import { deleteChatSession, clearAllChatSessions } from "../../lib/chat-history";

export interface SidebarProps {
  recentChats?: RecentChatSession[];
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteChat?: (id: string) => void;
  onClearChats?: () => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  recentChats = [],
  activeChatId = '',
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearChats,
  isOpen = true,
  onToggleOpen,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] shadow-sm hover:bg-[#E6E6E6] text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: '#F5F5F5' }}
        title="Open Sidebar"
      >
        <img
          src={typeof textOutdent === 'string' ? textOutdent : textOutdent.src}
          alt="Open Sidebar"
          className="w-5 h-5 object-contain rotate-180"
        />
      </button>
    );
  }

  return (
    <>
      {/* Mobile backdrop when sidebar is open */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 md:hidden"
        onClick={onToggleOpen}
        aria-hidden="true"
      />
      <aside
        className="fixed md:static inset-y-0 left-0 w-64 h-screen bg-[#F5F5F5] border-r border-[#E0E0E0] flex flex-col justify-between shrink-0 select-none z-40 md:z-30 transition-all shadow-xl md:shadow-none"
        style={{ backgroundColor: '#F5F5F5' }}
      >
      {/* top brand and collapse button */}
      <div className="pt-3 px-3 py-6 flex items-center justify-between">
        <Link href="/">
          <img
            src={typeof logo === 'string' ? logo : logo.src}
            alt="ATAR SPARK"
            className="h-18 px-2 w-auto object-contain cursor-pointer"
          />
        </Link>
        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#E6E6E6] transition-colors cursor-pointer flex items-center justify-center"
          title="Close sidebar"
        >
          <img
            src={typeof textOutdent === 'string' ? textOutdent : textOutdent.src}
            alt="Close sidebar"
            className="w-5 h-5 object-contain"
          />
        </button>
      </div>

      {/* Navigation Actions */}
      <div className="px-3 pt-1 pb-2 space-y-1">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0D0D0D] hover:bg-[#E6E6E6] text-xs font-normal transition-colors cursor-pointer"
        >
          <img
            src={typeof wechatLogo === 'string' ? wechatLogo : wechatLogo.src}
            alt="New Chat"
            className="w-5 h-5 object-contain shrink-0"
          />
          <span>New Chat</span>
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0D0D0D] hover:bg-[#E6E6E6] text-xs font-normal transition-colors cursor-pointer"
        >
          <img
            src={typeof magnifyingGlass === 'string' ? magnifyingGlass : magnifyingGlass.src}
            alt="Search Chat"
            className="w-5 h-5 object-contain shrink-0"
          />
          <span>Search Chat</span>
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0D0D0D] hover:bg-[#E6E6E6] text-xs font-normal transition-colors cursor-pointer"
        >
          <img
            src={typeof imagesIcon === 'string' ? imagesIcon : imagesIcon.src}
            alt="Library"
            className="w-5 h-5 object-contain shrink-0"
          />
          <span>Library</span>
        </button>
      </div>

      {/* Recent chats */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Recent Chats
          </p>
          {recentChats.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onClearChats) {
                  onClearChats();
                } else {
                  clearAllChatSessions();
                }
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear all recent chats"
            >
              Clear all
            </button>
          )}
        </div>
        {recentChats.length === 0 ? (
          <p className="px-3 py-2 text-[11px] text-slate-400 leading-snug">
            Your conversations will appear here after you ask a question.
          </p>
        ) : (
          recentChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group flex items-center justify-between w-full rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#E6E6E6] text-[#0D0D0D] font-medium'
                    : 'text-slate-600 hover:bg-[#E6E6E6] hover:text-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat?.(chat.id)}
                  className="flex-1 min-w-0 text-left px-3 py-2 text-xs truncate cursor-pointer"
                  title={chat.title}
                >
                  {chat.title}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteChat) {
                      onDeleteChat(chat.id);
                    } else {
                      deleteChatSession(chat.id);
                    }
                  }}
                  className="p-1.5 mr-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer shrink-0"
                  title="Delete chat"
                  aria-label={`Delete ${chat.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
    </>
  );
};