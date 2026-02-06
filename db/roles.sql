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


GRANT SELECT ON vw_course_performance TO ${APP_DB_USER};
GRANT SELECT ON vw_teacher_load TO ${APP_DB_USER};
GRANT SELECT ON vw_students_at_risk TO ${APP_DB_USER};
GRANT SELECT ON vw_attendance_by_group TO ${APP_DB_USER};
GRANT SELECT ON vw_rank_students TO ${APP_DB_USER};
