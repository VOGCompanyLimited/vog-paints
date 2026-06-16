@echo off
set NODE_ENV=development
set JWT_SECRET=test_secret_2024
set CLIENT_URL=http://localhost:5173
set COOKIE_SECURE=false
set HTTP_PORT=5000
set HTTPS_PORT=5001
start /B "" "C:\Users\adade\Desktop\Paint_Selling\node-portable\node.exe" server.js
