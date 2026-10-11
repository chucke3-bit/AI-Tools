@echo off
REM ==============================================================================
REM Javid Studio - Local Launcher
REM ==============================================================================
TITLE Javid Studio - Local AI Interface
cd /d "%~dp0"
set OLLAMA_ORIGINS=*
set PORT=3000

echo ==============================================================================
echo                      STARTING JAVID STUDIO
echo            Local AI Web Interface & Colab Hardware Telemetry
echo ==============================================================================
echo Application running at: http://localhost:3000
echo.

start "" http://localhost:3000
call npm start
pause
