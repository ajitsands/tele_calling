@echo off
title TeleCalling React Frontend
echo ========================================================
echo Starting TeleCalling React Frontend (Vite)
echo Web App: http://localhost:3000
echo ========================================================

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo [INFO] First time setup: Installing npm packages...
    npm install
)

npm run dev
pause

