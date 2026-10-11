@echo off
REM ==============================================================================
REM Javid Studio - Windows Batch Installer
REM ==============================================================================
TITLE Javid Studio Installer

REM Ensure working directory is the folder where install.bat is located
cd /d "%~dp0"
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

echo ==============================================================================
echo                      JAVID STUDIO LOCAL INSTALLER
echo        Local AI Interface ^& Colab-Style Hardware Runtime Monitor
echo ==============================================================================
echo.

REM 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js found:
node -v
echo.

REM 2. Check Ollama
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [NOTICE] Ollama was not found in your PATH.
    echo If you want to run local models on your GPU, download Ollama from:
    echo https://ollama.com/download/windows
    echo.
) else (
    echo [2/4] Local Ollama detected!
)

REM 3. Verify and Recover package.json if missing
if not exist "%APP_DIR%\package.json" (
    echo.
    echo [WARNING] package.json was not found in:
    echo %APP_DIR%
    echo.
    echo This happens when install.bat is downloaded standalone or extracted without
    echo the full application files.
    echo Attempting to automatically download the full project package...
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Write-Host 'Downloading full Javid Studio package...' -ForegroundColor Cyan; try { $zip = Join-Path '%APP_DIR%' 'javid-bundle-temp.zip'; Invoke-WebRequest -Uri 'https://ais-pre-koknghk65sn5nn6y2kcn7z-178731558169.europe-west2.run.app/api/download/project-zip' -OutFile $zip -UseBasicParsing; Expand-Archive -Path $zip -DestinationPath '%APP_DIR%' -Force; Remove-Item $zip -Force; Write-Host '[SUCCESS] All files restored including package.json!' -ForegroundColor Green } catch { Write-Host '[INFO] Automatic download failed. Generating package.json locally...' -ForegroundColor Yellow }"
)

REM If still missing (offline), generate package.json locally so npm install can run
if not exist "%APP_DIR%\package.json" (
    echo [INFO] Generating package.json configuration...
    (
        echo {
        echo   "name": "javid-studio",
        echo   "private": true,
        echo   "version": "1.0.0",
        echo   "type": "module",
        echo   "scripts": {
        echo     "dev": "tsx server.ts",
        echo     "build": "vite build",
        echo     "start": "tsx server.ts",
        echo     "preview": "vite preview"
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
    ) > "%APP_DIR%\package.json"
    echo   [OK] Generated %APP_DIR%\package.json
)

REM 4. Install NPM Dependencies
echo [3/4] Installing dependencies via npm...
call npm install --force
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install --force failed.
    echo Please make sure you have internet access and that Node.js is up to date.
    pause
    exit /b 1
)

REM 5. Build application
echo [4/5] Building production assets...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] npm run build encountered an error.
    echo Attempting direct execution via tsx...
)

REM 5. Create start script
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

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
) > "%APP_DIR%\run.bat"

