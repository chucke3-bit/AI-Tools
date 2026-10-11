# ==============================================================================
# Javid Studio - Create Windows Desktop & Start Menu Shortcut (PowerShell)
# ==============================================================================
$ErrorActionPreference = "SilentlyContinue"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "               JAVID STUDIO - DESKTOP SHORTCUT CREATOR" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$AppDir = $PSScriptRoot
if (-not $AppDir) {
    $AppDir = (Get-Location).Path
}

$RunBat = Join-Path $AppDir "run.bat"

# Ensure run.bat exists
if (-not (Test-Path $RunBat)) {
    Write-Host "[INFO] Generating run.bat launcher..." -ForegroundColor Yellow
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
}

$WshShell = New-Object -ComObject WScript.Shell

# 1. Active Desktop
$DesktopPath = $WshShell.SpecialFolders.Item("Desktop")
if ($DesktopPath -and (Test-Path $DesktopPath)) {
    $Shortcut = $WshShell.CreateShortcut((Join-Path $DesktopPath "Javid Studio.lnk"))
    $Shortcut.TargetPath = $RunBat
    $Shortcut.WorkingDirectory = $AppDir
    $Shortcut.Description = "Launch Javid Studio Local AI Interface"
    $Shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut.Save()
    Write-Host "  [OK] Desktop Shortcut created at: $DesktopPath\Javid Studio.lnk" -ForegroundColor Green
}

# 2. OneDrive Desktop (if redirected or exists separately)
$OneDriveDesktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"
if ((Test-Path $OneDriveDesktop) -and ($OneDriveDesktop -ne $DesktopPath)) {
    $Shortcut2 = $WshShell.CreateShortcut((Join-Path $OneDriveDesktop "Javid Studio.lnk"))
    $Shortcut2.TargetPath = $RunBat
    $Shortcut2.WorkingDirectory = $AppDir
    $Shortcut2.Description = "Launch Javid Studio Local AI Interface"
    $Shortcut2.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut2.Save()
    Write-Host "  [OK] OneDrive Desktop Shortcut created at: $OneDriveDesktop\Javid Studio.lnk" -ForegroundColor Green
}

# 3. Start Menu Programs
$ProgramsPath = $WshShell.SpecialFolders.Item("Programs")
if ($ProgramsPath -and (Test-Path $ProgramsPath)) {
    $Shortcut3 = $WshShell.CreateShortcut((Join-Path $ProgramsPath "Javid Studio.lnk"))
    $Shortcut3.TargetPath = $RunBat
    $Shortcut3.WorkingDirectory = $AppDir
    $Shortcut3.Description = "Launch Javid Studio Local AI Interface"
    $Shortcut3.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
    $Shortcut3.Save()
    Write-Host "  [OK] Start Menu Shortcut created at: $ProgramsPath\Javid Studio.lnk" -ForegroundColor Green
}

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host "                         SHORTCUT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Look for 'Javid Studio' on your Desktop. Double-click it anytime to launch." -ForegroundColor White
Write-Host ""
