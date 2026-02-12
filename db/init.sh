#!/bin/bash
set -e

echo "Iniciando configuracion de base de datos..."

SCRIPT_DIR="/sql"

SQL_FILES=(
    "01_schema.sql"
    "02_seed.sql"
    "03_reports_vw.sql"
    "04_roles.sql"
    "05_indexes.sql"
)

for file in "${SQL_FILES[@]}"; do
    filepath="$SCRIPT_DIR/$file"
    
    if [ -f "$filepath" ]; then
        echo "Ejecutando: $file"
        
        if [ "$file" = "04_roles.sql" ]; then
            envsubst < "$filepath" | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"
        else
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$filepath"
        fi
        
        echo "Completado: $file"
    else
        echo "Archivo no encontrado (omitido): $file"
    fi
done

echo "Base de datos configurada exitosamente"