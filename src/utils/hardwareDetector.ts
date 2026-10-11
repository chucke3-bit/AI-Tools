export interface DetectedGpuInfo {
  name: string;
  vendor: string;
  estimatedVramGb: number;
  rawRenderer?: string;
  isDedicatedGpu: boolean;
  type: 'nvidia' | 'amd' | 'apple' | 'intel' | 'cpu_fallback';
}

export interface GpuPreset {
  id: string;
  name: string;
  vramGb: number;
  type: 'nvidia' | 'amd' | 'apple' | 'intel';
  cudaVersion: string;
  driverVersion: string;
  architecture: string;
}

export const GPU_PRESETS: GpuPreset[] = [
  {
    id: 'rtx-5090',
    name: 'NVIDIA GeForce RTX 5090',
    vramGb: 32.0,
    type: 'nvidia',
    cudaVersion: '12.8',
    driverVersion: '572.16',
    architecture: 'Blackwell',
  },
  {
    id: 'rtx-4090',
    name: 'NVIDIA GeForce RTX 4090',
    vramGb: 24.0,
    type: 'nvidia',
    cudaVersion: '12.6',
    driverVersion: '560.94',
    architecture: 'Ada Lovelace',
  },
  {
    id: 'rtx-4080',
    name: 'NVIDIA GeForce RTX 4080',
    vramGb: 16.0,
    type: 'nvidia',
    cudaVersion: '12.6',
    driverVersion: '560.94',
    architecture: 'Ada Lovelace',
  },
  {
    id: 'rtx-4070-ti',
    name: 'NVIDIA GeForce RTX 4070 Ti / Super',
    vramGb: 16.0,
    type: 'nvidia',
    cudaVersion: '12.6',
    driverVersion: '560.94',
    architecture: 'Ada Lovelace',
  },
  {
    id: 'rtx-4070',
    name: 'NVIDIA GeForce RTX 4070',
    vramGb: 12.0,
    type: 'nvidia',
    cudaVersion: '12.6',
    driverVersion: '560.94',
    architecture: 'Ada Lovelace',
  },
  {
    id: 'rtx-4060',
    name: 'NVIDIA GeForce RTX 4060',
    vramGb: 8.0,
    type: 'nvidia',
    cudaVersion: '12.6',
    driverVersion: '560.94',
    architecture: 'Ada Lovelace',
  },
  {
    id: 'rtx-3090',
    name: 'NVIDIA GeForce RTX 3090',
    vramGb: 24.0,
    type: 'nvidia',
    cudaVersion: '12.4',
    driverVersion: '552.22',
    architecture: 'Ampere',
  },
  {
    id: 'rtx-3080',
    name: 'NVIDIA GeForce RTX 3080',
    vramGb: 10.0,
    type: 'nvidia',
    cudaVersion: '12.4',
    driverVersion: '552.22',
    architecture: 'Ampere',
  },
  {
    id: 'rtx-3070',
    name: 'NVIDIA GeForce RTX 3070',
    vramGb: 8.0,
    type: 'nvidia',
    cudaVersion: '12.4',
    driverVersion: '552.22',
    architecture: 'Ampere',
  },
  {
    id: 'rtx-3060',
    name: 'NVIDIA GeForce RTX 3060',
    vramGb: 12.0,
    type: 'nvidia',
    cudaVersion: '12.4',
    driverVersion: '552.22',
    architecture: 'Ampere',
  },
  {
    id: 'apple-m4-max',
    name: 'Apple M4 Max (Unified Memory)',
    vramGb: 48.0,
    type: 'apple',
    cudaVersion: 'Metal 3 / MPS',
    driverVersion: 'macOS 15 Sequoia',
    architecture: 'Apple Silicon',
  },
  {
    id: 'apple-m3-pro',
    name: 'Apple M3 Pro / Max (Unified Memory)',
    vramGb: 36.0,
    type: 'apple',
    cudaVersion: 'Metal 3 / MPS',
    driverVersion: 'macOS 14 Sonoma',
    architecture: 'Apple Silicon',
  },
  {
    id: 'rx-7900-xtx',
    name: 'AMD Radeon RX 7900 XTX',
    vramGb: 24.0,
    type: 'amd',
    cudaVersion: 'ROCm 6.2 / HIP',
    driverVersion: 'Adrenalin 24.8.1',
    architecture: 'RDNA 3',
  },
  {
    id: 'rx-7800-xt',
    name: 'AMD Radeon RX 7800 XT',
    vramGb: 16.0,
    type: 'amd',
    cudaVersion: 'ROCm 6.2 / HIP',
    driverVersion: 'Adrenalin 24.8.1',
    architecture: 'RDNA 3',
  },
  {
    id: 'arc-a770',
    name: 'Intel Arc A770',
    vramGb: 16.0,
    type: 'intel',
    cudaVersion: 'oneAPI / Level Zero',
    driverVersion: 'Intel 31.0.101',
    architecture: 'Alchemist',
  },
];