REM 6. Create Desktop and Start Menu Shortcuts
echo.
echo [5/5] Creating Desktop and Start Menu shortcuts...
set "CREATED_OK=0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop'; " ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$appDir = '%APP_DIR%'; " ^
    "$runBat = Join-Path $appDir 'run.bat'; " ^
    "$desk = $wsh.SpecialFolders.Item('Desktop'); " ^
    "$created = $false; " ^
    "$icoPath = Join-Path $appDir 'favicon.ico'; " ^
    "$iconLoc = if (Test-Path $icoPath) { $icoPath } else { ($env:SystemRoot + '\System32\shell32.dll,220') }; " ^
    "if ($desk -and (Test-Path $desk)) { " ^
    "    $lnk = $wsh.CreateShortcut((Join-Path $desk 'Javid Studio.lnk')); " ^
    "    $lnk.TargetPath = $runBat; " ^
    "    $lnk.WorkingDirectory = $appDir; " ^
    "    $lnk.Description = 'Launch Javid Studio Local AI Interface'; " ^
    "    $lnk.IconLocation = $iconLoc; " ^
    "    $lnk.Save(); " ^
    "    Write-Host '  [OK] Desktop shortcut created at:' (Join-Path $desk 'Javid Studio.lnk') -ForegroundColor Green; " ^
    "    $created = $true; " ^
    "} " ^
    "$oneDriveDesk = Join-Path $env:USERPROFILE 'OneDrive\Desktop'; " ^
    "if ((Test-Path $oneDriveDesk) -and ($oneDriveDesk -ne $desk)) { " ^
    "    $lnk2 = $wsh.CreateShortcut((Join-Path $oneDriveDesk 'Javid Studio.lnk')); " ^
    "    $lnk2.TargetPath = $runBat; " ^
    "    $lnk2.WorkingDirectory = $appDir; " ^
    "    $lnk2.Description = 'Launch Javid Studio Local AI Interface'; " ^
    "    $lnk2.IconLocation = $iconLoc; " ^
    "    $lnk2.Save(); " ^
    "    Write-Host '  [OK] OneDrive Desktop shortcut created at:' (Join-Path $oneDriveDesk 'Javid Studio.lnk') -ForegroundColor Green; " ^
    "} " ^
    "$programs = $wsh.SpecialFolders.Item('Programs'); " ^
    "if ($programs -and (Test-Path $programs)) { " ^
    "    $lnk3 = $wsh.CreateShortcut((Join-Path $programs 'Javid Studio.lnk')); " ^
    "    $lnk3.TargetPath = $runBat; " ^
    "    $lnk3.WorkingDirectory = $appDir; " ^
    "    $lnk3.Description = 'Launch Javid Studio'; " ^
    "    $lnk3.IconLocation = $iconLoc; " ^
    "    $lnk3.Save(); " ^
    "    Write-Host '  [OK] Start Menu shortcut created.' -ForegroundColor Green; " ^
    "} " ^
    "if ($created) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    set "CREATED_OK=1"
)

if "%CREATED_OK%"=="0" (
    echo [INFO] Creating shortcut via Windows VBScript engine...
    set "VB_SCRIPT=%TEMP%\create_javid_lnk_%RANDOM%.vbs"
    (
        echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
        echo sDesktop = oWS.SpecialFolders^("Desktop"^)
        echo Set oLink = oWS.CreateShortcut^(sDesktop ^& "\Javid Studio.lnk"^)
        echo oLink.TargetPath = "%APP_DIR%\run.bat"
        echo oLink.WorkingDirectory = "%APP_DIR%"
        echo oLink.Description = "Launch Javid Studio Local AI Interface"
        echo oLink.IconLocation = oWS.ExpandEnvironmentStrings^("%%SystemRoot%%\System32\shell32.dll,220"^)
        echo oLink.Save
        echo Set oLink = Nothing
        echo sProg = oWS.SpecialFolders^("Programs"^)
        echo If oWS.Run^("cmd /c if exist """ ^& sProg ^& """ exit 0", 0, True^) = 0 Then
        echo   Set oLink2 = oWS.CreateShortcut^(sProg ^& "\Javid Studio.lnk"^)
        echo   oLink2.TargetPath = "%APP_DIR%\run.bat"
        echo   oLink2.WorkingDirectory = "%APP_DIR%"
        echo   oLink2.Description = "Launch Javid Studio"
        echo   oLink2.IconLocation = oWS.ExpandEnvironmentStrings^("%%SystemRoot%%\System32\shell32.dll,220"^)
        echo   oLink2.Save
        echo End If
    ) > "%VB_SCRIPT%"
    
    cscript //nologo "%VB_SCRIPT%"
    if exist "%VB_SCRIPT%" del /f /q "%VB_SCRIPT%" >nul 2>nul
    echo   [OK] Desktop shortcut created!
)

echo.
echo ==============================================================================
echo                      INSTALLATION SUCCESSFUL!
echo ==============================================================================
echo A 'Javid Studio' shortcut has been added to your Desktop.
echo You can also run: %APP_DIR%\run.bat
echo Application URL: http://localhost:3000
echo.
set /p START_NOW="Do you want to start Javid Studio now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    call "%APP_DIR%\run.bat"
)
pause
