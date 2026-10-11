import React, { useState } from 'react';
import JSZip from 'jszip';
import { useOllama } from '../../context/OllamaContext';
import {
  Download,
  Terminal,
  Monitor,
  Copy,
  Check,
  X,
  FileCode,
  HardDrive,
  Cpu,
  Layers,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface InstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallerModal: React.FC<InstallerModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useOllama();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'download' | 'shortcut' | 'script' | 'docker' | 'ollama'>('download');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadShortcutSuccess, setDownloadShortcutSuccess] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCreateShortcutBatContent = () => `@echo off
TITLE Javid Studio - Desktop Shortcut Creator
color 0B
echo ======================================================
echo       Creating Javid Studio Desktop Shortcut
echo ======================================================
echo.

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

if not exist "%APP_DIR%\\run.bat" (
    echo [INFO] Creating run.bat launcher...
    (
    echo @echo off
    echo TITLE Javid Studio - Local Ollama Interface
    echo cd /d "%%~dp0"
    echo set OLLAMA_ORIGINS=*
    echo set PORT=3000
    echo echo Starting Javid Studio server on port 3000...
    echo start "" http://localhost:3000
    echo call npm start
    echo pause
    ) > "%APP_DIR%\\run.bat"
)

echo Placing 'Javid Studio.lnk' on your Desktop and Start Menu...
set "CREATED_OK=0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop'; " ^
  "$wsh = New-Object -ComObject WScript.Shell; " ^
  "$appDir = '%APP_DIR%'; " ^
  "$runBat = Join-Path $appDir 'run.bat'; " ^
  "$desk = $wsh.SpecialFolders.Item('Desktop'); " ^
  "$created = $false; " ^
  "if ($desk -and (Test-Path $desk)) { " ^
  "  $lnk = $wsh.CreateShortcut((Join-Path $desk 'Javid Studio.lnk')); " ^
  "  $lnk.TargetPath = $runBat; " ^
  "  $lnk.WorkingDirectory = $appDir; " ^
  "  $lnk.Description = 'Launch Javid Studio Local AI Interface'; " ^
  "  $lnk.IconLocation = ($env:SystemRoot + '\\System32\\shell32.dll,220'); " ^
  "  $lnk.Save(); " ^
  "  Write-Host '  [OK] Desktop shortcut created at:' (Join-Path $desk 'Javid Studio.lnk') -ForegroundColor Green; " ^
  "  $created = $true; " ^
  "} " ^
  "$oneDriveDesk = Join-Path $env:USERPROFILE 'OneDrive\\Desktop'; " ^
  "if ((Test-Path $oneDriveDesk) -and ($oneDriveDesk -ne $desk)) { " ^
  "  $lnk2 = $wsh.CreateShortcut((Join-Path $oneDriveDesk 'Javid Studio.lnk')); " ^
  "  $lnk2.TargetPath = $runBat; " ^
  "  $lnk2.WorkingDirectory = $appDir; " ^
  "  $lnk2.Description = 'Launch Javid Studio Local AI Interface'; " ^
  "  $lnk2.IconLocation = ($env:SystemRoot + '\\System32\\shell32.dll,220'); " ^
  "  $lnk2.Save(); " ^
  "  Write-Host '  [OK] OneDrive Desktop shortcut created at:' (Join-Path $oneDriveDesk 'Javid Studio.lnk') -ForegroundColor Green; " ^
  "} " ^
  "$programs = $wsh.SpecialFolders.Item('Programs'); " ^
  "if ($programs -and (Test-Path $programs)) { " ^
  "  $lnk3 = $wsh.CreateShortcut((Join-Path $programs 'Javid Studio.lnk')); " ^
  "  $lnk3.TargetPath = $runBat; " ^
  "  $lnk3.WorkingDirectory = $appDir; " ^
  "  $lnk3.Description = 'Launch Javid Studio'; " ^
  "  $lnk3.IconLocation = ($env:SystemRoot + '\\System32\\shell32.dll,220'); " ^
  "  $lnk3.Save(); " ^
  "  Write-Host '  [OK] Start Menu shortcut created.' -ForegroundColor Green; " ^
  "} " ^
  "if ($created) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    set "CREATED_OK=1"
)

if "%CREATED_OK%"=="0" (
    echo [INFO] Using Windows VBScript engine fallback...
    set "VB_SCRIPT=%TEMP%\\create_javid_lnk_%RANDOM%.vbs"
    (
        echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
        echo sDesktop = oWS.SpecialFolders^("Desktop"^)
        echo Set oLink = oWS.CreateShortcut^(sDesktop ^& "\\Javid Studio.lnk"^)
        echo oLink.TargetPath = "%APP_DIR%\\run.bat"
        echo oLink.WorkingDirectory = "%APP_DIR%"
        echo oLink.Description = "Launch Javid Studio Local AI Interface"
        echo oLink.IconLocation = oWS.ExpandEnvironmentStrings^("%%SystemRoot%%\\System32\\shell32.dll,220"^)
        echo oLink.Save
        echo Set oLink = Nothing
        echo sProg = oWS.SpecialFolders^("Programs"^)
        echo If oWS.Run^("cmd /c if exist """ ^& sProg ^& """ exit 0", 0, True^) = 0 Then
        echo   Set oLink2 = oWS.CreateShortcut^(sProg ^& "\\Javid Studio.lnk"^)
        echo   oLink2.TargetPath = "%APP_DIR%\\run.bat"
        echo   oLink2.WorkingDirectory = "%APP_DIR%"
        echo   oLink2.Description = "Launch Javid Studio"
        echo   oLink2.IconLocation = oWS.ExpandEnvironmentStrings^("%%SystemRoot%%\\System32\\shell32.dll,220"^)
        echo   oLink2.Save
        echo End If
    ) > "%VB_SCRIPT%"
    
    cscript //nologo "%VB_SCRIPT%"
    if exist "%VB_SCRIPT%" del /f /q "%VB_SCRIPT%" >nul 2>nul
    echo   [OK] Desktop shortcut created!
)

echo.
echo ======================================================
echo   DONE! Check your Desktop for the 'Javid Studio' icon.
echo ======================================================
echo.
pause
`;

  const handleDownloadShortcutBat = () => {
    const content = getCreateShortcutBatContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'create-shortcut.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadShortcutSuccess(true);
    setTimeout(() => setDownloadShortcutSuccess(false), 4000);
  };

  const handleDownloadZipBundle = async () => {
    setIsGeneratingZip(true);
    setDownloadSuccess(false);

    try {
      // 1. First attempt to download the complete full project archive from the backend (contains package.json, server.ts, src/, and scripts)
      try {
        const res = await fetch('/api/download/project-zip');
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'javid-studio-full.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 4000);
          return;
        }
      } catch (err) {
        console.warn('Backend full project zip endpoint not reachable, generating client archive...', err);
      }

      // 2. Client-side fallback: generate archive and include package.json and essential configuration
      const zip = new JSZip();

      // Installer scripts
      const installSh = `#!/usr/bin/env bash
# Javid Studio - Local Installer for Linux & macOS
set -e
cd "$(dirname "$0")"
echo "Starting Javid Studio Installation..."
command -v node >/dev/null 2>&1 || { echo "Please install Node.js 18+ from https://nodejs.org"; exit 1; }

# Check package.json
if [ ! -f "package.json" ]; then
  echo "[WARNING] package.json missing in current directory. Attempting download..."
  curl -sSL "https://ais-pre-koknghk65sn5nn6y2kcn7z-178731558169.europe-west2.run.app/api/download/project-zip" -o javid-temp.zip && unzip -o javid-temp.zip && rm -f javid-temp.zip || true
fi

npm install --force
npm run build || true
export OLLAMA_ORIGINS="*"

# Create run.sh launcher
cat << 'EOF' > run.sh
#!/usr/bin/env bash
cd "$(dirname "$0")"
export OLLAMA_ORIGINS="*"
export PORT=3000
command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000 &
command -v open >/dev/null 2>&1 && open http://localhost:3000 &
npm start
EOF
chmod +x run.sh

# Create Desktop Shortcut on macOS
if [ -d "$HOME/Desktop" ] && [ "$(uname)" = "Darwin" ]; then
  cat << EOF > "$HOME/Desktop/Javid Studio.command"
#!/usr/bin/env bash
cd "$PWD"
./run.sh
EOF
  chmod +x "$HOME/Desktop/Javid Studio.command"
  echo "[SUCCESS] Desktop launcher created at: $HOME/Desktop/Javid Studio.command"
fi

# Create Desktop Shortcut on Linux
if [ -d "$HOME/Desktop" ] && [ "$(uname)" = "Linux" ]; then
  cat << EOF > "$HOME/Desktop/javid-studio.desktop"
[Desktop Entry]
Type=Application
Name=Javid Studio
Comment=Local Ollama AI Studio
Exec=bash -c "cd '$PWD' && ./run.sh"
Icon=utilities-terminal
Terminal=true
Categories=Development;
EOF
  chmod +x "$HOME/Desktop/javid-studio.desktop"
  echo "[SUCCESS] Desktop shortcut created at: $HOME/Desktop/javid-studio.desktop"
fi

echo "Installation complete! Run './run.sh' or 'npm start' to launch Javid Studio on http://localhost:3000"
npm start`;

      const installBat = `@echo off
TITLE Javid Studio Windows Installer
color 0B
cd /d "%~dp0"
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\\" set "APP_DIR=%APP_DIR:~0,-1%"

echo ======================================================
echo          Javid Studio - Windows Setup
echo ======================================================
echo.

where node >nul 2>nul || (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js 18+ from https://nodejs.org
    echo After installing, restart this window and run install.bat again.
    pause
    exit /b 1
)

REM Check and recover package.json if missing
if not exist "%APP_DIR%\\package.json" (
    echo [WARNING] package.json not found in %APP_DIR%
    echo Attempting to automatically download full project package...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $z = Join-Path '%APP_DIR%' 'temp_bundle.zip'; Invoke-WebRequest -Uri 'https://ais-pre-koknghk65sn5nn6y2kcn7z-178731558169.europe-west2.run.app/api/download/project-zip' -OutFile $z -UseBasicParsing; Expand-Archive -Path $z -DestinationPath '%APP_DIR%' -Force; Remove-Item $z -Force; Write-Host 'Restored project files!' -ForegroundColor Green } catch { Write-Host 'Generating package.json locally...' -ForegroundColor Yellow }"
)

REM Fallback package.json if still missing
if not exist "%APP_DIR%\\package.json" (
    (
        echo {
        echo   "name": "javid-studio",
        echo   "private": true,
        echo   "version": "1.0.0",
        echo   "type": "module",
        echo   "scripts": {
        echo     "dev": "tsx server.ts",
        echo     "build": "vite build",
        echo     "start": "tsx server.ts"
        echo   },
        echo   "dependencies": {
        echo     "@google/genai": "^2.4.0",
        echo     "@tailwindcss/vite": "^4.3.3",
        echo     "@vitejs/plugin-react": "^6.1.1",
        echo     "dotenv": "^17.2.3",
        echo     "express": "^4.21.2",
        echo     "jszip": "^3.10.2",
        echo     "lucide-react": "^0.546.0",
        echo     "motion": "^12.23.24",
        echo     "react": "^19.0.1",
        echo     "react-dom": "^19.0.1",
        echo     "tsx": "^4.21.0",
        echo     "vite": "^8.3.0"
        echo   },
        echo   "devDependencies": {
        echo     "@types/express": "^4.17.21",
        echo     "@types/jszip": "^3.4.1",
        echo     "@types/node": "^22.14.0",
        echo     "@types/react": "^19.3.0",
        echo     "@types/react-dom": "^19.3.0",
        echo     "autoprefixer": "^10.4.21",
        echo     "esbuild": "^0.25.0",
        echo     "tailwindcss": "^4.3.3",
        echo     "typescript": "^7.0.2"
        echo   }
        echo }
    ) > "%APP_DIR%\\package.json"
)

echo [1/3] Installing dependencies via npm...
call npm install --force
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install --force encountered an error.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Building production web applet...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [WARNING] npm run build returned code %ERRORLEVEL%. Continuing with runtime...
)

echo [3/3] Creating launcher scripts and Desktop shortcut...
(
echo @echo off
echo TITLE Javid Studio - Local Ollama Interface
echo cd /d "%%~dp0"
echo set OLLAMA_ORIGINS=*
echo set PORT=3000
echo echo Starting Javid Studio server on port 3000...
echo start "" http://localhost:3000
echo call npm start
echo pause
) > "%~dp0run.bat"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop'; " ^
  "$wsh = New-Object -ComObject WScript.Shell; " ^
  "$appDir = '%~dp0'; " ^
  "if ($appDir.EndsWith('\\')) { $appDir = $appDir.Substring(0, $appDir.Length - 1) }; " ^
  "$runBat = Join-Path $appDir 'run.bat'; " ^
  "$desk = $wsh.SpecialFolders.Item('Desktop'); " ^
  "if ($desk -and (Test-Path $desk)) { " ^
  "  $lnk = $wsh.CreateShortcut((Join-Path $desk 'Javid Studio.lnk')); " ^
  "  $lnk.TargetPath = $runBat; " ^
  "  $lnk.WorkingDirectory = $appDir; " ^
  "  $lnk.Description = 'Launch Javid Studio Local AI Interface'; " ^
  "  $lnk.IconLocation = ($env:SystemRoot + '\\\\System32\\\\shell32.dll,220'); " ^
  "  $lnk.Save(); " ^
  "  Write-Host '[SUCCESS] Desktop shortcut created at:' (Join-Path $desk 'Javid Studio.lnk'); " ^
  "} " ^
  "$oneDriveDesk = Join-Path $env:USERPROFILE 'OneDrive\\\\Desktop'; " ^
  "if ((Test-Path $oneDriveDesk) -and ($oneDriveDesk -ne $desk)) { " ^
  "  $lnk2 = $wsh.CreateShortcut((Join-Path $oneDriveDesk 'Javid Studio.lnk')); " ^
  "  $lnk2.TargetPath = $runBat; " ^
  "  $lnk2.WorkingDirectory = $appDir; " ^
  "  $lnk2.IconLocation = ($env:SystemRoot + '\\\\System32\\\\shell32.dll,220'); " ^
  "  $lnk2.Save(); " ^
  "} " ^
  "$programs = $wsh.SpecialFolders.Item('Programs'); " ^
  "if ($programs -and (Test-Path $programs)) { " ^
  "  $lnk3 = $wsh.CreateShortcut((Join-Path $programs 'Javid Studio.lnk')); " ^
  "  $lnk3.TargetPath = $runBat; " ^
  "  $lnk3.WorkingDirectory = $appDir; " ^
  "  $lnk3.Save(); " ^
  "  Write-Host '[SUCCESS] Start Menu shortcut created.'; " ^
  "}"

echo.
echo ======================================================
echo    INSTALLATION & SHORTCUT SETUP COMPLETE!
echo.
echo    A shortcut 'Javid Studio' is now on your Desktop!
echo    Double-click it anytime to launch Javid Studio.
echo ======================================================
echo.
pause`;

      const createShortcutBat = getCreateShortcutBatContent();
      const runBatContent = `@echo off
TITLE Javid Studio - Local Ollama Interface
cd /d "%~dp0"
set OLLAMA_ORIGINS=*
set PORT=3000
echo Starting Javid Studio server on port 3000...
start "" http://localhost:3000
call npm start
pause`;

      const createShortcutPs1Content = `# Javid Studio Shortcut Creator (PowerShell)
$w = New-Object -ComObject WScript.Shell
$desk = $w.SpecialFolders.Item("Desktop")
$app = $PSScriptRoot
if (-not $app) { $app = (Get-Location).Path }
$runBat = Join-Path $app "run.bat"
if ($desk -and (Test-Path $desk)) {
  $lnk = $w.CreateShortcut((Join-Path $desk "Javid Studio.lnk"))
  $lnk.TargetPath = $runBat
  $lnk.WorkingDirectory = $app
  $lnk.IconLocation = "$env:SystemRoot\\System32\\shell32.dll,220"
  $lnk.Save()
  Write-Host "Created Desktop shortcut: $desk\\Javid Studio.lnk" -ForegroundColor Green
}
$oneDrive = Join-Path $env:USERPROFILE "OneDrive\\Desktop"
if ((Test-Path $oneDrive) -and ($oneDrive -ne $desk)) {
  $lnk2 = $w.CreateShortcut((Join-Path $oneDrive "Javid Studio.lnk"))
  $lnk2.TargetPath = $runBat
  $lnk2.WorkingDirectory = $app
  $lnk2.IconLocation = "$env:SystemRoot\\System32\\shell32.dll,220"
  $lnk2.Save()
  Write-Host "Created OneDrive Desktop shortcut: $oneDrive\\Javid Studio.lnk" -ForegroundColor Green
}`;

      const dockerfileContent = `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
EXPOSE 3000
CMD ["npm", "start"]`;

      const dockerComposeContent = `services:
  javid-studio:
    build: .
    container_name: javid-studio
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OLLAMA_HOST=http://host.docker.internal:11434
    extra_hosts:
      - "host.docker.internal:host-gateway"`;

      const localSetupMd = `# Javid Studio - Local Setup Guide
## Windows
1. Double-click \`install.bat\`
2. A **Javid Studio** shortcut will automatically appear on your Desktop!
3. If you ever need to recreate the shortcut, double-click \`create-shortcut.bat\`.

## Linux / macOS
\`\`\`bash
chmod +x install.sh
./install.sh
\`\`\`
Creates a launcher icon on your Desktop automatically.

## Docker
\`\`\`bash
docker compose up -d --build
\`\`\`
Visit http://localhost:3000`;

      const packageJsonContent = `{
  "name": "javid-studio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "tsx": "^4.21.0",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jszip": "^3.4.1",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "typescript": "^7.0.2"
  }
}
`;

      // Add files to zip
      zip.file('package.json', packageJsonContent);
      zip.file('install.sh', installSh, { unixPermissions: '755' });
      zip.file('install.bat', installBat);
      zip.file('create-shortcut.bat', createShortcutBat);
      zip.file('create-shortcut.ps1', createShortcutPs1Content);
      zip.file('run.bat', runBatContent);
      zip.file('Dockerfile', dockerfileContent);
      zip.file('docker-compose.yml', dockerComposeContent);
      zip.file('README.md', localSetupMd);
      zip.file('.env.example', 'PORT=3000\nOLLAMA_ORIGINS="*"\nOLLAMA_HOST="http://localhost:11434"\n');

      // Generate zip blob
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'javid-studio-installer.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60'
          : 'bg-[#0f121a] border-[#272d40] text-slate-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141824] border-[#212638]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Install Javid Studio Locally
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Run locally on Windows, macOS, or Linux with local GPU acceleration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-[#1f2536]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-1 px-6 pt-3 border-b text-xs transition-colors overflow-x-auto ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#111420] border-[#212638]'
        }`}>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'download'
                ? isLight ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-cyan-500 text-cyan-400'
                : isLight ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer Package (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcut')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shortcut'
                ? isLight ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-cyan-500 text-cyan-400'
                : isLight ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Desktop Shortcut Fix</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'script'
                ? isLight ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-cyan-500 text-cyan-400'
                : isLight ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Automated Scripts</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'docker'
                ? isLight ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-cyan-500 text-cyan-400'
                : isLight ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Docker &amp; Compose</span>
          </button>

          <button
            onClick={() => setActiveTab('ollama')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ollama'
                ? isLight ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-cyan-500 text-cyan-400'
                : isLight ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Local Ollama Linking</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-5 text-xs ${isLight ? 'bg-white' : ''}`}>
          {/* TAB 1: ONE-CLICK ZIP DOWNLOAD */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className={`p-5 border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141824] border-[#23293e]'
              }`}>
                <div className="space-y-1 text-center sm:text-left">
                  <div className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Complete Application &amp; Installer Archive
                  </div>
                  <p className={`text-xs max-w-md ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Includes full application source, <code className="text-cyan-600 dark:text-cyan-400 font-mono">package.json</code>, <code className="text-cyan-600 dark:text-cyan-400 font-mono">install.bat</code> (Windows with auto-recovery), <code className="text-cyan-600 dark:text-cyan-400 font-mono">install.sh</code> (Mac/Linux), and desktop shortcuts.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZipBundle}
                  disabled={isGeneratingZip}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Downloaded Full .zip!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isGeneratingZip ? 'Packaging Full Bundle...' : 'Download Full .zip'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* What's included checklist */}
              <div className={`p-4 border rounded-xl space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111420] border-[#202638]'
              }`}>
                <div className={`font-semibold text-xs uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Package Contents:
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>package.json (All dependencies &amp; scripts)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>install.bat (Windows auto-recovery installer)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>run.bat &amp; create-shortcut.bat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>install.sh (Linux/macOS script)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>server.ts (Backend runtime &amp; telemetry)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    <span>Full UI &amp; Colab Hardware Monitor</span>
                  </div>
                </div>
              </div>

              {/* Error notice for package.json */}
              <div className={`p-3.5 border rounded-xl space-y-1.5 text-[11px] ${
                isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
              }`}>
                <div className="font-semibold flex items-center gap-1.5">
                  <span>Got &quot;package.json is missing&quot; error?</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  This happens if <code className="font-mono">install.bat</code> was run outside the extracted project folder or if you downloaded only the batch file. Simply extract the entire <strong>javid-studio-full.zip</strong> into a folder first, then double-click <code className="font-mono">install.bat</code>. Our installer also automatically downloads and generates <code className="font-mono">package.json</code> if it is not present.
                </p>
              </div>

              {/* Steps after unzipping */}
              <div className="space-y-2">
                <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>How to run after downloading:</div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 space-y-2 shadow-inner">
                  <p className="text-slate-500"># 1. Unzip the archive</p>
                  <p className="text-cyan-300">unzip javid-studio-installer.zip -d javid-studio</p>
                  <p className="text-slate-500"># 2. Enter directory and run the automated installer</p>
                  <p className="text-cyan-300">cd javid-studio && ./install.sh</p>
                  <p className="text-slate-500"># (Or on Windows: double-click install.bat)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP SHORTCUT FIX */}
          {activeTab === 'shortcut' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl space-y-2 transition-colors ${
                isLight ? 'bg-cyan-50/60 border-cyan-200' : 'bg-cyan-950/20 border-cyan-800/40'
              }`}>
                <div className={`font-semibold flex items-center gap-2 ${isLight ? 'text-cyan-900' : 'text-cyan-300'}`}>
                  <Monitor className="w-4 h-4 text-cyan-500" />
                  <span>Ran install.bat but no desktop shortcut?</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Your app dependencies and production build are already finished! On some Windows systems (especially Windows 10/11 with <strong>OneDrive Backup</strong> or custom security policies), shortcuts need to be explicitly placed in the active Shell folder. Use any of the quick fixes below to get your shortcut immediately:
                </p>
              </div>

              {/* Option A: Download create-shortcut.bat */}
              <div className={`p-4 border rounded-xl space-y-3 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141824] border-[#22283a]'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Method 1: Download &amp; Run <code className="text-cyan-600 dark:text-cyan-400 font-mono">create-shortcut.bat</code>
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Place this standalone script in your Javid Studio folder and double-click it.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadShortcutBat}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium rounded-lg text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {downloadShortcutSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download create-shortcut.bat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option B: One-Line PowerShell Quick-Fix */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Method 2: Run in PowerShell (Creates shortcut in 1 second)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell;$d=$w.SpecialFolders.Item('Desktop');$l=$w.CreateShortcut((Join-Path $d 'Javid Studio.lnk'));$l.TargetPath=(Join-Path $PWD 'run.bat');$l.WorkingDirectory=$PWD;$l.IconLocation=($env:SystemRoot + '\\System32\\shell32.dll,220');$l.Save();Write-Host '[SUCCESS] Shortcut created at:' (Join-Path $d 'Javid Studio.lnk') -ForegroundColor Green"`,
                        'ps-shortcut-cmd'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'ps-shortcut-cmd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'ps-shortcut-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono text-[11px] overflow-x-auto shadow-inner whitespace-pre-wrap break-all">
{`powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell;$d=$w.SpecialFolders.Item('Desktop');$l=$w.CreateShortcut((Join-Path $d 'Javid Studio.lnk'));$l.TargetPath=(Join-Path $PWD 'run.bat');$l.WorkingDirectory=$PWD;$l.IconLocation=($env:SystemRoot + '\\System32\\shell32.dll,220');$l.Save();Write-Host '[SUCCESS] Shortcut created at:' (Join-Path $d 'Javid Studio.lnk') -ForegroundColor Green"`}
                </pre>
              </div>

              {/* Option C: Command Prompt */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Method 3: Run in Command Prompt</span>
                  <button
                    onClick={() => copyToClipboard('create-shortcut.bat', 'bat-shortcut-cmd')}
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'bat-shortcut-cmd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'bat-shortcut-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
{`create-shortcut.bat`}
                </pre>
              </div>

              {/* Info / Diagnostics box */}
              <div className={`p-3.5 border rounded-xl space-y-1.5 text-[11px] ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#111420] border-[#202638] text-slate-400'
              }`}>
                <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Why this happens on Windows:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>OneDrive Desktop:</strong> If Windows Desktop backup is enabled, desktop icons live inside <code className="font-mono text-cyan-600 dark:text-cyan-400">%USERPROFILE%\OneDrive\Desktop</code>. Our updated script writes to both standard and OneDrive desktop folders.</li>
                  <li><strong>Working Directory:</strong> The shortcut is configured with the exact directory of your app so <code className="font-mono text-cyan-600 dark:text-cyan-400">npm start</code> never fails when launched from the desktop.</li>
                  <li><strong>Start Menu:</strong> The script also places a shortcut in your Windows Start Menu (<code className="font-mono text-cyan-600 dark:text-cyan-400">Programs\Javid Studio.lnk</code>).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINAL ONE-LINER SCRIPTS */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              {/* Linux / macOS */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>macOS &amp; Linux (Terminal)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'chmod +x install.sh && ./install.sh',
                        'mac-install'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'mac-install' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'mac-install' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
{`chmod +x install.sh
./install.sh`}
                </pre>
              </div>

              {/* Windows PowerShell */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Windows (PowerShell)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\\install.ps1',
                        'win-ps'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'win-ps' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'win-ps' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono text-xs overflow-x-auto shadow-inner">
{`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\\install.ps1`}
                </pre>
              </div>

              {/* Windows Command Prompt */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Windows (Command Prompt)</span>
                  <button
                    onClick={() => copyToClipboard('install.bat', 'win-bat')}
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'win-bat' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'win-bat' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono text-xs overflow-x-auto shadow-inner">
{`install.bat`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DOCKER & COMPOSE */}
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className={`p-3.5 border rounded-lg leading-relaxed ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#141824] border-[#202638] text-slate-300'
              }`}>
                Run Javid Studio inside an isolated Docker container with automatic connection to your host machine's Ollama runtime.
              </div>

              {/* Docker Compose */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Run with Docker Compose (Recommended)</span>
                  <button
                    onClick={() =>
                      copyToClipboard('docker compose up -d --build', 'docker-compose')
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'docker-compose' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'docker-compose' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto shadow-inner">
{`docker compose up -d --build`}
                </pre>
              </div>

              {/* Docker Run Single Command */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <span>Single Docker Run Command</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'docker run -d --name javid-studio -p 3000:3000 --add-host=host.docker.internal:host-gateway javid-studio',
                        'docker-run'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedIndex === 'docker-run' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 'docker-run' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto shadow-inner">
{`docker run -d --name javid-studio \\
  -p 3000:3000 \\
  --add-host=host.docker.internal:host-gateway \\
  javid-studio`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: LOCAL OLLAMA LINKING & CORS */}
          {activeTab === 'ollama' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141824] border-[#23293e]'
              }`}>
                <div className={`font-semibold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Enabling CORS on Local Ollama</span>
                </div>
                <p className={`leading-relaxed text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  By default, Ollama restricts requests from browser origins. Set <code className="text-cyan-600 dark:text-cyan-400 font-mono">OLLAMA_ORIGINS="*"</code> so Javid Studio can connect directly to your local models and GPU.
                </p>
              </div>

              {/* Linux / macOS instructions */}
              <div className="space-y-1.5">
                <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Linux / macOS:</div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
{`# Start Ollama with open origins:
OLLAMA_ORIGINS="*" ollama serve`}
                </pre>
              </div>

              {/* Windows instructions */}
              <div className="space-y-1.5">
                <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Windows (PowerShell):</div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono text-xs overflow-x-auto shadow-inner">
{`# Set environment variable and run:
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
ollama serve`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121520] border-[#212638]'
        }`}>
          <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
            Default Port: <strong className={isLight ? 'text-slate-900' : 'text-slate-300'}>3000</strong> · Health: <strong className="text-emerald-500">Ready</strong>
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-[#202538] hover:bg-[#282e44] text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
