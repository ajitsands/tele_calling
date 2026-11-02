@echo off
title TeleCalling PHP Backend
echo ========================================================
echo Starting TeleCalling PHP MVC Backend API Server
echo ========================================================
echo Current Wi-Fi / Local Server IP:
ipconfig | findstr /i "IPv4"
echo ========================================================

cd /d "%~dp0backend\public"
php -S 0.0.0.0:8000
pause

