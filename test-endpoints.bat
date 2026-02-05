@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Maria Bags - Test de Endpoints
echo ========================================
echo.

REM Verificar si el backend esta corriendo
echo [1/6] Verificando que el backend este corriendo...
curl -s http://localhost:3000/health > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Backend no esta corriendo en http://localhost:3000
    echo Ejecuta primero: cd backend ^&^& npm run dev
    pause
    exit /b 1
)
echo OK - Backend corriendo

echo.
echo [2/6] Health Check...
curl -s http://localhost:3000/health
echo.

echo.
echo [3/6] Login con credenciales correctas...
curl -s -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > temp_login.json

type temp_login.json
echo.

REM Extraer token (simplificado - en produccion usar jq o similar)
for /f "tokens=2 delims=:" %%a in ('type temp_login.json ^| findstr /C:"token"') do (
    set "RAW_TOKEN=%%a"
)
REM Limpiar token
set "TOKEN=!RAW_TOKEN:"=!"
set "TOKEN=!TOKEN:,=!"
set "TOKEN=!TOKEN: =!"

if "!TOKEN!"=="" (
    echo ERROR: No se pudo obtener el token
    del temp_login.json
    pause
    exit /b 1
)
echo OK - Token obtenido

echo.
echo [4/6] Listar clientes (con autenticacion)...
curl -s -X GET http://localhost:3000/api/clientes ^
  -H "Authorization: Bearer !TOKEN!"
echo.

echo.
echo [5/6] Login con credenciales incorrectas (debe fallar)...
curl -s -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"wrong\"}"
echo.

echo.
echo [6/6] Acceso sin token (debe fallar con 401)...
curl -s -w "\nHTTP Status: %%{http_code}\n" ^
  -X GET http://localhost:3000/api/clientes
echo.

del temp_login.json 2>nul

echo.
echo ========================================
echo    Testing completado
echo ========================================
echo.
echo Revisa que:
echo  - Health check devuelva status: ok
echo  - Login correcto devuelva token
echo  - GET /clientes con token devuelva array
echo  - Login incorrecto devuelva error 401
echo  - GET sin token devuelva error 401
echo.
pause
