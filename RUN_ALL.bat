@echo off
REM Synapse - One Command Startup
REM Starts both backend and frontend in one terminal

echo ================================
echo   SYNAPSE - Starting Services
echo ================================
echo.

REM Kill existing node processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting Backend on port 8000...
cd backend
start "Backend" cmd /k "npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend on port 5173...
cd ..\frontend
echo.
echo ================================
echo   Services Running!
echo ================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Frontend is starting below...
echo ================================
echo.

npm run dev

pause
