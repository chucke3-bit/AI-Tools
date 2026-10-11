import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../../context/OllamaContext';
import { MessageBubble } from './MessageBubble';
import { ChatSidebar } from './ChatSidebar';
import { JavidLogo } from '../common/JavidLogo';
import {
  Send,
  Square,
  Sparkles,
  Zap,
  Code2,
  Terminal,
  PanelLeft,
  SlidersHorizontal,
  ArrowUp,
  Brain,
  Cpu,
} from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const {
    activeChat,
    activeModel,
    sendMessage,
    stopGeneration,
    isGenerating,
    modelParameters,
    setActiveTab,
    theme,
  } = useOllama();

  const isLight = theme === 'light';
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = (activeChat?.messages.length || 0) > 0;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleStarterPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  const STARTER_PROMPTS = [
    {
      icon: <Code2 className="w-4 h-4 text-cyan-500" />,
      title: 'Fibonacci Benchmark',
      prompt: 'Write a Python script that benchmarks memoized Fibonacci calculation and prints execution time in microseconds.',
    },
    {
      icon: <Brain className="w-4 h-4 text-indigo-500" />,
      title: 'Deep Logical Reasoning Trace',
      prompt: 'Reason through how attention mechanisms handle quadratic complexity in long context windows with step-by-step evaluation.',
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      title: 'VRAM & Offload Strategy',
      prompt: 'Explain how layer offloading to VRAM vs CPU RAM affects token generation speed in Ollama.',
    },
    {
      icon: <Terminal className="w-4 h-4 text-emerald-500" />,
      title: 'CUDA Kernel Optimization',
      prompt: 'What is FlashAttention-2 and how does it reduce memory I/O bottlenecks in GPU inference?',
    },
  ];

  // Reusable Claude-style prompt input card
  const renderPromptBox = (isCentered: boolean) => (
    <div className={`w-full ${isCentered ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}`}>
      <div
        className={`relative border transition-all duration-200 ${
          isCentered
            ? 'rounded-xl p-2.5 sm:p-3 shadow-lg'
            : 'rounded-xl p-2 sm:p-2.5 shadow-md'
        } ${
          isLight
            ? 'bg-white border-slate-300 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-slate-200/50'
            : 'bg-[#121624] border-[#252c40] focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-black/40'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (!isCentered) {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${activeModel}...`}
          rows={2}
          className={`w-full bg-transparent px-2 text-sm focus:outline-none resize-none font-sans leading-snug min-h-[44px] max-h-[140px] ${
            isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-500'
          }`}
        />

        {/* Action toolbar inside input card */}
        <div
          className={`mt-1.5 pt-1.5 border-t flex items-center justify-between text-xs select-none ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-[#1e2436] text-slate-400'
          }`}
        >
          {/* Left tools: Model badge & context */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">
              <Zap className="w-3 h-3" />
              <span>{activeModel}</span>
            </div>
            <span className="hidden sm:inline opacity-70">
              {modelParameters.num_ctx} ctx
            </span>
          </div>

          {/* Right action button */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium cursor-pointer ${
                  input.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md hover:opacity-95'
                    : isLight
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1a1f30] text-slate-600 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <span className="hidden sm:inline">Send</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex overflow-hidden transition-colors duration-200 ${isLight ? 'bg-[#fcfdfd]' : 'bg-[#090b10]'}`}>
      {/* Collapsible Left Sidebar */}
      <ChatSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Floating Sidebar Toggle Button when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`absolute top-3 left-3 z-20 p-2 rounded-lg border transition-all cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900 backdrop-blur-xs'
                : 'bg-[#121624]/90 hover:bg-[#181d2e] border-[#252b40] text-slate-300 hover:text-white backdrop-blur-xs'
            }`}
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Dynamic Area: Centered Claude Landing Page OR Conversation Feed */}
        {!hasMessages ? (
          /* Clean Minimalist Claude-Style Landing Page */
          <div className="flex-1 overflow-y-auto px-4 pt-8 pb-10 sm:pt-14 sm:pb-16 flex flex-col items-center justify-start sm:justify-center min-h-0">
            {/* Centered Welcome Header */}
            <div className="text-center max-w-xl mx-auto mb-5 select-none pt-2">
              <div className="mb-3 inline-flex items-center justify-center p-1">
                <JavidLogo size="lg" className="ring-2 ring-cyan-500/40 shadow-xl" />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {getGreeting()}, Chuck
              </h1>
              <p className={`text-sm mt-1.5 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                How can Javid Studio help you today?
              </p>
            </div>

            {/* Centered Claude-Style Prompt Input Card */}
            {renderPromptBox(true)}

            {/* Minimalist Suggestion Starter Chips */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl mx-auto">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterPrompt(item.prompt)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs cursor-pointer group flex items-start gap-2.5 ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-400 shadow-xs'
                      : 'bg-[#111422] hover:bg-[#161a2b] border-[#22283a] hover:border-cyan-500/40'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <div
                      className={`font-medium text-xs mb-0.5 transition-colors ${
                        isLight ? 'text-slate-800 group-hover:text-cyan-600' : 'text-slate-200 group-hover:text-cyan-400'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className={`text-[11px] line-clamp-1 leading-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.prompt}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Distraction-Free Minimal Footer Note */}
            <div className={`mt-8 text-[11px] font-mono text-center select-none ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
              Local Ollama runtime · CUDA acceleration · DeepSeek reasoning traces
            </div>
          </div>
        ) : (
          /* Conversation Feed with Docked Input Box */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className={`flex-1 overflow-y-auto divide-y ${isLight ? 'divide-slate-200' : 'divide-[#181d2a]'}`}>
              {activeChat?.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Docked Prompt Input Box */}
            <div
              className={`p-3 sm:p-4 border-t transition-colors shrink-0 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0c0e14] border-[#1c2132]'
              }`}
            >
              {renderPromptBox(false)}

              {/* Sub-bar context info */}
              <div className={`max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] px-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                <div className="flex items-center gap-2">
                  <span>Model: {activeModel}</span>
                  <span>·</span>
                  <span>Context: {modelParameters.num_ctx} tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={isLight ? 'hover:text-slate-900 transition-colors cursor-pointer' : 'hover:text-slate-300 transition-colors cursor-pointer'}
                  >
                    Run in CLI
                  </button>
                  <span>·</span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
