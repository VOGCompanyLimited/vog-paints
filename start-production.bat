@echo off
title PaintMarket Production Server
cd /d "%~dp0"

echo ============================================
echo   PaintMarket - Production Startup
echo ============================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Check node-portable/ path.
    exit /b 1
)

:: Set production environment
set NODE_ENV=production

:: Start Backend
echo [1/2] Starting Backend (port 443/80)...
cd backend
echo Generating SSL certificates if needed...
node scripts/generate-ssl.js
echo.
start "PaintMarket Backend" cmd /c "node server.js"

:: Wait for backend
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend (port 5173)...
cd ..\frontend
start "PaintMarket Frontend" cmd /c "npx vite --host 0.0.0.0 --port 5173"

:: Wait then open browser
timeout /t 4 /nobreak >nul
echo.
echo ============================================
echo   Servers are starting up:
echo   Frontend: http://localhost:5173
echo   Backend:  https://localhost:443
echo   Backend:  http://localhost:5000
echo ============================================
echo.
start http://localhost:5173
