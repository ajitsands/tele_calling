@echo off
title Launch TeleCalling Application
echo ========================================================
echo Starting TeleCalling Pro System
echo ========================================================

echo 1. Starting PHP Backend on http://0.0.0.0:8000 ...
start "TeleCalling Backend API (PHP)" "%~dp0run_backend.bat"

timeout /t 2 /nobreak >nul

echo 2. Starting React Frontend on http://0.0.0.0:3000 ...
start "TeleCalling Frontend (React)" "%~dp0run_frontend.bat"

echo.
echo ========================================================
echo SERVER NETWORK ADDRESSES DETECTED:
ipconfig | findstr /i "IPv4"
echo ========================================================
echo.
echo [WEB APPLICATION ON THIS PC]
echo  - Open: http://localhost:3000
echo.
echo [MOBILE APP CONFIGURATION]
echo  - When you change locations or Wi-Fi, look at the IPv4
echo    address above and type it into the Android App:
echo    http://^<YOUR_IPV4^>:8000
echo ========================================================
echo.
pause

