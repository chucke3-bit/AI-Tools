# ==============================================================================
# Javid Studio - Windows PowerShell One-Click Installer
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "               JAVID STUDIO - LOCAL RUNTIME INSTALLER" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/4] Checking Node.js..." -ForegroundColor Blue
try {
    $nodeVer = node -v
    Write-Host "  ✓ Node.js detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  ! Node.js is not installed." -ForegroundColor Yellow
    Write-Host "    Downloading Node.js LTS installer..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS
}

# 2. Check Ollama
Write-Host "`n[2/4] Checking Ollama..." -ForegroundColor Blue
try {
    $ollamaVer = ollama --version
    Write-Host "  ✓ Ollama detected: $ollamaVer" -ForegroundColor Green
} catch {
    Write-Host "  ! Ollama not found in PATH." -ForegroundColor Yellow
    Write-Host "    You can install Ollama for Windows from: https://ollama.com/download/windows" -ForegroundColor Yellow
}

# 3. Check Directory & package.json
$CurrentDir = $PSScriptRoot
if (-not $CurrentDir) { $CurrentDir = (Get-Location).Path }
Set-Location $CurrentDir

$PkgPath = Join-Path $CurrentDir "package.json"
if (-not (Test-Path $PkgPath)) {
    Write-Host "`n[NOTICE] package.json not found in $CurrentDir" -ForegroundColor Yellow
    Write-Host "Attempting to download complete project package..." -ForegroundColor Cyan
    try {
        $zipTemp = Join-Path $CurrentDir "javid-full-temp.zip"
        Invoke-WebRequest -Uri "https://ais-pre-koknghk65sn5nn6y2kcn7z-178731558169.europe-west2.run.app/api/download/project-zip" -OutFile $zipTemp -UseBasicParsing
        Expand-Archive -Path $zipTemp -DestinationPath $CurrentDir -Force
        Remove-Item $zipTemp -Force
        Write-Host "✓ Complete package downloaded and extracted!" -ForegroundColor Green
    } catch {
        Write-Host "! Automatic download failed. Generating package.json locally..." -ForegroundColor Yellow
        $defaultPkg = @'
{
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
'@
        Set-Content -Path $PkgPath -Value $defaultPkg -Encoding UTF8
        Write-Host "✓ package.json generated." -ForegroundColor Green
    }
}

# 4. Install packages
Write-Host "`n[3/4] Installing dependencies and building Javid Studio..." -ForegroundColor Blue
npm install --force
npm run build

# 5. Create Desktop Shortcut
Write-Host "`n[4/4] Creating Windows Desktop Shortcut..." -ForegroundColor Blue
$RunBat = Join-Path $CurrentDir "run.bat"

# Ensure run.bat exists with proper working directory configuration
$runBatContent = @"
@echo off
TITLE Javid Studio - Local Ollama Interface
cd /d "%~dp0"
set OLLAMA_ORIGINS=*
set PORT=3000
echo Starting Javid Studio server on port 3000...
start "" http://localhost:3000
call npm start
pause
"@
Set-Content -Path $RunBat -Value $runBatContent -Encoding ASCII

$WshShell = New-Object -ComObject WScript.Shell

# Primary Desktop
$DesktopPath = $WshShell.SpecialFolders.Item("Desktop")
if ($DesktopPath -and (Test-Path $DesktopPath)) {
    $Shortcut = $WshShell.CreateShortcut((Join-Path $DesktopPath "Javid Studio.lnk"))
    $Shortcut.TargetPath = $RunBat
    $Shortcut.WorkingDirectory = $CurrentDir
    $Shortcut.Description = "Launch Javid Studio Local AI Interface"
    $Shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut.Save()
    Write-Host "  ✓ Desktop shortcut created: $DesktopPath\Javid Studio.lnk" -ForegroundColor Green
}

# OneDrive Desktop fallback
$OneDriveDesktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"
if ((Test-Path $OneDriveDesktop) -and ($OneDriveDesktop -ne $DesktopPath)) {
    $Shortcut2 = $WshShell.CreateShortcut((Join-Path $OneDriveDesktop "Javid Studio.lnk"))
    $Shortcut2.TargetPath = $RunBat
    $Shortcut2.WorkingDirectory = $CurrentDir
    $Shortcut2.Description = "Launch Javid Studio Local AI Interface"
    $Shortcut2.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut2.Save()
    Write-Host "  ✓ OneDrive Desktop shortcut created: $OneDriveDesktop\Javid Studio.lnk" -ForegroundColor Green
}

# Start Menu Programs
$ProgramsPath = $WshShell.SpecialFolders.Item("Programs")
if ($ProgramsPath -and (Test-Path $ProgramsPath)) {
    $Shortcut3 = $WshShell.CreateShortcut((Join-Path $ProgramsPath "Javid Studio.lnk"))
    $Shortcut3.TargetPath = $RunBat
    $Shortcut3.WorkingDirectory = $CurrentDir
    $Shortcut3.Description = "Launch Javid Studio"
    $Shortcut3.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut3.Save()
    Write-Host "  ✓ Start Menu shortcut created." -ForegroundColor Green
}

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host "                         INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "You can launch Javid Studio by clicking the desktop icon or running: .\run.bat"
Write-Host "Web Interface: http://localhost:3000`n"

$StartPrompt = Read-Host "Would you like to start Javid Studio now? (Y/N)"
if ($StartPrompt -eq 'Y' -or $StartPrompt -eq 'y') {
    Start-Process "http://localhost:3000"
    & "$CurrentDir\run.bat"
}
