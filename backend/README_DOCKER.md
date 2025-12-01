# 🐳 Kiwi Backend - Guía de Docker

Esta guía te ayudará a levantar el entorno de desarrollo completo usando Docker y Docker Compose.

## 📋 Prerequisitos

- Docker Desktop instalado (incluye Docker Compose)
- Git

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` basándote en `.env.example`:

```powershell
cd backend
Copy-Item .env.example .env
```

Edita el archivo `.env` y ajusta las variables según tus necesidades (puedes dejar los valores por defecto para desarrollo).

### 2. Construir y Levantar los Contenedores

```powershell
# Construir las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d
```

Los servicios estarán disponibles en:
- **Django API**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 3. Verificar que Todo Funciona

```powershell
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del servicio web
docker-compose logs -f web

# Verificar estado de los contenedores
docker-compose ps
```

### 4. Acceder al Admin de Django

El script `entrypoint.sh` crea automáticamente un superusuario:
- **URL**: http://localhost:8000/admin
- **Usuario**: admin
- **Contraseña**: admin123

⚠️ **Importante**: Cambia estas credenciales en producción.

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```powershell
# Detener todos los servicios
docker-compose stop

# Detener y eliminar contenedores (mantiene volúmenes)
docker-compose down

# Detener y eliminar TODO (incluye volúmenes de BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart web
```

### Ejecutar Comandos Django

```powershell
# Crear migraciones
docker-compose exec web python manage.py makemigrations

# Aplicar migraciones
docker-compose exec web python manage.py migrate

# Crear superusuario manualmente
docker-compose exec web python manage.py createsuperuser

# Abrir shell de Django
docker-compose exec web python manage.py shell

# Ejecutar tests
docker-compose exec web python manage.py test
```

### Gestión de Base de Datos

```powershell
# Acceder a PostgreSQL
docker-compose exec db psql -U kiwi_user -d kiwi_db

# Backup de la base de datos
docker-compose exec db pg_dump -U kiwi_user kiwi_db > backup.sql

# Restaurar backup
Get-Content backup.sql | docker-compose exec -T db psql -U kiwi_user -d kiwi_db
```

### Celery

```powershell
# Ver logs del worker
docker-compose logs -f worker

# Ver logs del beat scheduler
docker-compose logs -f beat

# Reiniciar worker (útil después de cambios en tasks)
docker-compose restart worker
```

### Redis

```powershell
# Acceder a Redis CLI
docker-compose exec redis redis-cli

# Ver todas las keys
docker-compose exec redis redis-cli KEYS '*'

# Limpiar cache
docker-compose exec redis redis-cli FLUSHALL
```

## 📦 Estructura de Servicios

### `db` (PostgreSQL)
- Base de datos principal
- Datos persistentes en volumen `postgres_data`
- Puerto: 5432

### `redis` (Redis)
- Cache y message broker para Celery
- Puerto: 6379

### `web` (Django)
- Aplicación principal Django
- Servidor: Gunicorn con 3 workers
- Puerto: 8000

### `worker` (Celery Worker)
- Procesa tareas asíncronas
- Se conecta a Redis como broker

### `beat` (Celery Beat)
- Scheduler para tareas periódicas
- Opcional, puedes comentarlo si no lo necesitas

## 🔧 Desarrollo

### Hot Reload

El código está montado como volumen, por lo que los cambios se reflejan automáticamente:
- **Django**: Gunicorn está configurado con `--reload`
- **Celery**: Necesitas reiniciar el worker: `docker-compose restart worker`

### Instalar Nuevas Dependencias

1. Agrega el paquete a `requirements.txt`
2. Reconstruye la imagen:
```powershell
docker-compose build web
docker-compose up -d web
```

### Crear una Nueva App Django

```powershell
docker-compose exec web python manage.py startapp nombre_app
```

## 🐛 Troubleshooting

### Los contenedores no inician

```powershell
# Ver logs detallados
docker-compose logs

# Verificar que los puertos no estén ocupados
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

### Error de conexión a la base de datos

- Verifica que el servicio `db` esté saludable: `docker-compose ps`
- Revisa las variables de entorno en `.env`
- Espera unos segundos, el `entrypoint.sh` espera a que PostgreSQL esté listo

### Celery no procesa tareas

```powershell
# Verifica que Redis esté corriendo
docker-compose exec redis redis-cli ping

# Reinicia el worker
docker-compose restart worker

# Revisa logs del worker
docker-compose logs -f worker
```

### Limpiar y Empezar de Cero

```powershell
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Siguientes Pasos

1. **Crear Apps Django**: Organiza tu código en apps modulares
2. **Configurar Celery Tasks**: Define tareas asíncronas en `tasks.py`
3. **Implementar APIs**: Usa Django REST Framework
4. **Tests**: Escribe tests y ejecútalos con `docker-compose exec web python manage.py test`

## 🔒 Seguridad en Producción

Antes de desplegar a producción:

1. ✅ Cambia `SECRET_KEY` a un valor aleatorio y seguro
2. ✅ Establece `DEBUG=False`
3. ✅ Configura `ALLOWED_HOSTS` correctamente
4. ✅ Usa contraseñas fuertes para PostgreSQL
5. ✅ Configura HTTPS/SSL
6. ✅ Implementa rate limiting
7. ✅ Revisa configuración de CORS

## 📞 Soporte

Si encuentras problemas, revisa:
- Logs: `docker-compose logs -f`
- Documentación de Django: https://docs.djangoproject.com/
- Documentación de Celery: https://docs.celeryq.dev/