export interface OllamaModel {
  name: string;
  tag: string;
  sizeGb: number;
  parameters: string; // e.g. "70.6B"
  quantization: string; // e.g. "Q4_K_M"
  family: string; // e.g. "llama", "deepseek", "qwen"
  contextLength: number; // e.g. 8192 or 131072
  modified: string;
  digest: string;
  isLoaded?: boolean;
  totalLayers: number;
  systemPrompt?: string;
  importSource?: {
    type: 'manifest_url' | 'file_path' | 'file_upload';
    value: string;
  };
}

export interface RunningModel {
  name: string;
  sizeGb: number;
  vramUsedGb: number;
  ramUsedGb: number;
  offloadLayers: number;
  totalLayers: number;
  contextSize: number;
  loadedAt: number;
  keepAliveSeconds: number;
  pid: number;
}

export interface SystemMetrics {
  cpu: {
    usagePercent: number;
    cores: number;
    model: string;
    history: number[];
  };
  systemRam: {
    usedGb: number;
    totalGb: number;
    percent: number;
  };
  vram: {
    usedGb: number;
    totalGb: number;
    percent: number;
    gpuName: string;
    temperatureC: number;
    powerWatts: number;
    driverVersion: string;
    cudaVersion: string;
  };
  disk: {
    usedGb: number;
    totalGb: number;
    percent: number;
  };
  runningModelsCount: number;
  stabilityScore: number;
  hardwareType?: 'nvidia' | 'amd' | 'apple' | 'intel' | 'cpu_fallback';
  isRealHardware?: boolean;
  isCloudPreview?: boolean;
}

export interface OllamaConnectionState {
  host: string;
  isConnected: boolean;
  isChecking: boolean;
  version?: string;
  modelsCount?: number;
  error?: string;
  isCloudBackend?: boolean;
  isLocalHost?: boolean;
  lastChecked: number;
  connectionMode?: 'proxy' | 'browser_direct';
  isHtmlResponse?: boolean;
  htmlDiagnosis?: string;
}

export interface MessageMetrics {
  eval_count: number;
  eval_duration_s: number;
  prompt_eval_count: number;
  tokens_per_second: number;
  ttft_ms: number;
  load_duration_ms?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinkingContent?: string;
  thinkingSteps?: string[];
  thinkingDuration?: number;
  timestamp: string;
  model: string;
  metrics?: MessageMetrics;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ModelPullProgress {
  modelTag: string;
  status: 'idle' | 'manifest' | 'downloading' | 'verifying' | 'writing' | 'completed' | 'error';
  progressPercent: number;
  currentBytes: number;
  totalBytes: number;
  downloadSpeedMb: number;
  layerDigest: string;
  error?: string;
}

export interface ModelParameters {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  num_ctx: number;
  system_prompt: string;
}

export interface ImportModelParams {
  tag: string;
  sourceType: 'manifest_url' | 'file_path' | 'file_upload';
  sourceInput: string;
  sizeGb?: number;
  parameters?: string;
  quantization?: string;
  family?: string;
  contextLength?: number;
  totalLayers?: number;
  systemPrompt?: string;
}

