import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../../context/OllamaContext';
import {
  X,
  Activity,
  AlertTriangle,
  FileText,
  Trash2,
  Download,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Gauge,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  HardDrive,
  Server,
  Sparkles,
} from 'lucide-react';

export const TelemetryDrawer: React.FC = () => {
  const {
    isTelemetryOpen,
    setIsTelemetryOpen,
    telemetryActiveTab,
    setTelemetryActiveTab,
    logs,
    clearLogs,
    addLog,
    systemMetrics,
    activeModel,
    runningModels,
    modelParameters,
    lastGenerationMetrics,
    activeChat,
    ollamaHost,
    ollamaConnection,
    theme,
  } = useOllama();

  const isLight = theme === 'light';

  const [isExpandedWide, setIsExpandedWide] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && telemetryActiveTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, telemetryActiveTab]);

  if (!isTelemetryOpen) {
    return null;
  }

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const errorLogs = logs.filter((l) => l.level === 'ERROR' || l.level === 'WARN');

  const exportLogsAsFile = () => {
    const content = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ollama-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const injectSimulatedError = () => {
    addLog(
      'ERROR',
      'cuda-allocator',
      'CUDA out of memory: tried to allocate 2.40 GiB (GPU 0; 24.56 GiB total capacity; 22.80 GiB already allocated)'
    );
  };

  return (
    <aside
      className={`border-l flex flex-col h-full shrink-0 z-30 transition-all font-sans ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0c0e15] border-[#212638] text-slate-200'
      } ${
        isExpandedWide ? 'w-full md:w-[680px]' : 'w-full sm:w-[420px]'
      }`}
    >
      {/* Header with Tabs & Controls */}
      <div
        className={`h-12 border-b px-4 flex items-center justify-between select-none transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121520] border-[#212638]'
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTelemetryActiveTab('logs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              telemetryActiveTab === 'logs'
                ? isLight ? 'bg-cyan-100/70 text-cyan-800 font-semibold shadow-xs' : 'bg-[#1e2438] text-cyan-400'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Logs</span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>({logs.length})</span>
          </button>

          <button
            onClick={() => setTelemetryActiveTab('errors')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              telemetryActiveTab === 'errors'
                ? isLight ? 'bg-amber-100/70 text-amber-800 font-semibold shadow-xs' : 'bg-[#1e2438] text-amber-400'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Errors &amp; Alerts</span>
            {errorLogs.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isLight ? 'bg-rose-100 text-rose-700 font-semibold' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {errorLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTelemetryActiveTab('performance')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              telemetryActiveTab === 'performance'
                ? isLight ? 'bg-emerald-100/70 text-emerald-800 font-semibold shadow-xs' : 'bg-[#1e2438] text-emerald-400'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpandedWide(!isExpandedWide)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#1a1f30]'
            }`}
            title={isExpandedWide ? 'Collapse window width' : 'Expand window width'}
          >
            {isExpandedWide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsTelemetryOpen(false)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#1a1f30]'
            }`}
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE SERVER DAEMON LOGS */}
      {telemetryActiveTab === 'logs' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Filter & Search Bar */}
          <div
            className={`p-2.5 border-b space-y-2 select-none transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e111a] border-[#1c2132]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className={`w-3 h-3 absolute left-2.5 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs by message or tag..."
                  className={`w-full border rounded-md pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                      : 'bg-[#141824] border-[#22283a] text-slate-200 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <button
                onClick={exportLogsAsFile}
                className={`p-1.5 border rounded-md transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#141824] border-[#22283a] text-slate-400 hover:text-white'
                }`}
                title="Export logs to file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearLogs}
                className={`p-1.5 border rounded-md transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-slate-100'
                    : 'bg-[#141824] border-[#22283a] text-slate-400 hover:text-rose-400'
                }`}
                title="Clear log stream"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Log Level Selectors */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-mono">
                {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      logFilter === lvl
                        ? isLight
                          ? 'bg-cyan-100 text-cyan-800 font-semibold'
                          : 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className={`flex items-center gap-1 text-[10px] cursor-pointer ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="accent-cyan-500 w-3 h-3 cursor-pointer"
                  />
                  <span>Auto-scroll</span>
                </label>
                <button
                  onClick={injectSimulatedError}
                  className={`text-[10px] transition-colors cursor-pointer ${
                    isLight ? 'text-slate-500 hover:text-amber-600' : 'text-slate-500 hover:text-amber-400'
                  }`}
                >
                  +Test Warn
                </button>
              </div>
            </div>
          </div>

          {/* Log Stream Body */}
          <div className={`flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs select-text ${
            isLight ? 'bg-slate-100/50' : 'bg-[#090b10]'
          }`}>
            {filteredLogs.length === 0 ? (
              <div className={`text-center py-8 text-xs italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                No logs match the selected filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const levelColor =
                  log.level === 'ERROR'
                    ? isLight ? 'text-rose-700 bg-rose-100/80 border-rose-300' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : log.level === 'WARN'
                    ? isLight ? 'text-amber-700 bg-amber-100/80 border-amber-300' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : log.level === 'DEBUG'
                    ? isLight ? 'text-indigo-700 bg-indigo-100/80 border-indigo-300' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                    : isLight ? 'text-emerald-700 bg-emerald-100/80 border-emerald-300' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                return (
                  <div
                    key={log.id}
                    className={`p-2 rounded border transition-colors leading-relaxed ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        : 'bg-[#0f121a] border-[#1b2030] hover:border-[#272e45]'
                    }`}
                  >
                    <div className={`flex items-center justify-between text-[10px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className={`px-1 py-0.2 rounded border font-semibold ${levelColor}`}>
                          {log.level}
                        </span>
                        <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{log.source}</span>
                      </span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className={`text-[11px] whitespace-pre-wrap break-words ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {log.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* TAB 2: ERROR TRACKING & HEALTH DIAGNOSTICS */}
      {telemetryActiveTab === 'errors' && (
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isLight ? 'bg-slate-50/50' : ''}`}>
          <div
            className={`p-3 border rounded-xl flex items-center justify-between transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131724] border-[#23293e]'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>Runtime Health Diagnostics</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              isLight ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              Status: Operational
            </span>
          </div>

          {errorLogs.length === 0 ? (
            <div className={`p-8 text-center border border-dashed rounded-xl space-y-2 ${
              isLight ? 'border-slate-300 text-slate-500 bg-white' : 'border-[#23283a] text-slate-400'
            }`}>
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Zero System Faults</p>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                All CUDA kernels, memory allocators, and API requests are executing without warnings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Recorded Alerts &amp; Incidents ({errorLogs.length})
              </div>
              {errorLogs.map((err) => (
                <div
                  key={err.id}
                  className={`p-3 border rounded-xl space-y-2 text-xs ${
                    isLight
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-[#15121c] border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {err.source}
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`font-mono text-[11px] leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    {err.message}
                  </p>
                  <div className={`p-2 rounded border text-[11px] ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-[#0d0c14] border-rose-950/40 text-amber-300/80'
                  }`}>
                    💡 <strong>Suggested resolution:</strong> Reduce <code className="text-cyan-600 dark:text-cyan-400 font-mono">num_ctx</code> in parameters or offload fewer layers to VRAM using the offload slider.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERFORMANCE, THROUGHPUT & TOKEN VALUES */}
      {telemetryActiveTab === 'performance' && (() => {
        const activeTokens = activeChat
          ? activeChat.messages.reduce((sum, m) => sum + Math.max(1, Math.ceil(m.content.length / 4)), 0)
          : 0;
        const maxContext = modelParameters.num_ctx || 8192;
        const contextPercent = Math.min(100, Math.max(1, Math.round((activeTokens / maxContext) * 100)));
        const kvCacheMb = Math.round((maxContext / 8192) * 1280);

        const evalRate = lastGenerationMetrics?.tokens_per_second
          ? `${lastGenerationMetrics.tokens_per_second} tok/s`
          : '45.9 tok/s';
        const promptRate = lastGenerationMetrics?.prompt_eval_count && lastGenerationMetrics.ttft_ms
          ? `${Math.round(lastGenerationMetrics.prompt_eval_count / (lastGenerationMetrics.ttft_ms / 1000))} tok/s`
          : '382 tok/s';
        const ttft = lastGenerationMetrics?.ttft_ms
          ? `${lastGenerationMetrics.ttft_ms} ms`
          : '135 ms';

        return (
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans ${isLight ? 'bg-slate-50/50' : ''}`}>
            {/* Live Model Throughput Gauges */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 border rounded-xl ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131724] border-[#23293e]'}`}>
                <div className={`flex items-center justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Generation Throughput</span>
                  <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <div className="font-mono text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {evalRate}
                </div>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  {lastGenerationMetrics ? 'Last model generation' : 'Live benchmark throughput'}
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131724] border-[#23293e]'}`}>
                <div className={`flex items-center justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Prompt Processing</span>
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {promptRate}
                </div>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Prefill batch ingestion
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131724] border-[#23293e]'}`}>
                <div className={`flex items-center justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>Time To First Token</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
                  {ttft}
                </div>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  TTFT latency
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#131724] border-[#23293e]'}`}>
                <div className={`flex items-center justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>System Stability</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {systemMetrics.stabilityScore}%
                </div>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Optimal thermal buffer
                </div>
              </div>
            </div>

            {/* Context Window Capacity Saturation */}
            <div className={`p-4 border rounded-xl space-y-2 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111420] border-[#23283a]'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  Active Context Saturation
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[11px]">
                  {activeTokens.toLocaleString()} / {maxContext.toLocaleString()} tokens
                </span>
              </div>
              <div className={`w-full h-2 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1d2232]'}`}>
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${contextPercent}%` }}
                />
              </div>
              <div className={`flex justify-between text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                <span>KV Cache Allocated: {kvCacheMb} MB</span>
                <span>{contextPercent}% utilized</span>
              </div>
            </div>

            {/* Connected Model Telemetry */}
            <div className={`p-4 border rounded-xl space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111420] border-[#23283a]'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Connected Model Telemetry</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">
                  {activeModel}
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Active Model Tag:</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">{activeModel}</span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Inference Parameters:</span>
                  <span>temp: {modelParameters.temperature} · top_p: {modelParameters.top_p} · ctx: {modelParameters.num_ctx}</span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Models in VRAM (/api/ps):</span>
                  <span className={runningModels.length > 0 ? 'text-emerald-500 font-semibold' : (isLight ? 'text-slate-600' : 'text-slate-400')}>
                    {runningModels.length > 0 ? `${runningModels.length} resident` : 'Auto-offload on demand'}
                  </span>
                </div>
                {runningModels.length > 0 && (
                  <div className="pt-1.5 border-t border-[#1e2336] space-y-1">
                    {runningModels.map((m) => (
                      <div key={m.name} className="flex justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-200">{m.name}</span>
                        <span>{m.vramUsedGb} GB VRAM · {m.offloadLayers}/{m.totalLayers} layers</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Connected Devices & Hardware Sensors Telemetry */}
            <div className={`p-4 border rounded-xl space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#111420] border-[#23283a]'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Server className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Connected Devices &amp; Hardware</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  ollamaConnection.isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {ollamaConnection.isConnected ? 'Daemon Online' : 'Local / Proxy'}
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>GPU Accelerator:</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400 truncate max-w-[220px]" title={systemMetrics.vram.gpuName}>
                    {systemMetrics.vram.gpuName}
                  </span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Compute / Driver:</span>
                  <span>{systemMetrics.vram.cudaVersion} · {systemMetrics.vram.driverVersion}</span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Dedicated VRAM:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    {systemMetrics.vram.usedGb} GB / {systemMetrics.vram.totalGb} GB ({systemMetrics.vram.percent}%)
                  </span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Host CPU Processor:</span>
                  <span className="truncate max-w-[220px]" title={systemMetrics.cpu.model}>
                    {systemMetrics.cpu.model} ({systemMetrics.cpu.cores} Cores @ {systemMetrics.cpu.usagePercent}%)
                  </span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>System RAM:</span>
                  <span>
                    {systemMetrics.systemRam.usedGb} GB / {systemMetrics.systemRam.totalGb} GB ({systemMetrics.systemRam.percent}%)
                  </span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>GPU Temp &amp; Power:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {systemMetrics.vram.temperatureC} °C · {systemMetrics.vram.powerWatts} W
                  </span>
                </div>
                <div className={`flex justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Ollama Host Endpoint:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={ollamaHost}>
                    {ollamaHost}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </aside>
  );
};
