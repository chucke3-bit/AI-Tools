import React, { useState } from 'react';
import { useOllama } from '../../context/OllamaContext';
import {
  Cpu,
  Database,
  HardDrive,
  Activity,
  Layers,
  RotateCw,
  X,
  Sliders,
  ChevronDown,
} from 'lucide-react';

export const ColabResourceWidget: React.FC = () => {
  const {
    systemMetrics,
    runningModels,
    restartRuntime,
    loadModelIntoVram,
    unloadModelFromVram,
    theme,
    ollamaHost,
    ollamaConnection,
    setIsConnectionModalOpen,
    setIsGpuModalOpen,
  } = useOllama();
  const [isOpen, setIsOpen] = useState(false);
  const isLight = theme === 'light';

  // Helper color for Colab bars
  const getColabBarColor = (percent: number) => {
    if (percent < 70) return 'bg-emerald-500';
    if (percent < 85) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <>
      {/* Top Colab-style compact widget */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5 rounded-md border transition-all text-xs cursor-pointer group shadow-inner ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200/70 border-slate-200 text-slate-800'
            : 'bg-[#161922] border-[#272d3e] hover:border-[#3b435c] text-slate-200'
        }`}
        title="Click to view Google Colab style hardware allocation & runtime details"
      >
        {/* System RAM */}
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-medium ${isLight ? 'text-slate-500' : 'text-[#8892b0]'}`}>RAM</span>
          <div className={`w-14 sm:w-16 h-2 rounded-sm overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-[#232839]'}`}>
            <div
              className={`h-full transition-all duration-500 ${getColabBarColor(systemMetrics.systemRam.percent)}`}
              style={{ width: `${systemMetrics.systemRam.percent}%` }}
            />
          </div>
          <span className={`font-mono text-[11px] hidden sm:inline ${isLight ? 'text-slate-600' : 'text-[#a6b1d1]'}`}>
            {systemMetrics.systemRam.usedGb}G
          </span>
        </div>

        <div className={`h-3 w-px ${isLight ? 'bg-slate-300' : 'bg-[#2a3045]'}`} />

        {/* GPU VRAM */}
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-medium ${isLight ? 'text-slate-500' : 'text-[#8892b0]'}`}>VRAM</span>
          <div className={`w-14 sm:w-16 h-2 rounded-sm overflow-hidden flex ${isLight ? 'bg-slate-200' : 'bg-[#232839]'}`}>
            <div
              className={`h-full transition-all duration-500 ${getColabBarColor(systemMetrics.vram.percent)}`}
              style={{ width: `${systemMetrics.vram.percent}%` }}
            />
          </div>
          <span className={`font-mono text-[11px] font-semibold ${isLight ? 'text-cyan-600' : 'text-[#38bdf8]'}`}>
            {systemMetrics.vram.usedGb}G
          </span>
        </div>

        <div className={`h-3 w-px ${isLight ? 'bg-slate-300' : 'bg-[#2a3045]'}`} />

        {/* CPU */}
        <div className="flex items-center gap-1.5">
          <Cpu className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-[#8892b0]'}`} />
          <span className={`font-mono text-[11px] ${isLight ? 'text-slate-700' : 'text-[#e2e8f0]'}`}>
            {systemMetrics.cpu.usagePercent}%
          </span>
        </div>

        <ChevronDown className={`w-3 h-3 transition-colors ${isLight ? 'text-slate-400 group-hover:text-slate-700' : 'text-[#6272a4] group-hover:text-white'}`} />
      </button>

      {/* Expandable Google Colab Resources Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div
            className={`relative w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden font-sans transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-400/50' : 'bg-[#11131a] border-[#272c3d] text-slate-200'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161a25] border-[#212638]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className={`text-sm font-semibold tracking-wide uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Connected Runtime &amp; Hardware Resources
                </h3>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>· Colab Compute Engine</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-[#23283b]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Device Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsGpuModalOpen(true);
                  }}
                  className={`p-3 border rounded-lg text-left transition-all cursor-pointer group ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-cyan-400'
                      : 'bg-[#171a25] hover:bg-[#1f2434] border-[#232838] hover:border-cyan-500/50'
                  }`}
                  title="Click to configure GPU accelerator card or select your physical GPU"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Accelerator</span>
                    <span className="text-[10px] text-cyan-500 opacity-80 group-hover:opacity-100 underline">Change</span>
                  </div>
                  <div className={`font-semibold truncate ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                    {systemMetrics.vram.gpuName}
                  </div>
                </button>
                <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#171a25] border-[#232838]'}`}>
                  <div className={`text-[11px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>CUDA Runtime</div>
                  <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    CUDA {systemMetrics.vram.cudaVersion} / {systemMetrics.vram.driverVersion}
                  </div>
                </div>
                <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#171a25] border-[#232838]'}`}>
                  <div className={`text-[11px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>GPU Thermal / Power</div>
                  <div className="font-semibold text-amber-500">
                    {systemMetrics.vram.temperatureC}°C · {systemMetrics.vram.powerWatts}W
                  </div>
                </div>
                <div className={`p-3 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#171a25] border-[#232838]'}`}>
                  <div className={`text-[11px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Stability Score</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {systemMetrics.stabilityScore}% (Optimal)
                  </div>
                </div>
              </div>

              {/* Colab High-Fidelity Resource Meters */}
              <div className={`space-y-4 p-4 border rounded-lg ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#23283a]'}`}>
                <div className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Real-time System Utilization
                </div>

                {/* System RAM Bar */}
                <div>
                  <div className={`flex justify-between items-center mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                      System RAM
                    </span>
                    <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {systemMetrics.systemRam.usedGb} GB / {systemMetrics.systemRam.totalGb} GB (
                      {systemMetrics.systemRam.percent}%)
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#202538]'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${getColabBarColor(systemMetrics.systemRam.percent)}`}
                      style={{ width: `${systemMetrics.systemRam.percent}%` }}
                    />
                  </div>
                </div>

                {/* GPU VRAM Bar */}
                <div>
                  <div className={`flex justify-between items-center mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-cyan-500" />
                      GPU VRAM (Dedicated Tensor Memory)
                    </span>
                    <span className={`font-mono font-semibold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                      {systemMetrics.vram.usedGb} GB / {systemMetrics.vram.totalGb} GB (
                      {systemMetrics.vram.percent}%)
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#202538]'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${getColabBarColor(systemMetrics.vram.percent)}`}
                      style={{ width: `${systemMetrics.vram.percent}%` }}
                    />
                  </div>
                </div>

                {/* Disk Space Bar */}
                <div>
                  <div className={`flex justify-between items-center mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                      Model Weights Cache (NVMe Disk)
                    </span>
                    <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {systemMetrics.disk.usedGb} GB / {systemMetrics.disk.totalGb} GB (
                      {systemMetrics.disk.percent}%)
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#202538]'}`}>
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${systemMetrics.disk.percent}%` }}
                    />
                  </div>
                </div>

                {/* CPU Utilization Bar */}
                <div>
                  <div className={`flex justify-between items-center mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                      Host CPU ({systemMetrics.cpu.cores} Cores)
                    </span>
                    <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {systemMetrics.cpu.usagePercent}% Load
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#202538]'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${getColabBarColor(systemMetrics.cpu.usagePercent)}`}
                      style={{ width: `${systemMetrics.cpu.usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Per-Running Model Breakdown Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Running Models &amp; Memory Footprint ({runningModels.length})
                  </div>
                </div>

                {runningModels.length === 0 ? (
                  <div className={`p-4 border rounded-lg text-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#141722] border-[#23283a] text-slate-400'}`}>
                    No models currently loaded in memory. Run a chat or load a model from the Models tab.
                  </div>
                ) : (
                  <div className={`overflow-x-auto border rounded-lg ${isLight ? 'border-slate-200' : 'border-[#23283a]'}`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-[11px] ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#181d2a] text-[#8892b0] border-[#23283a]'}`}>
                          <th className="py-2 px-3 font-medium">Model</th>
                          <th className="py-2 px-3 font-medium">PID</th>
                          <th className="py-2 px-3 font-medium">VRAM Usage</th>
                          <th className="py-2 px-3 font-medium">System RAM</th>
                          <th className="py-2 px-3 font-medium">Offloaded Layers</th>
                          <th className="py-2 px-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y font-mono text-[11px] ${isLight ? 'divide-slate-200' : 'divide-[#212638]'}`}>
                        {runningModels.map((m) => (
                          <tr key={m.name} className={isLight ? 'hover:bg-slate-100/60' : 'hover:bg-[#181d2b]'}>
                            <td className={`py-2.5 px-3 font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {m.name}
                            </td>
                            <td className={`py-2.5 px-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{m.pid}</td>
                            <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-semibold">
                              {m.vramUsedGb} GB
                            </td>
                            <td className={`py-2.5 px-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              {m.ramUsedGb} GB
                            </td>
                            <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                              {m.offloadLayers}/{m.totalLayers} (
                              {Math.round((m.offloadLayers / m.totalLayers) * 100)}%)
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => unloadModelFromVram(m.name)}
                                className="px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded transition-colors cursor-pointer"
                              >
                                Unload
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Layer Offload Tuner Simulation */}
              {runningModels.length > 0 && (
                <div className={`p-4 border rounded-lg space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#23283a]'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                      Dynamic Layer Offload Tuning: {runningModels[0].name}
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                      {runningModels[0].offloadLayers} / {runningModels[0].totalLayers} GPU Layers
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={runningModels[0].totalLayers}
                    value={runningModels[0].offloadLayers}
                    onChange={(e) =>
                      loadModelIntoVram(runningModels[0].name, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className={`flex justify-between text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>0% (All CPU RAM)</span>
                    <span>50% Hybrid Offload</span>
                    <span>100% (Full VRAM)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between px-6 py-3.5 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#212638]'}`}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsConnectionModalOpen(true);
                }}
                className={`flex items-center gap-2 text-[11px] p-1.5 rounded-md border transition-colors cursor-pointer ${
                  ollamaConnection.isConnected
                    ? isLight
                      ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-800'
                      : 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-800/40 text-emerald-300'
                    : isLight
                    ? 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-800'
                    : 'bg-amber-950/20 hover:bg-amber-900/30 border-amber-800/40 text-amber-300'
                }`}
                title="Click to configure Ollama host and view connection diagnostics"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    ollamaConnection.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>Ollama Backend:</span>
                <span className="font-mono font-medium">{ollamaHost.replace(/^https?:\/\//, '')}</span>
                <span className="text-[10px] underline ml-1">
                  {ollamaConnection.isConnected ? '(Configure)' : '(Troubleshoot)'}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsGpuModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors border cursor-pointer ${
                    isLight
                      ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                      : 'bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 border-cyan-800/40'
                  }`}
                  title="Configure GPU hardware profile or select your physical GPU"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Configure GPU</span>
                </button>
                <button
                  onClick={restartRuntime}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors border cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-[#202538] hover:bg-[#282e44] text-slate-200 border-[#2d344d]'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                  Restart Runtime
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
