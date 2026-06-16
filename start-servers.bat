@echo off
title PaintMarket Server Launcher

echo Starting PaintMarket Servers...

:: Start backend
echo [1/2] Starting Backend...
start "PaintMarket API" /MIN cmd /c "cd /d "C:\Users\adade\Desktop\Paint_Selling\backend" && set NODE_ENV=development && set JWT_SECRET=test_secret_2024 && set CLIENT_URL=http://localhost:5173 && set COOKIE_SECURE=false && set HTTP_PORT=5000 && set HTTPS_PORT=5001 && "C:\Users\adade\Desktop\Paint_Selling\node-portable\node.exe" server.js"

timeout /t 4 /nobreak >nul

:: Start frontend
echo [2/2] Starting Frontend...
start "PaintMarket Frontend" /MIN cmd /c "cd /d "C:\Users\adade\Desktop\Paint_Selling\frontend" && set PATH=C:\Users\adade\Desktop\Paint_Selling\node-portable;%PATH% && npx vite --host 0.0.0.0 --port 5173"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo  PaintMarket is starting up!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo ============================================
echo.
start http://localhost:5173
