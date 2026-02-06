#!/bin/bash
# ============================================
# INIT.SH - Script único de inicialización
# Controla el orden de ejecución de los archivos SQL
# ============================================

set -e

echo "Iniciando configuración de base de datos..."

SQL_FILES=(
    "schema.sql"
    "seed.sql"
    "indexes.sql"
    "migrate.sql"
    "reports_vw.sql"
    "verify.sql"
    "roles.sql"
)

for file in "${SQL_FILES[@]}"; do
    filepath="/sql-scripts/$file"
    
    if [ -f "$filepath" ]; then
        echo "Ejecutando: $file"
        
        if [ "$file" = "roles.sql" ]; then
            
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
