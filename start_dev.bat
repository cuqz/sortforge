@echo off
cd /d "%~dp0"
start "Backend" cmd /c "cd backend && go run . --addr :8080"
timeout /t 2 /nobreak > nul
start "Frontend" cmd /c "cd frontend && npm run dev"
echo Servers started
