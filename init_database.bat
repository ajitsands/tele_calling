@echo off
title Initialize TeleCalling Database
echo ========================================================
echo Initializing MySQL Database: tele_calling_db
echo Host: localhost:6061 ^| User: root
echo ========================================================

REM Run Schema
mysql -h 127.0.0.1 -P 6061 -u root -p"S@nds1@b" < database\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to execute schema.sql. Please ensure MySQL is running on port 6061.
    pause
    exit /b %ERRORLEVEL%
)

REM Run Seed
mysql -h 127.0.0.1 -P 6061 -u root -p"S@nds1@b" < database\seed.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to execute seed.sql.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] tele_calling_db initialized and seeded successfully!
pause

