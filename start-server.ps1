# Soil Software Web Server Startup Script
Write-Host "Starting Soil Software Web Server..." -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Check if port 8000 is in use
Write-Host "Checking port 8000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :8000
if ($portCheck) {
    Write-Host "Port 8000 is in use. Killing existing processes..." -ForegroundColor Yellow
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start server
Write-Host "Starting Python HTTP Server on port 8000..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:8000/index.html" -ForegroundColor White
Write-Host "  http://127.0.0.1:8000/index.html" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start server in background and open browser
Start-Process python -ArgumentList "-m", "http.server", "8000" -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 3

# Verify server is running
$serverRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($serverRunning) {
    Write-Host "✅ Server is running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:8000/index.html"
} else {
    Write-Host "❌ Server failed to start. Please check:" -ForegroundColor Red
    Write-Host "  1. Python is installed and in PATH" -ForegroundColor Yellow
    Write-Host "  2. Port 8000 is not blocked by firewall" -ForegroundColor Yellow
    Write-Host "  3. No other application is using port 8000" -ForegroundColor Yellow
}
