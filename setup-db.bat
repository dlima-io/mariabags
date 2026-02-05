@echo off
echo ========================================
echo    Maria Bags - Database Setup
echo ========================================
echo.

echo [1/3] Creando base de datos...
psql -U postgres -c "DROP DATABASE IF EXISTS mariabags;"
psql -U postgres -c "CREATE DATABASE mariabags;"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear la base de datos
    echo Verifica que PostgreSQL este corriendo y las credenciales sean correctas
    pause
    exit /b 1
)
echo OK - Base de datos creada

echo.
echo [2/3] Ejecutando migraciones (creando tablas)...
psql -U postgres -d mariabags -f backend\src\db\migrations\001_initial_schema.sql
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron crear las tablas
    pause
    exit /b 1
)
echo OK - Tablas creadas

echo.
echo [3/3] Cargando datos de prueba...
psql -U postgres -d mariabags -f backend\src\db\seeds\001_seed_data.sql
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron cargar los datos de prueba
    pause
    exit /b 1
)
echo OK - Datos de prueba cargados

echo.
echo ========================================
echo    Setup completado exitosamente!
echo ========================================
echo.
echo Usuarios de prueba:
echo   - admin / admin123
echo   - maria / maria123
echo.
echo Clientes de prueba: 5
echo.
echo Ahora puedes ejecutar:
echo   cd backend
echo   npm run dev
echo.
pause
