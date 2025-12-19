@echo off
REM Script para ejecutar pruebas del backend de Kiwi en Windows
REM Uso: run_tests.bat [opciones]

echo ========================================
echo   Kiwi Backend Test Runner (Windows)
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "manage.py" (
    echo Error: Este script debe ejecutarse desde el directorio backend
    exit /b 1
)

REM Verificar que pytest está instalado
where pytest >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo pytest no esta instalado. Instalando dependencias...
    pip install -r requirements-test.txt
)

REM Procesar argumentos
if "%1"=="" goto all
if "%1"=="all" goto all
if "%1"=="login" goto login
if "%1"=="security" goto security
if "%1"=="unit" goto unit
if "%1"=="integration" goto integration
if "%1"=="coverage" goto coverage
if "%1"=="quick" goto quick
if "%1"=="lint" goto lint
if "%1"=="help" goto help
goto invalid

:all
echo Ejecutando todas las pruebas...
pytest -v
goto end

:login
echo Ejecutando pruebas de login...
pytest userAPI/tests/test_login.py -v
goto end

:security
echo Ejecutando pruebas de seguridad...
pytest -m security -v
goto end

:unit
echo Ejecutando pruebas unitarias...
pytest -m unit -v
goto end

:integration
echo Ejecutando pruebas de integración...
pytest -m integration -v
goto end

:coverage
echo Ejecutando pruebas con cobertura...
pytest --cov=. --cov-report=html --cov-report=term-missing
echo Reporte HTML generado en: htmlcov\index.html
goto end

:quick
echo Ejecutando pruebas rapidas...
pytest -m "not slow" -v
goto end

:lint
echo Ejecutando verificaciones de calidad...
echo Flake8...
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
echo Black...
black --check .
echo Isort...
isort --check-only .
echo Todas las verificaciones pasaron
goto end

:help
echo Uso: run_tests.bat [OPCION]
echo.
echo Opciones:
echo   all          Ejecutar todas las pruebas (por defecto)
echo   login        Ejecutar solo pruebas de login
echo   security     Ejecutar solo pruebas de seguridad
echo   unit         Ejecutar solo pruebas unitarias
echo   integration  Ejecutar solo pruebas de integración
echo   coverage     Ejecutar con reporte de cobertura HTML
echo   quick        Ejecutar pruebas rapidas (sin lentas)
echo   lint         Ejecutar verificaciones de calidad de codigo
echo   help         Mostrar esta ayuda
echo.
goto end

:invalid
echo Opcion no valida: %1
echo Use 'run_tests.bat help' para ver las opciones disponibles
exit /b 1

:end
echo.
echo Completado
exit /b 0