import React, { useState } from 'react';
import { useOllama } from '../../context/OllamaContext';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  X,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  HardDrive,
  Globe,
  Monitor,
  Terminal,
  Zap,
} from 'lucide-react';

export const OllamaConnectionModal: React.FC = () => {
  const {
    ollamaHost,
    ollamaConnection,
    setOllamaHost,
    refreshOllama,
    isConnectionModalOpen,
    setIsConnectionModalOpen,
    setIsGpuModalOpen,
    systemMetrics,
    models,
    theme,
  } = useOllama();

  const isLight = theme === 'light';
  const [hostInput, setHostInput] = useState(ollamaHost);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isConnectionModalOpen) return null;

  const isCloudHost = typeof window !== 'undefined' && window.location.hostname.includes('run.app');
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyHost = async (targetHost?: string) => {
    const newHost = targetHost || hostInput;
    setIsSubmitting(true);
    await setOllamaHost(newHost);
    setHostInput(newHost);
    setIsSubmitting(false);
  };

  const handlePresetClick = (preset: string) => {
    setHostInput(preset);
    handleApplyHost(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in font-sans">
      <div
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden font-sans transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-[#10131b] border-[#22283a] text-slate-200 shadow-black/80'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151924] border-[#212638]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                ollamaConnection.isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Ollama Host &amp; Hardware Diagnostics
                </h3>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                    ollamaConnection.isConnected
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {ollamaConnection.isConnected ? 'Connected' : 'Offline / Unreachable'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure local LLM connection endpoint and inspect real host hardware
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectionModalOpen(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/80'
                : 'text-slate-400 hover:text-white hover:bg-[#202538]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Connection Status Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              ollamaConnection.isConnected
                ? isLight
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                : isLight
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {ollamaConnection.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                    <span>
                      {ollamaConnection.isConnected
                        ? `Connected to Ollama (${ollamaConnection.version || 'v0.5+'})`
                        : `Cannot connect to Ollama at ${ollamaHost}`}
                    </span>
                    {ollamaConnection.isConnected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {ollamaConnection.connectionMode === 'browser_direct' ? 'Direct Browser CORS' : 'Server Proxy'}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs opacity-90 leading-relaxed">
                    {ollamaConnection.isConnected ? (
                      <span>
                        Ollama service is responding actively. Javid Studio detected{' '}
                        <strong className="underline">{models.length} installed model(s)</strong> ready for inference,
                        prompting, and testing.
                      </span>
                    ) : (
                      <span>{ollamaConnection.error || 'Connection failed to respond.'}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => refreshOllama()}
                disabled={ollamaConnection.isChecking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-[#1a1f2d] hover:bg-[#23293c] border-[#2c3348] text-slate-200'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${ollamaConnection.isChecking ? 'animate-spin' : ''}`} />
                <span>{ollamaConnection.isChecking ? 'Checking...' : 'Retest'}</span>
              </button>
            </div>
          </div>

          {/* Port 3000 Mismatch Warning */}
          {(hostInput.includes(':3000') || ollamaHost.includes(':3000')) && (
            <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-300 flex items-start justify-between gap-3 animate-fade-in">
              <div className="space-y-1">
                <div className="font-semibold text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Port Mismatch Detected (Port 3000)</span>
                </div>
                <p className="text-[11px] text-rose-200 leading-relaxed">
                  Port <strong>3000</strong> is Javid Studio's web user interface. Ollama's daemon API runs on port{' '}
                  <strong>11434</strong>. Connecting to port 3000 causes the web app to serve HTML instead of JSON!
                </p>
              </div>
              <button
                onClick={() => handlePresetClick('http://127.0.0.1:11434')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-sm"
              >
                Switch to Port 11434
              </button>
            </div>
          )}

          {/* HTML Response / Doctype Warning Card */}
          {ollamaConnection.isHtmlResponse && !(hostInput.includes(':3000') || ollamaHost.includes(':3000')) && (
            <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-200 space-y-2 animate-fade-in">
              <div className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Target Responded with HTML Web Page (Unexpected token '&lt;' Doctype)</span>
              </div>
              <p className="text-[11px] opacity-95 leading-relaxed">
                {ollamaConnection.htmlDiagnosis ||
                  'The configured endpoint returned an HTML web page instead of Ollama API JSON. Make sure you are connecting to Ollama on port 11434 and not a web interface or proxy warning page.'}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => handlePresetClick('http://127.0.0.1:11434')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Reset to http://127.0.0.1:11434
                </button>
              </div>
            </div>
          )}

          {/* Host Configuration Form */}
          <div className="space-y-3">
            <label className={`block font-medium text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Ollama Host Endpoint URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                      : 'bg-[#151823] border-[#2a3045] text-slate-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
              </div>
              <button
                onClick={() => handleApplyHost()}
                disabled={isSubmitting || ollamaConnection.isChecking}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Save &amp; Connect</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Presets:</span>
              {[
                { label: '127.0.0.1:11434 (Standard)', value: 'http://127.0.0.1:11434' },
                { label: 'localhost:11434', value: 'http://localhost:11434' },
                { label: 'host.docker.internal:11434', value: 'http://host.docker.internal:11434' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-colors cursor-pointer ${
                    ollamaHost === preset.value
                      ? isLight
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 font-semibold'
                        : 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-semibold'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                      : 'bg-[#171b26] hover:bg-[#202536] border-[#252c3e] text-slate-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Preview vs Local Machine Explanation */}
          {(isCloudHost || isHttps) && !ollamaConnection.isConnected && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-[#131b2c] border-blue-900/40 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-blue-600 dark:text-blue-400">
                <Globe className="w-4 h-4 shrink-0" />
                <span>Why 127.0.0.1 does not show your PC's models in the Cloud Preview</span>
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                You are currently viewing Javid Studio in a remote cloud browser session (
                <code className="px-1 py-0.5 rounded bg-blue-500/15 font-mono text-[11px]">https://...</code>).
                Because <code className="font-mono text-[11px]">127.0.0.1</code> refers to the <em>current machine</em>,
                a remote cloud container cannot access your private computer's local ports.
              </p>
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <div
                  className={`p-3 rounded-lg border flex-1 space-y-1.5 ${
                    isLight ? 'bg-white border-blue-200' : 'bg-[#0f1523] border-blue-900/50'
                  }`}
                >
                  <div className="font-semibold text-[11px] flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <Monitor className="w-3.5 h-3.5" />
                    Option 1: Run Javid Studio Locally (Recommended)
                  </div>
                  <p className="text-[11px] opacity-80 leading-normal">
                    Download and run the installer bundle on your machine. On{' '}
                    <code className="font-mono">http://localhost:3000</code>, Javid Studio connects directly to your
                    local Ollama, GPU, VRAM, and CPU!
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border flex-1 space-y-1.5 ${
                    isLight ? 'bg-white border-blue-200' : 'bg-[#0f1523] border-blue-900/50'
                  }`}
                >
                  <div className="font-semibold text-[11px] flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Option 2: Tunnel Local Ollama (ngrok)
                  </div>
                  <p className="text-[11px] opacity-80 leading-normal">
                    Run <code className="font-mono">ngrok http 11434</code> in PowerShell. Paste the generated{' '}
                    <code className="font-mono">https://xxxx.ngrok-free.app</code> into the Host field above!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Local Diagnostics Checklist */}
          {!ollamaConnection.isConnected && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#222739]'
              }`}
            >
              <div className={`font-semibold text-xs flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Ollama Service Checklist (Run on your PC)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Step 1 */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      1. Start Ollama with All Origins (CORS):
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Ollama blocks browser connections by default unless <code className="font-mono">OLLAMA_ORIGINS="*"</code> is set.
                    </div>
                  </div>
                </div>

                {/* Windows Command Copy */}
                <div
                  className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center justify-between gap-2 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c0e14] border-[#252a3c] text-cyan-300'
                  }`}
                >
                  <span className="truncate">
                    powershell: [System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')",
                        'win-cors'
                      )
                    }
                    className="p-1 rounded hover:bg-cyan-500/10 text-cyan-500 cursor-pointer"
                    title="Copy PowerShell command"
                  >
                    {copiedKey === 'win-cors' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Mac/Linux Command Copy */}
                <div
                  className={`p-2.5 rounded-lg border font-mono text-[11px] flex items-center justify-between gap-2 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c0e14] border-[#252a3c] text-cyan-300'
                  }`}
                >
                  <span className="truncate">bash/zsh: OLLAMA_ORIGINS="*" ollama serve</span>
                  <button
                    onClick={() => handleCopy('OLLAMA_ORIGINS="*" ollama serve', 'bash-cors')}
                    className="p-1 rounded hover:bg-cyan-500/10 text-cyan-500 cursor-pointer"
                    title="Copy Linux/macOS command"
                  >
                    {copiedKey === 'bash-cors' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real Detected Hardware Profile */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#222739]'
            }`}
          >
            <div className={`font-semibold text-xs flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Host Hardware Profile</span>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {systemMetrics.isRealHardware ? 'Local System' : 'Cloud Host'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans">
              {/* CPU Profile */}
              <div
                className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1017] border-[#202537]'
                }`}
              >
                <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Processor (CPU)</div>
                <div className={`font-semibold truncate text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {systemMetrics.cpu.model}
                </div>
                <div className="text-[11px] font-mono text-indigo-500 font-medium">
                  {systemMetrics.cpu.cores} Cores · {systemMetrics.cpu.usagePercent}% load
                </div>
              </div>

              {/* VRAM / Accelerator Profile */}
              <div
                className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1017] border-[#202537]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Accelerator (GPU)</div>
                  <button
                    onClick={() => {
                      setIsConnectionModalOpen(false);
                      setIsGpuModalOpen(true);
                    }}
                    className="text-[10px] text-cyan-500 hover:underline cursor-pointer"
                  >
                    Configure
                  </button>
                </div>
                <div className={`font-semibold truncate text-xs ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  {systemMetrics.vram.gpuName}
                </div>
                <div className="text-[11px] font-mono text-cyan-500 font-medium">
                  {systemMetrics.vram.usedGb} GB / {systemMetrics.vram.totalGb} GB VRAM ({systemMetrics.vram.percent}%)
                </div>
              </div>

              {/* System RAM Profile */}
              <div
                className={`p-3 rounded-lg border space-y-1 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1017] border-[#202537]'
                }`}
              >
                <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Host Memory (RAM)</div>
                <div className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {systemMetrics.systemRam.totalGb} GB Total
                </div>
                <div className="text-[11px] font-mono text-blue-500 font-medium">
                  {systemMetrics.systemRam.usedGb} GB Used ({systemMetrics.systemRam.percent}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#212638]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaConnection.isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {ollamaHost}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConnectionModalOpen(false)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-xs transition-colors shadow-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
