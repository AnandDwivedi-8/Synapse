# Synapse - One Command Startup Script
# Runs both backend and frontend in one terminal

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SYNAPSE - Starting Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Change to project root
$projectRoot = "d:\PROGRAMMING\MY_PROGRAMS\minor project\instaclone-main"
Set-Location $projectRoot

Write-Host "✓ Starting Backend..." -ForegroundColor Green
Write-Host "  Location: $projectRoot\backend" -ForegroundColor Gray
Write-Host "  Port: 8000" -ForegroundColor Gray
Write-Host ""

# Start backend in background
$backendPath = "$projectRoot\backend"
Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm start
} -ArgumentList $backendPath | Out-Null

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host "✓ Starting Frontend..." -ForegroundColor Green
Write-Host "  Location: $projectRoot\frontend" -ForegroundColor Gray
Write-Host "  Port: 5173" -ForegroundColor Gray
Write-Host ""

# Start frontend (this will run in foreground)
Set-Location "$projectRoot\frontend"
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Services Running!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Backend is running in background. Frontend output below:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
