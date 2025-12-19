# 🚀 Quick Start - Testing

Guía rápida para empezar a usar las pruebas automatizadas del backend de Kiwi.

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### 2. Ejecutar Todas las Pruebas

**Linux/Mac:**
```bash
chmod +x run_tests.sh
./run_tests.sh
```

**Windows:**
```cmd
run_tests.bat
```

**O directamente con pytest:**
```bash
pytest
```

### 3. Ver Resultados

✅ Las pruebas pasarán si todo está correcto
❌ Si alguna falla, verás el detalle del error

## 📊 Comandos Más Usados

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas de login
./run_tests.sh login

# Solo pruebas de seguridad
./run_tests.sh security

# Pruebas rápidas (sin las lentas)
./run_tests.sh quick
```

### Ver Cobertura de Código

```bash
./run_tests.sh coverage
```

Luego abre `htmlcov/index.html` en tu navegador para ver el reporte visual.

### Verificar Calidad de Código

```bash
./run_tests.sh lint
```

## 🎯 Casos de Uso Comunes

### Antes de Hacer un Commit

```bash
# 1. Ejecutar pruebas
pytest

# 2. Verificar cobertura
pytest --cov=. --cov-report=term-missing

# 3. Verificar calidad de código
./run_tests.sh lint
```

### Desarrollando Nueva Funcionalidad

```bash
# Ejecutar solo tus nuevas pruebas
pytest userAPI/tests/test_nueva_funcionalidad.py -v

# Ejecutar en modo watch (con pytest-watch)
ptw -- -v
```

### Debugging de Prueba Fallida

```bash
# Ejecutar con más detalle
pytest -vv

# Detener en primer fallo
pytest -x

# Ejecutar última prueba fallida
pytest --lf

# Modo debug interactivo
pytest --pdb
```

## 📝 Estructura de una Prueba

```python
import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
class TestMiFuncionalidad:
    def test_caso_exitoso(self, api_client):
        # Arrange (Preparar)
        url = reverse('mi-endpoint')
        data = {'campo': 'valor'}
        
        # Act (Actuar)
        response = api_client.post(url, data)
        
        # Assert (Verificar)
        assert response.status_code == status.HTTP_200_OK
        assert 'resultado' in response.data
```

## 🔍 Fixtures Disponibles

```python
# Cliente API sin autenticación
def test_publico(api_client):
    response = api_client.get('/api/public/')

# Cliente API autenticado
def test_privado(authenticated_client):
    response = authenticated_client.get('/api/private/')

# Crear usuario de prueba
def test_con_usuario(create_user):
    user = create_user(email='test@example.com')
    assert user.email == 'test@example.com'
```

## 🎨 Markers Disponibles

```python
@pytest.mark.unit          # Prueba unitaria
@pytest.mark.integration   # Prueba de integración
@pytest.mark.security      # Prueba de seguridad
@pytest.mark.slow          # Prueba lenta
```

Ejecutar por marker:
```bash
pytest -m security  # Solo pruebas de seguridad
pytest -m "not slow"  # Todas excepto las lentas
```

## 🐛 Solución de Problemas

### Error: "No module named pytest"

```bash
pip install -r requirements-test.txt
```

### Error: "django.core.exceptions.ImproperlyConfigured"

```bash
# Asegúrate de tener el archivo .env configurado
cp .env.example .env
# Edita .env con tus configuraciones
```

### Las pruebas pasan localmente pero fallan en CI/CD

1. Verifica que las variables de entorno estén configuradas en GitHub
2. Revisa los logs de GitHub Actions
3. Asegúrate de que las dependencias estén actualizadas

## 📚 Recursos

- [Documentación Completa](./TESTING.md)
- [pytest Docs](https://docs.pytest.org/)
- [pytest-django Docs](https://pytest-django.readthedocs.io/)

## 💡 Tips

1. **Escribe pruebas primero** (TDD) - Te ayuda a pensar mejor el diseño
2. **Mantén las pruebas simples** - Una prueba, un concepto
3. **Usa nombres descriptivos** - `test_login_fails_with_wrong_password` es mejor que `test_login_2`
4. **No testees el framework** - Testea TU lógica, no Django
5. **Ejecuta pruebas frecuentemente** - Detecta problemas temprano

## ✅ Checklist Antes de PR

- [ ] Todas las pruebas pasan localmente
- [ ] Cobertura ≥ 80%
- [ ] Código formateado (black, isort)
- [ ] Sin errores de linting (flake8)
- [ ] Pruebas de seguridad incluidas (si aplica)
- [ ] Documentación actualizada