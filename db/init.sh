#!/bin/sh
set -e

echo "Iniciando configuracion de base de datos..."

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "Error: POSTGRES_USER, POSTGRES_PASSWORD y POSTGRES_DB son requeridos."
    exit 1
fi

if [ -z "$APP_DB_USER" ] || [ -z "$APP_DB_PASSWORD" ]; then
    echo "Error: APP_DB_USER y APP_DB_PASSWORD son requeridos."
    exit 1
fi

SCRIPT_DIR="/sql"
SQL_FILES="01_schema.sql 02_seed.sql 03_reports_vw.sql 04_roles.sql 05_indexes.sql"

for file in $SQL_FILES; do
    filepath="$SCRIPT_DIR/$file"

    if [ -f "$filepath" ]; then
        echo "Ejecutando: $file"
        if [ "$file" = "04_roles.sql" ]; then
            psql -v ON_ERROR_STOP=1 \
                -v app_user="$APP_DB_USER" \
                -v app_password="$APP_DB_PASSWORD" \
                -v app_db="$POSTGRES_DB" \
                --username "$POSTGRES_USER" \
                --dbname "$POSTGRES_DB" \
                -f "$filepath"
        else
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$filepath"
        fi
        echo "Completado: $file"
    else
        echo "Archivo no encontrado (omitido): $file"
    fi
done

echo "Base de datos configurada exitosamente"