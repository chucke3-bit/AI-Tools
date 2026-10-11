import React, { useState } from 'react';
import { useOllama } from '../../context/OllamaContext';
import { GPU_PRESETS, GpuPreset } from '../../utils/hardwareDetector';
import {
  Cpu,
  Layers,
  X,
  Check,
  Zap,
  RotateCw,
  Sparkles,
  Info,
  Server,
  Monitor,
} from 'lucide-react';

export const GpuSelectorModal: React.FC = () => {
  const {
    systemMetrics,
    setCustomGpu,
    detectedBrowserGpu,
    isGpuModalOpen,
    setIsGpuModalOpen,
    theme,
  } = useOllama();

  const isLight = theme === 'light';
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customVram, setCustomVram] = useState('12');
  const [isSaving, setIsSaving] = useState(false);

  if (!isGpuModalOpen) return null;

  const handleSelectPreset = async (preset: GpuPreset) => {
    setSelectedPresetId(preset.id);
    setIsSaving(true);
    await setCustomGpu(preset.name, preset.vramGb);
    setIsSaving(false);
  };

  const handleApplyCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setIsSaving(true);
    await setCustomGpu(customName.trim(), parseFloat(customVram) || 8.0);
    setIsSaving(false);
    setSelectedPresetId(null);
  };

  const handleUseBrowserDetected = async () => {
    if (!detectedBrowserGpu) return;
    setIsSaving(true);
    const match = detectedBrowserGpu.match(/(.+?)\s*\(~(\d+(?:\.\d+)?)\s*GB/i);
    if (match) {
      await setCustomGpu(match[1].trim(), parseFloat(match[2]));
    } else {
      await setCustomGpu(detectedBrowserGpu, 12.0);
    }
    setIsSaving(false);
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-cyan-500/10 border-cyan-500/30 text-cyan-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  GPU Accelerator &amp; VRAM Configuration
                </h3>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border bg-cyan-500/15 border-cyan-500/30 text-cyan-400">
                  {systemMetrics.vram.totalGb} GB Active
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure dedicated GPU hardware profile for accurate tensor memory and layer offloading
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGpuModalOpen(false)}
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
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
          {/* Current Active Hardware Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151824] border-[#23293c]'
            }`}
          >
            <div className="space-y-1">
              <div className={`text-[11px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Currently Configured Accelerator
              </div>
              <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4 shrink-0" />
                <span>{systemMetrics.vram.gpuName}</span>
              </div>
              <div className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {systemMetrics.vram.usedGb} GB used / {systemMetrics.vram.totalGb} GB total VRAM ({systemMetrics.vram.percent}%) · {systemMetrics.vram.cudaVersion}
              </div>
            </div>

            {systemMetrics.isRealHardware ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                Active Profile
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-500">
                Fallback Mode
              </span>
            )}
          </div>

          {/* Browser WebGL Auto-Detected Card */}
          {detectedBrowserGpu && (
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950' : 'bg-[#121c2c] border-cyan-800/40 text-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-cyan-700 dark:text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>Browser Hardware Detection Found:</span>
                </div>
                <button
                  onClick={handleUseBrowserDetected}
                  disabled={isSaving}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use This GPU</span>
                </button>
              </div>
              <p className="font-mono text-xs font-medium bg-cyan-500/10 px-2.5 py-1.5 rounded-lg border border-cyan-500/20">
                {detectedBrowserGpu}
              </p>
              <p className="text-[11px] opacity-80 leading-normal">
                Detected via WebGL client hardware telemetry. Click "Use This GPU" to automatically apply this card to the Colab resource monitor.
              </p>
            </div>
          )}

          {/* Preset GPU Cards Selection */}
          <div className="space-y-2.5">
            <div className={`font-semibold text-xs flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <span>Select Your Physical GPU Model</span>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Click to apply instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GPU_PRESETS.map((preset) => {
                const isSelected = systemMetrics.vram.gpuName.toLowerCase().includes(preset.name.toLowerCase().split(' ')[2] || '___');
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    disabled={isSaving}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group flex items-start justify-between ${
                      isSelected
                        ? isLight
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-2 ring-cyan-500/20'
                          : 'bg-cyan-950/40 border-cyan-500 text-white ring-2 ring-cyan-500/20'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-[#151824] hover:bg-[#1b2030] border-[#242b3e] text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {preset.vramGb} GB VRAM · {preset.architecture} · {preset.cudaVersion}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-[#10131d] border-[#252c3d] text-slate-300'
                      }`}
                    >
                      {preset.vramGb} GB
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom GPU Profile Input */}
          <form
            onSubmit={handleApplyCustom}
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#23293c]'
            }`}
          >
            <div className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Enter Custom GPU Model &amp; VRAM
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. NVIDIA RTX A6000 or RTX 4070 Ti"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'
                      : 'bg-[#0f121a] border-[#262c3f] text-slate-200 focus:border-cyan-500'
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={customVram}
                  onChange={(e) => setCustomVram(e.target.value)}
                  placeholder="VRAM (GB)"
                  className={`w-20 px-3 py-2 rounded-lg border text-xs font-mono ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'
                      : 'bg-[#0f121a] border-[#262c3f] text-slate-200 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!customName.trim() || isSaving}
                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          </form>

          {/* Explanation Notice */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-[11px] leading-relaxed ${
              isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#12141e] border-[#212638] text-slate-400'
            }`}
          >
            <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <span>
              <strong>Why physical GPU detection differs in the Cloud:</strong> Remote cloud sandboxes run inside containerized virtual machines without direct PCIe bus access to your desktop. Configuring your GPU card profile calibrates the Colab memory gauges, layer offload calculations, and token throughput simulation to match your exact desktop PC.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141722] border-[#212638]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {systemMetrics.vram.gpuName} · {systemMetrics.vram.totalGb} GB
            </span>
          </div>

          <button
            onClick={() => setIsGpuModalOpen(false)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-xs transition-colors shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
