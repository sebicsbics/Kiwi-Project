#!/bin/bash

# Script para ejecutar pruebas del backend de Kiwi
# Uso: ./run_tests.sh [opciones]

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🥝 Kiwi Backend Test Runner${NC}"
echo "================================"

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./run_tests.sh [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  all          Ejecutar todas las pruebas (por defecto)"
    echo "  login        Ejecutar solo pruebas de login"
    echo "  security     Ejecutar solo pruebas de seguridad"
    echo "  unit         Ejecutar solo pruebas unitarias"
    echo "  integration  Ejecutar solo pruebas de integración"
    echo "  coverage     Ejecutar con reporte de cobertura HTML"
    echo "  quick        Ejecutar pruebas rápidas (sin lentas)"
    echo "  lint         Ejecutar verificaciones de calidad de código"
    echo "  help         Mostrar esta ayuda"
    echo ""
}

# Verificar que estamos en el directorio correcto
if [ ! -f "manage.py" ]; then
    echo -e "${RED}Error: Este script debe ejecutarse desde el directorio backend${NC}"
    exit 1
fi

# Verificar que pytest está instalado
if ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}pytest no está instalado. Instalando dependencias...${NC}"
    pip install -r requirements-test.txt
fi

# Procesar argumentos
case "${1:-all}" in
    all)
        echo -e "${GREEN}Ejecutando todas las pruebas...${NC}"
        pytest -v
        ;;
    login)
        echo -e "${GREEN}Ejecutando pruebas de login...${NC}"
        pytest userAPI/tests/test_login.py -v
        ;;
    security)
        echo -e "${GREEN}Ejecutando pruebas de seguridad...${NC}"
        pytest -m security -v
        ;;
    unit)
        echo -e "${GREEN}Ejecutando pruebas unitarias...${NC}"
        pytest -m unit -v
        ;;
    integration)
        echo -e "${GREEN}Ejecutando pruebas de integración...${NC}"
        pytest -m integration -v
        ;;
    coverage)
        echo -e "${GREEN}Ejecutando pruebas con cobertura...${NC}"
        pytest --cov=. --cov-report=html --cov-report=term-missing
        echo -e "${GREEN}Reporte HTML generado en: htmlcov/index.html${NC}"
        ;;
    quick)
        echo -e "${GREEN}Ejecutando pruebas rápidas...${NC}"
        pytest -m "not slow" -v
        ;;
    lint)
        echo -e "${GREEN}Ejecutando verificaciones de calidad...${NC}"
        echo -e "${YELLOW}Flake8...${NC}"
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        echo -e "${YELLOW}Black...${NC}"
        black --check .
        echo -e "${YELLOW}Isort...${NC}"
        isort --check-only .
        echo -e "${GREEN}✓ Todas las verificaciones pasaron${NC}"
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}Opción no válida: $1${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "${GREEN}✓ Completado${NC}"