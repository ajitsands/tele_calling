@echo off
title TeleCalling PHP Backend
echo ========================================================
echo Starting TeleCalling PHP MVC Backend API Server
echo Endpoint: http://localhost:8000
echo ========================================================

cd /d "%~dp0backend\public"
php -S 0.0.0.0:8000
pause
