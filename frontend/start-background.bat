@echo off
set PATH=C:\Users\adade\Desktop\Paint_Selling\node-portable;%PATH%
cd /d "C:\Users\adade\Desktop\Paint_Selling\frontend"
start /B "" "C:\Users\adade\Desktop\Paint_Selling\node-portable\npx.cmd" vite --host 0.0.0.0 --port 5173
