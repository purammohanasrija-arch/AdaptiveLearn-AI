@echo off
echo ========================================================
echo  AdaptiveLearn AI - Launching Full-Stack Application
echo ========================================================
echo Starting Python Backend on http://localhost:5000...
start "AdaptiveLearn Backend (Python FastAPI)" cmd /k "cd /d %~dp0neural\backend && python main.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend on http://localhost:5173...
start "AdaptiveLearn Frontend (React + Vite)" cmd /k "cd /d %~dp0neural\frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend:  http://localhost:5000/api/health (Documentation at http://localhost:5000/docs)
echo Frontend: http://localhost:5173
echo.

