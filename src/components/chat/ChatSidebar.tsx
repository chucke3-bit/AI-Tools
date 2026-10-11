import React from 'react';
import { useOllama } from '../../context/OllamaContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Server,
  Terminal,
  Layers,
  ChevronLeft,
} from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
  const {
    chats,
    activeChatId,
    selectChat,
    deleteChat,
    createNewChat,
    activeModel,
    setActiveTab,
    theme,
    ollamaHost,
    ollamaConnection,
    setIsConnectionModalOpen,
    models,
  } = useOllama();

  const isLight = theme === 'light';

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className={`w-64 border-r flex flex-col h-full shrink-0 select-none z-20 transition-colors duration-200 font-sans ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c0e14] border-[#212638]'
      }`}
    >
      {/* Top action: New Chat & collapse */}
      <div className={`p-3 border-b flex items-center gap-2 ${isLight ? 'border-slate-200' : 'border-[#1f2434]'}`}>
        <button
          onClick={createNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-medium text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#181c28]'
          }`}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className={`px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
          Recent Chats
        </div>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => selectChat(chat.id)}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
              activeChatId === chat.id
                ? isLight
                  ? 'bg-white text-slate-900 font-medium border border-slate-200 shadow-sm'
                  : 'bg-[#181d2c] text-white font-medium border border-[#262e45]'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141722]'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span className="truncate">{chat.title}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-slate-400 rounded transition-all cursor-pointer"
              title="Delete chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom status & Quick Shortcuts */}
      <div className={`p-3 border-t space-y-2 text-xs ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f121a] border-[#1f2434]'}`}>
        {/* Quick Nav shortcut */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded transition-colors text-[11px] cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#171b26] hover:bg-[#202535] text-slate-300'
            }`}
          >
            <Layers className="w-3 h-3 text-indigo-500" />
            <span>Models</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded transition-colors text-[11px] cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#171b26] hover:bg-[#202535] text-slate-300'
            }`}
          >
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>Terminal</span>
          </button>
        </div>

        {/* Runtime daemon status (Clickable to open Ollama Connection Manager) */}
        <button
          onClick={() => setIsConnectionModalOpen(true)}
          className={`w-full p-2 rounded-lg border flex items-center justify-between text-[11px] transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              : 'bg-[#141722] hover:bg-[#1a1f2e] border-[#212638] text-slate-300'
          }`}
          title="Click to configure Ollama host and view hardware details"
        >
          <div className="flex items-center gap-2 truncate">
            <Server
              className={`w-3.5 h-3.5 shrink-0 ${
                ollamaConnection.isConnected ? 'text-emerald-500' : 'text-amber-500'
              }`}
            />
            <span
              className={`font-mono text-[10px] truncate ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {ollamaHost.replace(/^https?:\/\//, '')}
            </span>
          </div>
          <span
            className={`flex items-center gap-1 font-mono text-[10px] font-medium shrink-0 ${
              ollamaConnection.isConnected ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                ollamaConnection.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {ollamaConnection.isConnected ? `Online (${models.length})` : 'Offline'}
          </span>
        </button>
      </div>
    </aside>
  );
};
