@echo off
REM ==============================================================================
REM Javid Studio - Create Windows Desktop & Start Menu Shortcut
REM ==============================================================================
TITLE Javid Studio - Shortcut Creator
color 0B

echo ==============================================================================
echo               JAVID STUDIO - DESKTOP SHORTCUT CREATOR
echo ==============================================================================
echo.

set "APP_DIR=%~dp0"
REM Strip trailing backslash if present for consistency
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

REM 1. Ensure run.bat exists in this directory
if not exist "%APP_DIR%\run.bat" (
    echo [INFO] Generating run.bat launcher...
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
    echo   [OK] Created %APP_DIR%\run.bat
)

echo [1/2] Creating Desktop shortcut pointing to:
echo       %APP_DIR%\run.bat
echo.

REM 2. Try PowerShell method first (handles normal Desktop & OneDrive Desktop)
set "CREATED_OK=0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop'; " ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$appDir = '%APP_DIR%'; " ^
    "$runBat = Join-Path $appDir 'run.bat'; " ^
    "$desk = $wsh.SpecialFolders.Item('Desktop'); " ^
    "$created = $false; " ^
    "if ($desk -and (Test-Path $desk)) { " ^
    "    $lnk = $wsh.CreateShortcut((Join-Path $desk 'Javid Studio.lnk')); " ^
    "    $lnk.TargetPath = $runBat; " ^
    "    $lnk.WorkingDirectory = $appDir; " ^
    "    $lnk.Description = 'Launch Javid Studio Local AI Interface'; " ^
    "    $lnk.IconLocation = ($env:SystemRoot + '\System32\shell32.dll,220'); " ^
    "    $lnk.Save(); " ^
    "    Write-Host '  [OK] Created Desktop shortcut at:' (Join-Path $desk 'Javid Studio.lnk') -ForegroundColor Green; " ^
    "    $created = $true; " ^
    "} " ^
    "$oneDriveDesk = Join-Path $env:USERPROFILE 'OneDrive\Desktop'; " ^
    "if ((Test-Path $oneDriveDesk) -and ($oneDriveDesk -ne $desk)) { " ^
    "    $lnk2 = $wsh.CreateShortcut((Join-Path $oneDriveDesk 'Javid Studio.lnk')); " ^
    "    $lnk2.TargetPath = $runBat; " ^
    "    $lnk2.WorkingDirectory = $appDir; " ^
    "    $lnk2.Description = 'Launch Javid Studio Local AI Interface'; " ^
    "    $lnk2.IconLocation = ($env:SystemRoot + '\System32\shell32.dll,220'); " ^
    "    $lnk2.Save(); " ^
    "    Write-Host '  [OK] Created OneDrive Desktop shortcut at:' (Join-Path $oneDriveDesk 'Javid Studio.lnk') -ForegroundColor Green; " ^
    "} " ^
    "$programs = $wsh.SpecialFolders.Item('Programs'); " ^
    "if ($programs -and (Test-Path $programs)) { " ^
    "    $lnk3 = $wsh.CreateShortcut((Join-Path $programs 'Javid Studio.lnk')); " ^
    "    $lnk3.TargetPath = $runBat; " ^
    "    $lnk3.WorkingDirectory = $appDir; " ^
    "    $lnk3.Description = 'Launch Javid Studio'; " ^
    "    $lnk3.IconLocation = ($env:SystemRoot + '\System32\shell32.dll,220'); " ^
    "    $lnk3.Save(); " ^
    "    Write-Host '  [OK] Created Start Menu shortcut at:' (Join-Path $programs 'Javid Studio.lnk') -ForegroundColor Green; " ^
    "} " ^
    "if ($created) { exit 0 } else { exit 1 }"

if %ERRORLEVEL% EQU 0 (
    set "CREATED_OK=1"
)

REM 3. Fallback to VBScript if PowerShell was blocked or failed
if "%CREATED_OK%"=="0" (
    echo [INFO] PowerShell was restricted or skipped, using Windows VBScript fallback...
    set "VB_SCRIPT=%TEMP%\create_javid_studio_lnk_%RANDOM%.vbs"
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
    echo   [OK] VBScript fallback successfully generated shortcuts!
)

echo.
echo ==============================================================================
echo                         SHORTCUT SETUP COMPLETE!
echo ==============================================================================
echo Look for 'Javid Studio' on your Windows Desktop and Start Menu.
echo Double-clicking that icon will immediately start Javid Studio and open
echo http://localhost:3000 in your browser.
echo.
pause
