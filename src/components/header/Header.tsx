import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../../context/OllamaContext';
import { ColabResourceWidget } from './ColabResourceWidget';
import { JavidLogo } from '../common/JavidLogo';
import { InstallerModal } from '../installer/InstallerModal';
import { OllamaConnectionModal } from '../common/OllamaConnectionModal';
import { GpuSelectorModal } from '../common/GpuSelectorModal';
import {
  MessageSquare,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Zap,
  Download,
  Sun,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeModel,
    setActiveModel,
    models,
    activeTab,
    setActiveTab,
    isTelemetryOpen,
    setIsTelemetryOpen,
    modelParameters,
    updateModelParameters,
    theme,
    setTheme,
  } = useOllama();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (paramsRef.current && !paramsRef.current.contains(e.target as Node)) {
        setIsParamsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between select-none z-30 shrink-0 transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0c0e14] border-[#212638]'
      }`}
    >
      {/* Left: Brand, Theme Toggle & Configuration Button */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Javid Studio Logo */}
        <div className="flex items-center gap-2.5">
          <JavidLogo size="md" className="ring-1 ring-cyan-500/40" />
          <div className="flex flex-col select-none font-mono">
            <span className={`font-bold text-sm leading-none tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Javid
            </span>
            <span className="font-bold text-cyan-500 tracking-wide text-xs leading-none -mt-1 flex items-center">
              <span className="invisible select-none" aria-hidden="true">Ja</span>
              <span>Studio</span>
            </span>
          </div>
        </div>

        {/* Light / Dark Mode Toggle (Icons only) */}
        <div
          className={`flex items-center p-0.5 rounded-lg border text-xs transition-all ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-[#12151f] border-[#212638]'
          }`}
          role="group"
          aria-label="Theme selection"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isLight
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Light Theme"
            aria-pressed={isLight}
          >
            <Sun className={`w-3.5 h-3.5 ${isLight ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              !isLight
                ? 'bg-[#1f2638] text-cyan-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dark Theme"
            aria-pressed={!isLight}
          >
            <Moon className={`w-3.5 h-3.5 ${!isLight ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Configuration Button (placed right next to Themes buttons) */}
        <div className="relative" ref={paramsRef}>
          <button
            onClick={() => setIsParamsOpen(!isParamsOpen)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isParamsOpen
                ? isLight ? 'bg-cyan-50 border-cyan-500 text-cyan-600' : 'bg-[#1c2235] border-cyan-500 text-cyan-400'
                : isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-[#141722] border-[#272c3e] text-slate-400 hover:text-white'
            }`}
            title="Configuration: Inference Parameters (Temp, Context, Top-P)"
            aria-label="Model Configuration"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {isParamsOpen && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-72 border rounded-xl shadow-2xl p-4 z-50 text-xs space-y-4 ${
                isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50' : 'bg-[#141722] border-[#272c3e] text-slate-200'
              }`}
            >
              <div className={`font-semibold border-b pb-2 flex items-center justify-between ${isLight ? 'text-slate-900 border-slate-200' : 'text-slate-200 border-[#23283a]'}`}>
                <span>Model Configuration</span>
                <span className="text-[10px] font-mono text-cyan-500">{activeModel}</span>
              </div>

              {/* Temperature */}
              <div>
                <div className={`flex justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <span>Temperature</span>
                  <span className="font-mono text-cyan-500 font-semibold">{modelParameters.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={modelParameters.temperature}
                  onChange={(e) =>
                    updateModelParameters({ temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Context Length */}
              <div>
                <div className={`flex justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <span>Context Window (num_ctx)</span>
                  <span className="font-mono text-cyan-500 font-semibold">{modelParameters.num_ctx}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                  {[2048, 4096, 8192, 16384].map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => updateModelParameters({ num_ctx: ctx })}
                      className={`py-1 rounded border transition-colors cursor-pointer ${
                        modelParameters.num_ctx === ctx
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 font-semibold'
                          : isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-[#1a1e2c] border-[#252b3d] text-slate-400 hover:text-white'
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top P */}
              <div>
                <div className={`flex justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <span>Top P</span>
                  <span className="font-mono text-cyan-500 font-semibold">{modelParameters.top_p}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={modelParameters.top_p}
                  onChange={(e) => updateModelParameters({ top_p: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Chat Mode Indicator & Model Dropdown Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'chat'
              ? isLight
                ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-xs'
                : 'bg-[#181d2c] border-cyan-500/40 text-cyan-300 font-semibold shadow-xs'
              : isLight
              ? 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
              : 'bg-transparent border-transparent text-slate-400 hover:text-white'
          }`}
          title="Chat Workspace"
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
          <span>Chat</span>
        </button>

        {/* Model Selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-xs cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                : 'bg-[#141722] hover:bg-[#1a1e2d] border-[#272c3e] text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-mono font-medium">{activeModel}</span>
            <ChevronDown className={`w-3 h-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          </button>

          {isModelDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-64 border rounded-xl shadow-2xl py-1.5 z-50 text-xs font-sans ${
                isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50' : 'bg-[#141722] border-[#272c3e] text-slate-200'
              }`}
            >
              <div className={`px-3 py-1.5 text-[10px] uppercase font-semibold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Installed Models
              </div>
              <div className="max-h-60 overflow-y-auto">
                {models.map((model) => (
                  <button
                    key={model.tag}
                    onClick={() => {
                      setActiveModel(model.tag);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                      activeModel === model.tag
                        ? isLight ? 'bg-cyan-50 text-cyan-700 font-medium' : 'bg-[#1b2238] text-cyan-400'
                        : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-[#1c2132]'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-medium text-xs">{model.tag}</div>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        {model.parameters} · {model.quantization} · {model.sizeGb} GB
                      </div>
                    </div>
                    {activeModel === model.tag && <Check className="w-4 h-4 text-cyan-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Google Colab Resource Monitor, Install Locally & Telemetry Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Install Locally button */}
        <button
          onClick={() => setIsInstallerOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer shadow-sm ${
            isLight
              ? 'bg-cyan-50 hover:bg-cyan-100/80 border-cyan-300 text-cyan-700'
              : 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 hover:from-cyan-600/30 hover:to-indigo-600/30 border-cyan-500/40 hover:border-cyan-400 text-cyan-300'
          }`}
          title="Install Javid Studio locally on your PC (Windows, macOS, Linux, Docker)"
        >
          <Download className="w-3.5 h-3.5 text-cyan-500" />
          <span className="hidden sm:inline">Install Locally</span>
        </button>

        {/* Google Colab Resource Widget */}
        <ColabResourceWidget />

        {/* Expandable Logs & Telemetry button */}
        <button
          onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
            isTelemetryOpen
              ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-300'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              : 'bg-[#141722] border-[#272c3e] text-slate-300 hover:text-white hover:bg-[#1a1e2d]'
          }`}
          title="Toggle expandable side window for logs, errors, and throughput telemetry"
        >
          <Activity className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">Logs &amp; Telemetry</span>
        </button>
      </div>

      {/* Local Installer Dialog */}
      <InstallerModal isOpen={isInstallerOpen} onClose={() => setIsInstallerOpen(false)} />

      {/* Ollama Connection & Hardware Diagnostics Dialog */}
      <OllamaConnectionModal />

      {/* GPU & Accelerator Selection Dialog */}
      <GpuSelectorModal />
    </header>
  );
};