export function detectBrowserGpu(): DetectedGpuInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { powerPreference: 'high-performance' }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = '';
    let vendor = '';

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    } else {
      renderer = gl.getParameter(gl.RENDERER) || '';
      vendor = gl.getParameter(gl.VENDOR) || '';
    }

    if (!renderer) return null;

    let cleanName = renderer;
    // Extract name from ANGLE string e.g. "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)"
    const angleMatch = renderer.match(/ANGLE\s*\([^,]+,\s*([^,]+?)(?:\s+Direct3D|\s+OpenGL|\s+Vulkan|,|\))/i);
    if (angleMatch && angleMatch[1]) {
      cleanName = angleMatch[1].trim();
    }

    const lower = cleanName.toLowerCase();
    let type: DetectedGpuInfo['type'] = 'cpu_fallback';
    let isDedicatedGpu = false;
    let estimatedVramGb = 8.0;

    if (lower.includes('nvidia') || lower.includes('geforce') || lower.includes('rtx') || lower.includes('quadro')) {
      type = 'nvidia';
      isDedicatedGpu = true;
      if (lower.includes('5090')) estimatedVramGb = 32.0;
      else if (lower.includes('4090') || lower.includes('3090')) estimatedVramGb = 24.0;
      else if (lower.includes('4080')) estimatedVramGb = 16.0;
      else if (lower.includes('4070 ti')) estimatedVramGb = 16.0;
      else if (lower.includes('4070')) estimatedVramGb = 12.0;
      else if (lower.includes('3080 ti')) estimatedVramGb = 12.0;
      else if (lower.includes('3080')) estimatedVramGb = 10.0;
      else if (lower.includes('3060 12gb') || (lower.includes('3060') && !lower.includes('ti'))) estimatedVramGb = 12.0;
      else if (lower.includes('4060') || lower.includes('3070') || lower.includes('2080')) estimatedVramGb = 8.0;
      else estimatedVramGb = 8.0;
    } else if (lower.includes('radeon') || lower.includes('amd')) {
      type = 'amd';
      isDedicatedGpu = true;
      if (lower.includes('7900 xtx')) estimatedVramGb = 24.0;
      else if (lower.includes('7900 xt')) estimatedVramGb = 20.0;
      else if (lower.includes('7800 xt') || lower.includes('6800')) estimatedVramGb = 16.0;
      else estimatedVramGb = 12.0;
    } else if (lower.includes('apple') || lower.includes('metal')) {
      type = 'apple';
      isDedicatedGpu = true;
      estimatedVramGb = 16.0;
    } else if (lower.includes('intel') && (lower.includes('arc') || lower.includes('a770') || lower.includes('a750'))) {
      type = 'intel';
      isDedicatedGpu = true;
      estimatedVramGb = 16.0;
    } else if (lower.includes('intel') || lower.includes('uhd') || lower.includes('iris')) {
      type = 'intel';
      isDedicatedGpu = false;
      estimatedVramGb = 2.0;
    }

    return {
      name: cleanName,
      vendor: vendor || 'Unknown Vendor',
      estimatedVramGb,
      rawRenderer: renderer,
      isDedicatedGpu,
      type,
    };
  } catch {
    return null;
  }
}
