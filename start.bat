@echo off
title PhishLense Launcher
echo ========================================================
echo           Launching PhishLense Security Suite
echo ========================================================
echo.

echo [1/2] Starting Python FastAPI Backend on port 8000...
start "PhishLense Backend" cmd /k ".\.venv\Scripts\activate.bat && uvicorn api.main:app --reload --port 8000"

echo [2/2] Starting Vite React Frontend Dashboard on port 5173...
start "PhishLense Frontend" cmd /k "cd frontend-app && npm run dev"

echo.
echo ========================================================
echo Services started!
echo - Backend API:  http://127.0.0.1:8000
echo - Frontend App: http://localhost:5173
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173
