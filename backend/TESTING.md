# Testing Documentation - Kiwi Backend

## 📋 Descripción General

Este documento describe la suite de pruebas automatizadas implementadas para la funcionalidad de login de la plataforma Kiwi. Las pruebas garantizan la seguridad, robustez y confiabilidad del sistema de autenticación.

## 🧪 Tipos de Pruebas Implementadas

### 1. Pruebas de Login Exitoso
- ✅ Login con credenciales válidas
- ✅ Retorno de datos de usuario completos
- ✅ Generación de tokens JWT válidos

### 2. Pruebas de Login Fallido
- ✅ Login con contraseña incorrecta
- ✅ Login con email no registrado
- ✅ Login con contraseña vacía
- ✅ Login con email vacío
- ✅ Login con formato de email inválido
- ✅ Login con campos faltantes

### 3. Pruebas de Seguridad
- ✅ Protección contra SQL Injection en campo email
- ✅ Protección contra SQL Injection en campo password
- ✅ Protección contra ataques XSS
- ✅ Verificación de que las contraseñas no se exponen en respuestas
- ✅ Verificación de sensibilidad a mayúsculas en contraseñas
- ✅ Verificación de insensibilidad a mayúsculas en emails

### 4. Pruebas de Casos Extremos
- ✅ Login con espacios en blanco en email
- ✅ Login con email extremadamente largo
- ✅ Login con caracteres especiales en contraseña
- ✅ Múltiples intentos de login concurrentes

### 5. Pruebas de Rendimiento
- ✅ Múltiples intentos fallidos de login (detección de fuerza bruta)

## 🚀 Configuración e Instalación

### Requisitos Previos
- Python 3.11+
- PostgreSQL 15 (para tests de integración)
- Redis 7 (para tests de integración)

### Instalación de Dependencias

```bash
cd backend

# Instalar dependencias principales
pip install -r requirements.txt

# Instalar dependencias de testing
pip install -r requirements-test.txt
```

### Dependencias de Testing
- `pytest` - Framework de testing
- `pytest-django` - Plugin de pytest para Django
- `pytest-cov` - Generación de reportes de cobertura
- `pytest-mock` - Mocking y stubbing
- `factory-boy` - Generación de datos de prueba
- `faker` - Generación de datos falsos

## 📝 Ejecutar las Pruebas

### Ejecutar Todas las Pruebas

```bash
cd backend
pytest
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas de login
pytest userAPI/tests/test_login.py

# Solo pruebas de seguridad
pytest -m security

# Solo pruebas unitarias
pytest -m unit

# Solo pruebas de integración
pytest -m integration
```

### Ejecutar con Cobertura

```bash
# Generar reporte de cobertura
pytest --cov=. --cov-report=html --cov-report=term-missing

# Ver reporte HTML
# Abrir backend/htmlcov/index.html en el navegador
```

### Ejecutar Pruebas Específicas

```bash
# Ejecutar una prueba específica
pytest userAPI/tests/test_login.py::TestLoginSuccess::test_login_with_valid_credentials

# Ejecutar una clase de pruebas
pytest userAPI/tests/test_login.py::TestLoginSecurity
```

## 📊 Reportes de Cobertura

La configuración actual genera tres tipos de reportes:

1. **Terminal** - Muestra cobertura en la consola
2. **HTML** - Reporte interactivo en `htmlcov/index.html`
3. **XML** - Para integración con herramientas CI/CD

### Umbral de Cobertura

El proyecto requiere un mínimo de **80% de cobertura** para pasar el CI/CD.

## 🔄 Integración Continua (CI/CD)

### GitHub Actions

El proyecto utiliza GitHub Actions para ejecutar pruebas automáticamente:

**Triggers:**
- Push a ramas `develop` o `main`
- Pull requests hacia `develop` o `main`
- Cambios en archivos del backend

**Jobs Ejecutados:**
1. **test** - Ejecuta suite completa de pruebas
   - Matrix: Python 3.11 y 3.12
   - Servicios: PostgreSQL 15, Redis 7
   - Genera reportes de cobertura
   
2. **security-scan** - Escaneo de seguridad
   - Safety: Verifica vulnerabilidades en dependencias
   - Bandit: Análisis estático de seguridad
   
3. **lint** - Verificación de calidad de código
   - Flake8: Linting
   - Black: Formato de código
   - Isort: Ordenamiento de imports

### Ver Resultados de CI/CD

Los resultados están disponibles en:
- GitHub Actions tab del repositorio
- Pull Request checks
- Badges en el README

## 🛡️ Casos de Prueba de Seguridad

### SQL Injection

Las pruebas verifican protección contra múltiples vectores de ataque:

```python
# Ejemplos de intentos de inyección probados
"admin@example.com' OR '1'='1"
"admin@example.com'; DROP TABLE users; --"
"admin@example.com' UNION SELECT * FROM users --"
"' OR 1=1 --"
```

### XSS (Cross-Site Scripting)

```python
# Ejemplos de intentos XSS probados
"<script>alert('XSS')</script>@example.com"
"test@example.com<script>alert('XSS')</script>"
"javascript:alert('XSS')@example.com"
```

## 📈 Métricas de Calidad

### Cobertura de Código
- **Objetivo:** ≥ 80%
- **Actual:** Se calcula en cada ejecución

### Tipos de Pruebas
- Unitarias: ~60%
- Integración: ~30%
- Seguridad: ~10%

## 🐛 Debugging de Pruebas

### Modo Verbose

```bash
pytest -v
```

### Ver Output de Print

```bash
pytest -s
```

### Detener en Primer Fallo

```bash
pytest -x
```

### Ejecutar Última Prueba Fallida

```bash
pytest --lf
```

### Modo Debug con PDB

```bash
pytest --pdb
```

## 📝 Escribir Nuevas Pruebas

### Estructura de Prueba

```python
import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
class TestNewFeature:
    """
    Descripción de la funcionalidad a probar
    """
    
    def test_specific_behavior(self, api_client, create_user):
        """
        Descripción específica de lo que se prueba
        """
        # Arrange - Preparar datos
        user = create_user(email='test@example.com')
        
        # Act - Ejecutar acción
        response = api_client.post(url, data)
        
        # Assert - Verificar resultado
        assert response.status_code == status.HTTP_200_OK
```

### Fixtures Disponibles

- `api_client` - Cliente DRF para hacer requests
- `create_user` - Factory para crear usuarios de prueba
- `authenticated_client` - Cliente con autenticación JWT
- `valid_user_data` - Datos válidos para registro
- `valid_login_data` - Datos válidos para login

## 🔧 Configuración de pytest

El archivo `pytest.ini` contiene la configuración:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
addopts = --verbose --cov=. --cov-report=term-missing
```

## 📚 Recursos Adicionales

- [Documentación de pytest](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [Django REST Framework Testing](https://www.django-rest-framework.org/api-guide/testing/)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🤝 Contribuir

Al agregar nuevas funcionalidades:

1. Escribir pruebas ANTES de implementar (TDD)
2. Mantener cobertura ≥ 80%
3. Incluir pruebas de seguridad cuando sea relevante
4. Documentar casos de prueba complejos
5. Verificar que pasen todos los tests localmente antes de push

## 📞 Soporte

Para preguntas sobre las pruebas, contactar al equipo de desarrollo.