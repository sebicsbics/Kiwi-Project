#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be available
while ! nc -z $DB_HOST $DB_PORT; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - continuing..."

# Wait for Redis to be available
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done

echo "Redis is up - continuing..."

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist (optional - for development)
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@kiwi.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
END

echo "Starting application..."

# Execute the main container command
exec "$@"