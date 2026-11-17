@echo off
echo ===================================================
echo     ✨ Launching Spendly - Expense Tracker ✨
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Spendly Server...
start "" http://localhost:5000

node server/server.js
if %errorlevel% neq 0 (
    echo Attempting to start with Python Flask...
    python server/app.py
)

pause
