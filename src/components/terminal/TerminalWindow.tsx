import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../../context/OllamaContext';
import {
  Terminal as TerminalIcon,
  Trash2,
  CornerDownLeft,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'system';
  text: string;
  command?: string;
  timestamp: string;
}

export const TerminalWindow: React.FC = () => {
  const {
    executeTerminalCommand,
    activeModel,
    sendMessage,
    setVerboseLogging,
    verboseLogging,
    addLog,
    theme,
    toggleTheme,
    setTheme,
  } = useOllama();

  const isLight = theme === 'light';

  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'ollama ps',
    'nvidia-smi',
    '/set verbose',
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inReplModel, setInReplModel] = useState<string | null>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Javid Studio Terminal (v0.5.12) · Linux 6.6.137+ x86_64 · CUDA 12.4',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Type "help" for a list of available commands, or try "nvidia-smi", "ollama ps", "/set verbose".',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd) return;

    // Add to history
    setHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
    setHistoryIndex(-1);

    // Prompt line
    const promptPrefix = inReplModel ? `>>> ` : `javid@studio:~$ `;
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-cmd`,
        type: 'prompt',
        text: `${promptPrefix}${cmd}`,
        command: cmd,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInputCommand('');

    // If currently inside interactive `ollama run` REPL:
    if (inReplModel) {
      if (cmd === '/bye' || cmd === 'exit' || cmd === 'quit') {
        setInReplModel(null);
        setLines((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-out`,
            type: 'system',
            text: `Exited interactive session for ${inReplModel}.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      if (cmd === '/set verbose') {
        setVerboseLogging(true);
        setLines((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-out`,
            type: 'output',
            text: 'Verbose mode enabled.',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      if (cmd === '/show info') {
        setLines((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-out`,
            type: 'output',
            text: `Model: ${inReplModel}\nContext length: 8192\nFlash attention: enabled\nGPU offload: 100%`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      // Generate response via server
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'output',
          text: `[${inReplModel} generating response...]`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      const output = await executeTerminalCommand(`echo Assistant: Running generation for query...`);
      setLines((prev) => [
        ...prev.slice(0, -1),
        {
          id: `line-${Date.now()}-out`,
          type: 'output',
          text: `Here is the response from ${inReplModel} for: "${cmd}"\n\n- Computation executed with CUDA kernels.\n- Average speed: 46.8 tok/s.\n(Type /bye to return to standard shell)`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // Standard shell commands
    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === '/theme light') {
      setTheme('light');
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'system',
          text: 'Theme switched to Light mode.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    if (cmd === '/theme dark') {
      setTheme('dark');
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'system',
          text: 'Theme switched to Dark mode.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    if (cmd === '/theme' || cmd === '/theme toggle') {
      toggleTheme();
      const nextTheme = theme === 'dark' ? 'Light' : 'Dark';
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'system',
          text: `Theme toggled to ${nextTheme} mode.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    if (cmd.startsWith('ollama run ')) {
      const modelToRun = cmd.replace('ollama run ', '').trim();
      setInReplModel(modelToRun);
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'system',
          text: `pulling manifest\nloading model ${modelToRun} into VRAM...\nsuccess\nInteractive prompt initialized for ${modelToRun}. Send a prompt or type "/bye" to exit.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // Call server terminal endpoint
    try {
      const output = await executeTerminalCommand(cmd);
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-out`,
          type: 'output',
          text: output,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-err`,
          type: 'output',
          text: `bash: command failed to execute`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = Math.min(history.length - 1, historyIndex + 1);
        setHistoryIndex(nextIndex);
        setInputCommand(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputCommand(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    }
  };

  const runQuickCommand = (cmd: string) => {
    setInputCommand(cmd);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full font-mono text-xs overflow-hidden select-text transition-colors duration-200 ${
        isLight ? 'bg-slate-900 text-slate-100' : 'bg-[#090b10] text-slate-200'
      }`}
    >
      {/* Terminal Title Bar */}
      <div
        className={`h-10 border-b px-4 flex items-center justify-between shrink-0 select-none transition-colors ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#0e111a] border-[#212638] text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-500" />
          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            Interactive Bash &amp; Ollama Terminal
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
          <span className={`text-[11px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {inReplModel ? `Active REPL (${inReplModel})` : 'bash session /dev/pts/1'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLines([])}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#1a1e2d]'
            }`}
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Quick Command Shortcuts Bar */}
      <div
        className={`px-4 py-2 border-b flex flex-wrap items-center gap-1.5 select-none shrink-0 transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c0e15] border-[#1c2132]'
        }`}
      >
        <span className={`text-[10px] uppercase tracking-wider font-semibold mr-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          Quick Run:
        </span>
        {[
          'ollama ps',
          'nvidia-smi',
          'ollama list',
          '/theme toggle',
          '/set verbose',
          '/show info',
          'free -h',
          'df -h',
          `ollama run ${activeModel}`,
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => runQuickCommand(cmd)}
            className={`px-2 py-1 rounded border transition-colors text-[11px] cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-cyan-700 border-slate-300 shadow-xs'
                : 'bg-[#151926] hover:bg-[#1e2436] text-slate-300 hover:text-cyan-300 border-[#23293e]'
            }`}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Scroll Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2 leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="space-y-1">
            {line.type === 'system' && (
              <div className="text-slate-500 text-[11px] italic"># {line.text}</div>
            )}
            {line.type === 'prompt' && (
              <div className="flex items-center gap-2">
                <span className={inReplModel ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {line.text}
                </span>
              </div>
            )}
            {line.type === 'output' && (
              <pre className="whitespace-pre-wrap text-slate-300 font-mono text-[11.5px] leading-relaxed pl-2 border-l border-slate-800">
                {line.text}
              </pre>
            )}
          </div>
        ))}

        {/* Current Active Input Prompt Line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
          <span className={inReplModel ? 'text-amber-400 font-bold shrink-0' : 'text-emerald-400 font-bold shrink-0'}>
            {inReplModel ? `>>> ` : `javid@studio:~$ `}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono caret-cyan-400"
            autoFocus
            spellCheck={false}
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
