@echo off
echo ================================================
echo   OM SAI KRUPA - Vehicle Booking Application
echo ================================================
echo.

:: Start Backend
echo [1/2] Starting Backend API Server...
start "Om Sai Krupa - Backend API" cmd /k "cd /d "%~dp0backend" && npx tsx src/index.ts"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend
echo [2/2] Starting Frontend Dev Server...
start "Om Sai Krupa - Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ================================================
echo   Application is starting...
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo.
echo   DEMO CREDENTIALS:
echo   Admin:  admin@omsaikrupa.com / Admin@123
echo   User:   rahul@example.com / User@123
echo ================================================
echo.
pause
