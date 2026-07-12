@echo off
REM ============================================
REM   SYNAPSE - One Command Startup
REM   Runs Backend + Frontend in one cmd window
REM ============================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================
echo   SYNAPSE - Starting Services
echo ============================================
echo.

REM Get project root directory
cd /d "%~dp0"
set "PROJECT_ROOT=%cd%"

echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend...
echo   Location: %PROJECT_ROOT%\backend
echo   Port: 4000
echo.

REM Start backend in background
start "Synapse Backend" /B cmd /c "cd /d "%PROJECT_ROOT%\backend" && node index.js"

REM Wait for backend to fully start
timeout /t 3 /nobreak >nul

echo Starting Frontend...
echo   Location: %PROJECT_ROOT%\frontend
echo   Port: 5173
echo.

echo ============================================
echo   Services Running!
echo ============================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Frontend is starting below...
echo ============================================
echo.

REM Start frontend in main window
cd /d "%PROJECT_ROOT%\frontend"
node node_modules/vite/bin/vite.js

pause
