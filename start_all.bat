@echo off
title Launch TeleCalling Application
echo ========================================================
echo Starting TeleCalling Pro System
echo ========================================================

echo 1. Starting PHP Backend on http://localhost:8000 ...
start "TeleCalling Backend API (PHP)" "%~dp0run_backend.bat"

timeout /t 2 /nobreak >nul

echo 2. Starting React Frontend on http://localhost:3000 ...
start "TeleCalling Frontend (React)" "%~dp0run_frontend.bat"

echo.
echo ========================================================
echo Web Application URL: http://localhost:3000
echo Backend API URL:    http://localhost:8000/api
echo ========================================================

