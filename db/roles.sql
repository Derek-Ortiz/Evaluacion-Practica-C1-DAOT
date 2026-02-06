-- ============================================
-- ROLES.SQL - Crear usuario con permisos limitados
-- Las variables se sustituyen via envsubst en init.sh
-- ============================================


DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${APP_DB_USER}') THEN
        CREATE USER ${APP_DB_USER} WITH PASSWORD '${APP_DB_PASSWORD}';
    END IF;
END
$$;


ALTER USER ${APP_DB_USER} NOCREATEDB NOCREATEROLE NOSUPERUSER;


GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${APP_DB_USER};


GRANT USAGE ON SCHEMA public TO ${APP_DB_USER};


GRANT SELECT ON vista_cat_promedio TO ${APP_DB_USER};
GRANT SELECT ON vista_ranking_usuarios_gastos TO ${APP_DB_USER};
GRANT SELECT ON vista_ordenes_por_status TO ${APP_DB_USER};
GRANT SELECT ON vista_productos_mas_vendidos TO ${APP_DB_USER};
GRANT SELECT ON vista_analisis_desempeño_usuarios TO ${APP_DB_USER};
