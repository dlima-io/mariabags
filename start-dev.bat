@echo off
echo ========================================
echo    Maria Bags - Inicio Desarrollo
echo ========================================
echo.

echo [INFO] Iniciando Backend en puerto 3000...
echo [INFO] Iniciando Frontend en puerto 5173...
echo.
echo Presiona Ctrl+C para detener ambos servidores
echo.

start "Maria Bags Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Maria Bags Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servidores iniciados en ventanas separadas
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Cierra esta ventana cuando termines el testing
pause
