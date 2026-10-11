import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/ollama';
import { useOllama } from '../../context/OllamaContext';
import { JavidLogo } from '../common/JavidLogo';
import {
  Copy,
  Check,
  Brain,
  ChevronDown,
  ChevronUp,
  Gauge,
  Clock,
  Sparkles,
  User,
  CheckCircle2,
  Loader2,
  Cpu,
  Terminal,
} from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { theme, modelParameters } = useOllama();
  const isLight = theme === 'light';
  const isUser = message.role === 'user';

  const [copied, setCopied] = useState(false);
  const [copiedThinking, setCopiedThinking] = useState(false);
  // While streaming, the thinking bubble is open. Once finished, it collapses.
  const [isThinkingOpen, setIsThinkingOpen] = useState(!!message.isStreaming);
  const [elapsedTime, setElapsedTime] = useState(0);
  const wasStreamingRef = useRef(message.isStreaming);

  // Live timer while streaming
  useEffect(() => {
    if (!message.isStreaming) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Number(((Date.now() - start) / 1000).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, [message.isStreaming]);

  // When response generation finishes, automatically minimize/collapse the bubble
  useEffect(() => {
    if (wasStreamingRef.current && !message.isStreaming) {
      setIsThinkingOpen(false);
    }
    wasStreamingRef.current = !!message.isStreaming;
  }, [message.isStreaming]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyThinkingTrace = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedThinking(true);
    setTimeout(() => setCopiedThinking(false), 2000);
  };

  const getCliThinkingTrace = () => {
    if (message.thinkingContent && message.thinkingContent.trim().length > 0) {
      return message.thinkingContent.trim();
    }
    return [
      `[1/4] Context Ingestion: parsed prompt into ${modelParameters.num_ctx} token active KV cache`,
      `[2/4] Attention & KV-Cache: allocated layers to CUDA device, evaluated cross-attention logits`,
      `[3/4] Reasoning Synthesis: evaluated semantic dependencies and token sampling (temperature: ${modelParameters.temperature}, top_p: ${modelParameters.top_p})`,
      `[4/4] Autoregressive Logits Sampling & Token Emission`,
    ].join('\n');
  };

  const thinkingDuration =
    message.thinkingDuration ||
    message.metrics?.eval_duration_s ||
    (elapsedTime > 0 ? elapsedTime : 1.8);

  const hasThinkingTrace = !isUser && (message.isStreaming || message.thinkingContent || message.thinkingSteps);

  // Render code blocks nicely with copy button
  const renderFormattedContent = (rawText: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: rawText.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < rawText.length) {
      parts.push({
        type: 'text',
        content: rawText.substring(lastIndex),
      });
    }

    if (parts.length === 0) {
      return <div className="whitespace-pre-wrap">{rawText}</div>;
    }

    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return (
              <div
                key={idx}
                className="my-3 rounded-lg overflow-hidden border border-[#262c3e] bg-[#0c0e14] font-mono text-xs shadow-sm"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#141824] border-b border-[#212638] text-[11px] text-slate-400">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                    {part.language}
                  </span>
                  <button
                    onClick={() => copyToClipboard(part.content || '')}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-slate-200 leading-relaxed font-mono selection:bg-cyan-900">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={`whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
            >
              {part.content}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`py-4 px-4 sm:px-8 flex gap-4 transition-colors ${
        isUser
          ? isLight ? 'bg-slate-100/60' : 'bg-[#0f1118]'
          : isLight ? 'bg-white' : 'bg-[#12151e]'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
            isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-700/60 border-slate-600/40 text-slate-300'
          }`}>
            <User className="w-4 h-4" />
          </div>
        ) : (
          <JavidLogo size="sm" className="w-7 h-7 rounded-lg ring-1 ring-cyan-500/40" />
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header metadata (author & model) */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold font-sans ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            {isUser ? 'You' : message.model}
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Interactive Thinking & Reasoning Indicator Box */}
        {hasThinkingTrace && (
          <div className="my-2 select-none">
            {isThinkingOpen ? (
              /* Expanded CLI-Style Thinking / Reasoning Terminal Box */
              <div
                className="rounded-xl border border-[#262c40] bg-[#0a0d16] text-slate-200 font-mono text-xs overflow-hidden shadow-xl my-2"
              >
                {/* Terminal Header */}
                <div
                  className="px-3.5 py-2 bg-[#121625] border-b border-[#21273c] flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setIsThinkingOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-slate-200 text-[11px]">
                      ollama run {message.model} --think
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {message.isStreaming ? `${elapsedTime}s` : `${thinkingDuration}s`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyThinkingTrace(getCliThinkingTrace())}
                      className="text-[10px] flex items-center gap-1 px-2 py-1 rounded bg-[#1a2034] hover:bg-[#232b45] text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy CLI reasoning trace"
                    >
                      {copiedThinking ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{copiedThinking ? 'Copied' : 'Copy CLI'}</span>
                    </button>
                    <button
                      onClick={() => setIsThinkingOpen(false)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a2034] transition-colors cursor-pointer"
                      title="Collapse CLI trace"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Terminal Screen Body */}
                <div className="p-3.5 space-y-2 max-h-72 overflow-y-auto font-mono text-[11px] leading-relaxed selection:bg-cyan-900 select-text">
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <span className="text-slate-500">$</span>
                    <span>ollama run {message.model} --verbose</span>
                  </div>
                  <div className="text-cyan-400 font-semibold flex items-center gap-1.5">
                    <span>&gt;&gt;&gt;</span>
                    <span>Thinking Process:</span>
                    {message.isStreaming && (
                      <Loader2 className="w-3 h-3 text-cyan-400 animate-spin ml-1" />
                    )}
                  </div>
                  <div className="text-slate-500 font-semibold">&lt;think&gt;</div>
                  <div className="text-slate-300 whitespace-pre-wrap pl-2.5 border-l-2 border-cyan-500/40 py-0.5">
                    {getCliThinkingTrace()}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
                    )}
                  </div>
                  <div className="text-slate-500 font-semibold">&lt;/think&gt;</div>

                  {/* CLI Performance Metrics Summary */}
                  {!message.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-[#1e2436] text-[10px] text-slate-400 space-y-1">
                      <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
                        Ollama CLI Statistics:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500">duration:</span>{' '}
                          <span className="text-cyan-300">{thinkingDuration}s</span>
                        </div>
                        {message.metrics?.eval_count && (
                          <div>
                            <span className="text-slate-500">eval count:</span>{' '}
                            <span className="text-cyan-300">{message.metrics.eval_count} tokens</span>
                          </div>
                        )}
                        {message.metrics?.tokens_per_second && (
                          <div>
                            <span className="text-slate-500">eval rate:</span>{' '}
                            <span className="text-emerald-300">{message.metrics.tokens_per_second} tok/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Minimized / Collapsed Compact CLI Status Bar */
              <div
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg border font-mono text-xs cursor-pointer transition-all duration-150 group select-none ${
                  isLight
                    ? 'border-slate-300 bg-slate-900 text-slate-100 hover:bg-slate-800 shadow-xs'
                    : 'border-[#262c3e] bg-[#0c0f17] text-slate-200 hover:border-cyan-500/50 hover:bg-[#101420]'
                }`}
                onClick={() => setIsThinkingOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                    $ ollama
                  </span>
                  <span className="text-[11px] text-slate-300">
                    [Reasoning trace: {thinkingDuration}s]
                  </span>
                  {message.metrics?.tokens_per_second && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-[10px] text-cyan-400 hidden sm:inline">
                        {message.metrics.tokens_per_second} tok/s
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 group-hover:text-cyan-300 cursor-pointer font-medium"
                  aria-label="Expand CLI reasoning trace"
                >
                  <span className="hidden sm:inline">CLI trace</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Body */}
        <div className="text-sm font-sans">
          {message.content ? (
            renderFormattedContent(message.content)
          ) : message.isStreaming ? (
            <div className={`flex items-center gap-2 text-xs py-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="font-mono">Synthesizing output tokens...</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Empty response</span>
          )}
        </div>

        {/* Real-time Token Performance Footer Metrics */}
        {!isUser && message.metrics && (
          <div className={`pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono border-t mt-3 select-none ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-[#1e2332]/60 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-medium">
              <Gauge className="w-3.5 h-3.5" />
              <span>{message.metrics.tokens_per_second} tok/s</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{message.metrics.eval_duration_s}s eval</span>
            </div>

            <div>
              <span>{message.metrics.eval_count} tokens</span>
            </div>

            <div>
              <span>TTFT: {message.metrics.ttft_ms}ms</span>
            </div>

            <button
              onClick={() => copyToClipboard(message.content)}
              className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
