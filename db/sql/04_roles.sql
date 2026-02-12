-- ============================================
-- ROLES.SQL - Crear usuario con permisos limitados
-- ============================================


SELECT format('CREATE USER %I WITH PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = :'app_user'
)
\gexec

ALTER USER :"app_user" NOCREATEDB NOCREATEROLE NOSUPERUSER;


GRANT CONNECT ON DATABASE :"app_db" TO :"app_user";


GRANT USAGE ON SCHEMA public TO :"app_user";


GRANT SELECT ON vw_course_performance TO :"app_user";
GRANT SELECT ON vw_teacher_load TO :"app_user";
GRANT SELECT ON vw_students_at_risk TO :"app_user";
GRANT SELECT ON vw_attendance_by_group TO :"app_user";
GRANT SELECT ON vw_rank_students TO :"app_user";
