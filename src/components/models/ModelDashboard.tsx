import React, { useState } from 'react';
import { useOllama } from '../../context/OllamaContext';
import { POPULAR_MODELS_LIBRARY } from '../../data/defaultModels';
import {
  Download,
  Trash2,
  Play,
  RotateCcw,
  Sliders,
  Search,
  FileCode,
  Layers,
  Activity,
  Check,
  HardDrive,
  Cpu,
  Zap,
  Info,
  FolderInput,
  Link2,
  Upload,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ModelDashboard: React.FC = () => {
  const {
    models,
    runningModels,
    activeModel,
    setActiveModel,
    setActiveTab,
    pullProgress,
    pullModel,
    importModel,
    importProgress,
    deleteModel,
    loadModelIntoVram,
    unloadModelFromVram,
    theme,
    ollamaHost,
    ollamaConnection,
    refreshOllama,
    setIsConnectionModalOpen,
    setIsGpuModalOpen,
    systemMetrics,
  } = useOllama();

  const isLight = theme === 'light';
  const [activeSubTab, setActiveSubTab] = useState<'installed' | 'running' | 'pull' | 'import' | 'modelfile'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [pullInput, setPullInput] = useState('');
  const [selectedModelfile, setSelectedModelfile] = useState<string | null>(null);

  // Import State
  const [importSourceType, setImportSourceType] = useState<'manifest_url' | 'file_path' | 'file_upload'>('manifest_url');
  const [importUrl, setImportUrl] = useState('');
  const [importFilePath, setImportFilePath] = useState('');
  const [importTag, setImportTag] = useState('');
  const [importSizeGb, setImportSizeGb] = useState('8.5');
  const [importParamsSize, setImportParamsSize] = useState('14.7B');
  const [importQuantization, setImportQuantization] = useState('Q4_K_M');
  const [importFamily, setImportFamily] = useState('deepseek');
  const [importContextLength, setImportContextLength] = useState<number>(32768);
  const [importSystemPrompt, setImportSystemPrompt] = useState('You are an intelligent assistant imported into Javid Studio.');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Modelfile Studio state
  const [customModelName, setCustomModelName] = useState('coding-expert:latest');
  const [customBaseModel, setCustomBaseModel] = useState('llama3.3:70b');
  const [customTemp, setCustomTemp] = useState('0.2');
  const [customSystem, setCustomSystem] = useState(
    'You are a senior full-stack software engineer. Provide concise, clean, and production-tested code.'
  );

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.quantization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePullSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pullInput.trim()) {
      pullModel(pullInput.trim());
      setPullInput('');
    }
  };

  const handleCreateCustomModel = () => {
    if (!customModelName.trim()) return;
    pullModel(customModelName.trim());
    setActiveSubTab('installed');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceValue =
      importSourceType === 'manifest_url'
        ? importUrl.trim()
        : importSourceType === 'file_path'
        ? importFilePath.trim()
        : uploadedFileName || 'uploaded-model.gguf';

    const finalTag = importTag.trim() || (importSourceType === 'manifest_url' ? 'imported/model:latest' : 'local/model:latest');

    if (!sourceValue || !finalTag) return;

    const success = await importModel({
      tag: finalTag,
      sourceType: importSourceType,
      sourceInput: sourceValue,
      sizeGb: parseFloat(importSizeGb) || 8.0,
      parameters: importParamsSize,
      quantization: importQuantization,
      family: importFamily,
      contextLength: importContextLength,
      systemPrompt: importSystemPrompt,
    });

    if (success) {
      setTimeout(() => {
        setActiveSubTab('installed');
      }, 1200);
    }
  };

  const prefillPreset = (
    type: 'manifest_url' | 'file_path',
    input: string,
    tag: string,
    size: string,
    params: string,
    family: string,
    quant: string
  ) => {
    setImportSourceType(type);
    if (type === 'manifest_url') {
      setImportUrl(input);
    } else {
      setImportFilePath(input);
    }
    setImportTag(tag);
    setImportSizeGb(size);
    setImportParamsSize(params);
    setImportFamily(family);
    setImportQuantization(quant);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const cleanName = file.name.replace(/\.(gguf|bin|json)$/i, '');
      setImportTag(`local/${cleanName.toLowerCase()}:latest`);
      const sizeGb = Number((file.size / (1024 ** 3)).toFixed(2));
      setImportSizeGb(sizeGb > 0 ? sizeGb.toString() : '4.2');
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-200 ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0a0c10] text-slate-200'} font-sans`}>
      {/* Sub-header Tabs & Search */}
      <div className={`h-14 border-b px-6 flex items-center justify-between shrink-0 transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e1118] border-[#212638]'}`}>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveSubTab('installed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'installed'
                ? isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-300' : 'bg-[#1b2133] text-cyan-400 border border-cyan-500/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Installed ({models.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('running')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'running'
                ? isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-300' : 'bg-[#1b2133] text-cyan-400 border border-cyan-500/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Running in VRAM ({runningModels.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pull')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pull'
                ? isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-300' : 'bg-[#1b2133] text-cyan-400 border border-cyan-500/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pull Model</span>
          </button>

          {/* NEW IMPORT TAB */}
          <button
            onClick={() => setActiveSubTab('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'import'
                ? isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-300' : 'bg-[#1b2133] text-cyan-400 border border-cyan-500/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderInput className="w-3.5 h-3.5 text-cyan-500" />
            <span>Import (URL / Path)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modelfile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'modelfile'
                ? isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-300' : 'bg-[#1b2133] text-cyan-400 border border-cyan-500/30'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Modelfile Studio</span>
          </button>
        </div>

        {/* Search input for installed models */}
        {activeSubTab === 'installed' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter models..."
              className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400'
                  : 'bg-[#141824] border-[#23283a] text-slate-200 placeholder:text-slate-500'
              }`}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* SUBTAB 1: INSTALLED MODELS */}
        {activeSubTab === 'installed' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Ollama Connection & Hardware Status Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                ollamaConnection.isConnected
                  ? isLight
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                  : isLight
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    ollamaConnection.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <div className="font-semibold text-xs flex items-center gap-2 flex-wrap">
                    <span>
                      {ollamaConnection.isConnected
                        ? `Connected to Ollama at ${ollamaHost}`
                        : `Ollama Runtime Offline at ${ollamaHost}`}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        ollamaConnection.isConnected
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-medium'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-medium'
                      }`}
                    >
                      {ollamaConnection.isConnected ? `${models.length} models synced` : 'Connection Required'}
                    </span>
                  </div>

                  <div className="text-[11px] opacity-85 mt-1 space-y-0.5">
                    <div>
                      <strong>Hardware Detected:</strong> CPU: {systemMetrics.cpu.model} ({systemMetrics.cpu.cores} Cores, {systemMetrics.systemRam.totalGb} GB RAM) · Accelerator: <span className="text-cyan-600 dark:text-cyan-400 font-medium">{systemMetrics.vram.gpuName}</span> ({systemMetrics.vram.totalGb} GB VRAM)
                    </div>
                    {!ollamaConnection.isConnected && (
                      <div className="text-[10px] opacity-90 text-amber-700 dark:text-amber-300">
                        {ollamaConnection.isHtmlResponse
                          ? 'Notice: Endpoint returned an HTML webpage instead of Ollama JSON. Check your port (Ollama uses 11434, not 3000).'
                          : ollamaConnection.isCloudBackend
                          ? 'Notice: Cloud preview cannot directly route to 127.0.0.1 on your home PC. Run locally (http://localhost:3000) or enable CORS.'
                          : 'Start Ollama service via "ollama serve" in terminal or open the Ollama desktop app.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                <button
                  onClick={() => setIsGpuModalOpen(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium text-xs transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                      : 'bg-[#181d2a] hover:bg-[#202738] border-[#293144] text-slate-200'
                  }`}
                  title="Configure physical GPU card or select preset"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Configure GPU</span>
                </button>
                <button
                  onClick={() => refreshOllama()}
                  disabled={ollamaConnection.isChecking}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                      : 'bg-[#181d2a] hover:bg-[#202738] border-[#293144] text-slate-200'
                  }`}
                  title="Rescan Ollama models and running VRAM"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${ollamaConnection.isChecking ? 'animate-spin' : ''}`} />
                  <span>Sync Models</span>
                </button>
                <button
                  onClick={() => setIsConnectionModalOpen(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Configure Host
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => {
                const isRunning = runningModels.some((m) => m.name === model.tag);
                return (
                  <div
                    key={model.tag}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isRunning
                        ? isLight
                          ? 'bg-white border-cyan-500 shadow-md ring-1 ring-cyan-400/30'
                          : 'bg-[#121624] border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                        : isLight
                        ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                        : 'bg-[#10131d] border-[#22283a] hover:border-[#323a54]'
                    }`}
                  >
                    <div>
                      {/* Title & Loaded Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className={`font-mono font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {model.tag}
                          </h3>
                          <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                            {model.digest} · modified {model.modified}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {activeModel === model.tag && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] uppercase font-bold">
                              Active Chat
                            </span>
                          )}
                          {isRunning ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] uppercase font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              In VRAM
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
                              Idle
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Import Source Indicator Badge (if imported) */}
                      {model.importSource && (
                        <div className={`flex items-center gap-1 text-[10px] font-mono my-1.5 px-2 py-1 rounded border truncate ${
                          isLight
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                        }`}>
                          {model.importSource.type === 'manifest_url' ? (
                            <Link2 className="w-3 h-3 text-cyan-500 shrink-0" />
                          ) : (
                            <FolderInput className="w-3 h-3 text-cyan-500 shrink-0" />
                          )}
                          <span className="truncate">{model.importSource.value}</span>
                        </div>
                      )}

                      {/* Specs */}
                      <div className={`grid grid-cols-2 gap-2 my-2.5 p-2.5 border rounded-lg text-[11px] font-mono ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b0e15] border-[#1c2132]'
                      }`}>
                        <div>
                          <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Parameters:</span>{' '}
                          <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{model.parameters}</span>
                        </div>
                        <div>
                          <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Quantization:</span>{' '}
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{model.quantization}</span>
                        </div>
                        <div>
                          <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Disk Size:</span>{' '}
                          <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{model.sizeGb} GB</span>
                        </div>
                        <div>
                          <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>Context:</span>{' '}
                          <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{model.contextLength.toLocaleString()}</span>
                        </div>
                      </div>

                      <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {model.systemPrompt || 'General purpose language model.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center justify-between pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#1c2132]'}`}>
                      <div className="flex items-center gap-1.5">
                        {isRunning ? (
                          <button
                            onClick={() => unloadModelFromVram(model.tag)}
                            className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Unload
                          </button>
                        ) : (
                          <button
                            onClick={() => loadModelIntoVram(model.tag)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Load VRAM</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveModel(model.tag);
                            setActiveTab('chat');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                            activeModel === model.tag
                              ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                              : isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-[#1d2334] hover:bg-[#252c42] text-slate-200'
                          }`}
                        >
                          <Play className={`w-3 h-3 ${activeModel === model.tag ? 'text-white' : 'text-emerald-500'}`} />
                          <span>{activeModel === model.tag ? 'In Chat' : 'Chat'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedModelfile(model.tag)}
                          className={`p-1.5 rounded transition-colors ${
                            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1c2132]'
                          }`}
                          title="View Modelfile"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteModel(model.tag)}
                          className={`p-1.5 rounded transition-colors ${
                            isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-rose-400 hover:bg-[#1c2132]'
                          }`}
                          title="Delete model image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: RUNNING MODELS (ollama ps) */}
        {activeSubTab === 'running' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="p-4 bg-[#111420] border border-[#23283a] rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">Ollama Process Table (ollama ps)</h3>
                <p className="text-xs text-slate-400">
                  Real-time memory allocation across CUDA VRAM and host RAM layers.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-cyan-400">
                {runningModels.length} Active Process{runningModels.length !== 1 ? 'es' : ''}
              </div>
            </div>

            {runningModels.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#23283a] rounded-xl text-slate-400 space-y-3">
                <HardDrive className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm">No models currently resident in GPU memory.</p>
                <p className="text-xs text-slate-500">
                  Click below or select any model from the Installed tab to preload its layers into VRAM.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => loadModelIntoVram(activeModel || models[0]?.tag || 'llama3.2')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Preload {activeModel || models[0]?.tag || 'Model'} into VRAM</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {runningModels.map((m) => (
                  <div
                    key={m.name}
                    className="p-5 bg-[#121622] border border-[#23293e] rounded-xl space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${m.vramUsedGb > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-white">{m.name}</span>
                            {m.vramUsedGb > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                {m.vramUsedGb} GB GPU VRAM ({m.offloadLayers}/{m.totalLayers} layers)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                CPU RAM Mode (0 MB VRAM)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            PID {m.pid} · Loaded {new Date(m.loadedAt).toLocaleTimeString()} · Keep-alive: 60m
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.vramUsedGb === 0 && (
                          <button
                            onClick={() => loadModelIntoVram(m.name, 99)}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                            title="Force Ollama to offload 100% of layers to your GPU"
                          >
                            ⚡ Force GPU (num_gpu: 99)
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveModel(m.name);
                            setActiveTab('chat');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeModel === m.name
                              ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                              : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{activeModel === m.name ? 'Active in Chat' : 'Switch Chat'}</span>
                        </button>
                        <button
                          onClick={() => unloadModelFromVram(m.name)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          Unload VRAM
                        </button>
                      </div>
                    </div>

                    {/* CPU RAM Mode Notice */}
                    {m.vramUsedGb === 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1.5 text-amber-200">
                        <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>Ollama loaded this model in CPU RAM Mode (0 MB VRAM)</span>
                        </div>
                        <p className="text-[11px] text-amber-300/80 leading-relaxed">
                          Ollama runs on CPU when GPU compute is not automatically hooked. Click <strong>⚡ Force GPU (num_gpu: 99)</strong> above, or quit and restart Ollama from your system tray to ensure Ollama detects your GPU drivers.
                        </p>
                      </div>
                    )}

                    {/* Utilization Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0c0e14] border border-[#1e2334] rounded-lg text-xs font-mono">
                      <div>
                        <div className="text-slate-400 mb-1 flex justify-between">
                          <span>VRAM Allocated:</span>
                          <span className="text-cyan-400 font-bold">{m.vramUsedGb} GB</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-cyan-500"
                            style={{ width: `${(m.vramUsedGb / 24) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 mb-1 flex justify-between">
                          <span>System Host RAM:</span>
                          <span className="text-slate-200">{m.ramUsedGb} GB</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(m.ramUsedGb / 64) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 mb-1 flex justify-between">
                          <span>GPU Offloaded Layers:</span>
                          <span className="text-emerald-400 font-bold">
                            {m.offloadLayers}/{m.totalLayers} (
                            {Math.round((m.offloadLayers / m.totalLayers) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(m.offloadLayers / m.totalLayers) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Offload Slider */}
                    <div className="p-3 bg-[#0d1017] rounded-lg border border-[#1b2030] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          Adjust GPU Tensor Core Offload
                        </span>
                        <span className="font-mono text-cyan-400 text-[11px]">
                          {m.offloadLayers} of {m.totalLayers} layers on GPU
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={m.totalLayers}
                        value={m.offloadLayers}
                        onChange={(e) =>
                          loadModelIntoVram(m.name, parseInt(e.target.value, 10))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: PULL MODEL (ollama pull) */}
        {activeSubTab === 'pull' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 border rounded-xl space-y-4 transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121622] border-[#23283a]'
            }`}>
              <div>
                <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Pull Model from Ollama Registry
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enter any model tag from the library (e.g., <code className="text-cyan-600 dark:text-cyan-400 font-mono">llama3.2:3b</code>, <code className="text-cyan-600 dark:text-cyan-400 font-mono">deepseek-r1:8b</code>, <code className="text-cyan-600 dark:text-cyan-400 font-mono">codellama:13b</code>).
                </p>
              </div>

              <form onSubmit={handlePullSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={pullInput}
                  onChange={(e) => setPullInput(e.target.value)}
                  placeholder="Enter model name:tag (e.g. deepseek-r1:8b)"
                  className={`flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 font-mono ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#0c0e14] border-[#272c3e] text-slate-100 placeholder:text-slate-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!pullInput.trim() || !!pullProgress}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Pull Model</span>
                </button>
              </form>

              {/* Live Pull Progress Display */}
              {pullProgress && (
                <div className={`p-4 border rounded-lg space-y-3 font-mono text-xs ${
                  isLight ? 'bg-cyan-50/50 border-cyan-300' : 'bg-[#0c0e14] border-cyan-500/40'
                }`}>
                  <div className={`flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      pulling {pullProgress.modelTag} ({pullProgress.status})
                    </span>
                    <span>{pullProgress.downloadSpeedMb} MB/s</span>
                  </div>

                  <div className={`w-full h-2.5 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1a1f2e]'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${pullProgress.progressPercent}%` }}
                    />
                  </div>

                  <div className={`flex justify-between text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    <span>layer {pullProgress.layerDigest}</span>
                    <span>{pullProgress.progressPercent}% complete</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Model Library */}
            <div className="space-y-3">
              <h4 className={`text-xs uppercase font-semibold tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Popular Model Library (One-Click Pull)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {POPULAR_MODELS_LIBRARY.map((item) => (
                  <div
                    key={item.tag}
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        : 'bg-[#111420] border-[#202538] hover:border-[#323a54]'
                    }`}
                  >
                    <div>
                      <div className={`font-mono font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.tag}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.params} · {item.size}
                      </div>
                    </div>
                    <button
                      onClick={() => pullModel(item.tag)}
                      disabled={!!pullProgress}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-cyan-50 text-cyan-700 border border-slate-200 hover:border-cyan-300'
                          : 'bg-[#1a1f2e] hover:bg-cyan-600/30 text-cyan-400 border border-[#2b334a] hover:border-cyan-500/50'
                      }`}
                      title={`Pull ${item.tag}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: IMPORT LOCAL MODEL VIA MANIFEST URL OR PATH INPUT */}
        {activeSubTab === 'import' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 border rounded-xl space-y-5 transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121622] border-[#23283a]'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <FolderInput className="w-5 h-5 text-cyan-500" />
                  <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Import Ollama Model via Manifest URL or File Path
                  </h3>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Import local GGUF weights, local blob paths, or remote OCI model manifests directly into Javid Studio.
                </p>
              </div>

              {/* Source Type Selector */}
              <div className={`grid grid-cols-3 gap-2 p-1 border rounded-lg ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c0e14] border-[#212638]'
              }`}>
                <button
                  type="button"
                  onClick={() => setImportSourceType('manifest_url')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    importSourceType === 'manifest_url'
                      ? isLight
                        ? 'bg-white text-cyan-700 border border-slate-300 shadow-xs font-semibold'
                        : 'bg-[#1b2234] text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Manifest URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportSourceType('file_path')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    importSourceType === 'file_path'
                      ? isLight
                        ? 'bg-white text-cyan-700 border border-slate-300 shadow-xs font-semibold'
                        : 'bg-[#1b2234] text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Local File Path</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportSourceType('file_upload')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    importSourceType === 'file_upload'
                      ? isLight
                        ? 'bg-white text-cyan-700 border border-slate-300 shadow-xs font-semibold'
                        : 'bg-[#1b2234] text-cyan-400 border border-cyan-500/40 shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {/* Import Form */}
              <form onSubmit={handleImportSubmit} className="space-y-4">
                {/* SOURCE TYPE 1: MANIFEST URL */}
                {importSourceType === 'manifest_url' && (
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Ollama Manifest URL or OCI Endpoint
                    </label>
                    <div className="relative">
                      <Link2 className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="url"
                        value={importUrl}
                        onChange={(e) => {
                          setImportUrl(e.target.value);
                          if (!importTag) {
                            const match = e.target.value.match(/library\/([^/]+)/);
                            if (match) setImportTag(`imported/${match[1]}:latest`);
                          }
                        }}
                        placeholder="https://registry.ollama.ai/v2/library/mistral/manifests/latest"
                        className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                            : 'bg-[#0c0e14] border-[#272c3e] text-slate-100 placeholder:text-slate-500'
                        }`}
                        required
                      />
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Supports direct Ollama registry manifests, Hugging Face GGUF manifest endpoints, or private registry URLs.
                    </p>
                  </div>
                )}

                {/* SOURCE TYPE 2: LOCAL FILE PATH */}
                {importSourceType === 'file_path' && (
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Local Filesystem GGUF Path or Blob Path
                    </label>
                    <div className="relative">
                      <FolderInput className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="text"
                        value={importFilePath}
                        onChange={(e) => {
                          setImportFilePath(e.target.value);
                          if (!importTag) {
                            const filename = e.target.value.split(/[\\/]/).pop() || '';
                            const cleanName = filename.replace(/\.(gguf|bin)$/i, '').toLowerCase();
                            if (cleanName) setImportTag(`local/${cleanName}:latest`);
                          }
                        }}
                        placeholder="/data/models/deepseek-r1-distill-qwen-14b-q4_k_m.gguf"
                        className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                            : 'bg-[#0c0e14] border-[#272c3e] text-slate-100 placeholder:text-slate-500'
                        }`}
                        required
                      />
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Enter absolute path to your local <code className="text-cyan-600 dark:text-cyan-400">.gguf</code> file, or path inside <code className="text-cyan-600 dark:text-cyan-400">~/.ollama/models/blobs/...</code>
                    </p>
                  </div>
                )}

                {/* SOURCE TYPE 3: FILE UPLOAD */}
                {importSourceType === 'file_upload' && (
                  <div className="space-y-2">
                    <label className={`block text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Select Local GGUF or Manifest File
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative cursor-pointer ${
                      isLight
                        ? 'border-slate-300 hover:border-cyan-500 bg-slate-50/70'
                        : 'border-[#282f44] hover:border-cyan-500/50 bg-[#0c0e14]'
                    }`}>
                      <input
                        type="file"
                        accept=".gguf,.bin,.json"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                      {uploadedFileName ? (
                        <div>
                          <div className={`font-mono text-sm font-semibold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{uploadedFileName}</div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">File selected and ready to register</div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-xs font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Click to browse or drag &amp; drop .gguf / manifest file</div>
                          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Supports GGUF v3, llama.cpp binaries, or manifest.json</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Presets / Examples */}
                <div className={`p-3 border rounded-lg space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c0e15] border-[#1e2334]'
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Quick Test Presets (One-Click Auto-Fill)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        prefillPreset(
                          'manifest_url',
                          'https://registry.ollama.ai/v2/library/phi3/manifests/mini',
                          'imported/phi3:mini',
                          '3.8',
                          '3.8B',
                          'phi',
                          'Q4_K_M'
                        )
                      }
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-cyan-700 border border-slate-300 shadow-2xs'
                          : 'bg-[#161a27] hover:bg-[#202638] text-slate-300 hover:text-cyan-300 border border-[#272e42]'
                      }`}
                    >
                      🔗 Phi-3 Mini (Manifest URL)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        prefillPreset(
                          'file_path',
                          '/data/models/deepseek-r1-distill-qwen-14b-q4_k_m.gguf',
                          'local/deepseek-r1-qwen:14b',
                          '9.2',
                          '14.7B',
                          'deepseek',
                          'Q4_K_M'
                        )
                      }
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-cyan-700 border border-slate-300 shadow-2xs'
                          : 'bg-[#161a27] hover:bg-[#202638] text-slate-300 hover:text-cyan-300 border border-[#272e42]'
                      }`}
                    >
                      📁 DeepSeek-R1 14B (GGUF Path)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        prefillPreset(
                          'file_path',
                          '/home/models/qwen2.5-coder-7b-instruct.Q5_K_M.gguf',
                          'local/qwen2.5-coder:7b',
                          '5.2',
                          '7.6B',
                          'qwen',
                          'Q5_K_M'
                        )
                      }
                      className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-cyan-700 border border-slate-300 shadow-2xs'
                          : 'bg-[#161a27] hover:bg-[#202638] text-slate-300 hover:text-cyan-300 border border-[#272e42]'
                      }`}
                    >
                      📁 Qwen 2.5 Coder 7B (Local Path)
                    </button>
                  </div>
                </div>

                {/* Model Configuration Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Registered Tag Name
                    </label>
                    <input
                      type="text"
                      value={importTag}
                      onChange={(e) => setImportTag(e.target.value)}
                      placeholder="e.g. local/my-model:latest"
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-[#0c0e14] border-[#272c3e] text-slate-100 placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Model Family / Architecture
                    </label>
                    <select
                      value={importFamily}
                      onChange={(e) => setImportFamily(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                      }`}
                    >
                      <option value="llama">Llama 3 / 3.3</option>
                      <option value="deepseek">DeepSeek-R1 / V3</option>
                      <option value="qwen">Qwen 2.5</option>
                      <option value="mistral">Mistral / Nemo</option>
                      <option value="phi">Phi-3 / 4</option>
                      <option value="gemma">Gemma 2</option>
                      <option value="custom">Custom Transformer</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Quantization Level
                    </label>
                    <select
                      value={importQuantization}
                      onChange={(e) => setImportQuantization(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                      }`}
                    >
                      <option value="Q4_K_M">Q4_K_M (Medium 4-bit)</option>
                      <option value="Q5_K_M">Q5_K_M (High 5-bit)</option>
                      <option value="Q8_0">Q8_0 (8-bit)</option>
                      <option value="Q4_0">Q4_0 (Standard 4-bit)</option>
                      <option value="FP16">FP16 (Full Precision)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Size on Disk (GB)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={importSizeGb}
                      onChange={(e) => setImportSizeGb(e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Context Length (Tokens)
                    </label>
                    <select
                      value={importContextLength}
                      onChange={(e) => setImportContextLength(parseInt(e.target.value, 10))}
                      className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                      }`}
                    >
                      <option value={8192}>8,192 tokens</option>
                      <option value={16384}>16,384 tokens</option>
                      <option value={32768}>32,768 tokens</option>
                      <option value={65536}>65,536 tokens</option>
                      <option value={131072}>131,072 tokens</option>
                    </select>
                  </div>
                </div>

                {/* Live Import Progress Display */}
                {importProgress && (
                  <div className={`p-4 border rounded-lg space-y-3 font-mono text-xs ${
                    isLight ? 'bg-cyan-50/60 border-cyan-300' : 'bg-[#0c0e14] border-cyan-500/40'
                  }`}>
                    <div className={`flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                        {importProgress.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : importProgress.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        )}
                        <span>{importProgress.status.toUpperCase()}: {importProgress.message}</span>
                      </span>
                      <span>{importProgress.percent}%</span>
                    </div>

                    <div className={`w-full h-2.5 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1a1f2e]'}`}>
                      <div
                        className={`h-full transition-all duration-300 ${
                          importProgress.status === 'completed'
                            ? 'bg-emerald-500'
                            : importProgress.status === 'error'
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        }`}
                        style={{ width: `${importProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className={`flex items-center justify-between pt-3 border-t ${
                  isLight ? 'border-slate-200' : 'border-[#1c2132]'
                }`}>
                  <div className={`text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Imported models can be offloaded directly to VRAM and launched in Chat or Terminal</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!!importProgress && importProgress.status !== 'completed' && importProgress.status !== 'error'}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FolderInput className="w-4 h-4" />
                    <span>Import &amp; Register Model</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBTAB 5: MODELFILE STUDIO */}
        {activeSubTab === 'modelfile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 border rounded-xl space-y-5 transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121622] border-[#23283a]'
            }`}>
              <div>
                <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Modelfile Customizer
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Build and package customized model variants with custom system instructions, temperature limits, and stop sequences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    New Model Tag Name
                  </label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Base Model (FROM)
                  </label>
                  <select
                    value={customBaseModel}
                    onChange={(e) => setCustomBaseModel(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                    }`}
                  >
                    {models.map((m) => (
                      <option key={m.tag} value={m.tag}>
                        {m.tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Default Temperature
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(e.target.value)}
                  className={`w-32 border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  System Prompt (SYSTEM)
                </label>
                <textarea
                  value={customSystem}
                  onChange={(e) => setCustomSystem(e.target.value)}
                  rows={4}
                  className={`w-full border rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-cyan-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0c0e14] border-[#272c3e] text-slate-100'
                  }`}
                />
              </div>

              {/* Generated Modelfile Preview */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Generated Modelfile Preview
                </label>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto shadow-inner">
{`FROM ${customBaseModel}

# Set runtime parameters
PARAMETER temperature ${customTemp}
PARAMETER num_ctx 8192
PARAMETER stop "<|im_end|>"

# Set system instructions
SYSTEM """
${customSystem}
"""`}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCreateCustomModel}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-medium text-xs shadow-md transition-all cursor-pointer"
                >
                  Create &amp; Register Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modelfile Inspector Modal */}
      {selectedModelfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-xl border rounded-xl shadow-2xl p-6 space-y-4 transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
              : 'bg-[#121622] border-[#262c3e] text-slate-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-[#212638]'
            }`}>
              <h3 className={`font-mono text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Modelfile: {selectedModelfile}
              </h3>
              <button
                onClick={() => setSelectedModelfile(null)}
                className={`p-1 rounded cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
{`# Modelfile generated for ${selectedModelfile}
FROM ${selectedModelfile}
TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

{{ .Response }}<|eot_id|>"""
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
PARAMETER temperature 0.7
PARAMETER num_ctx 8192`}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedModelfile(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-[#202538] hover:bg-[#2a3048] text-slate-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
