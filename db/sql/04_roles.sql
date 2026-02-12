-- ============================================
-- ROLES.SQL - Crear usuario con permisos limitados
-- ============================================


DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'evac1') THEN
        CREATE USER evac1 WITH PASSWORD '3v4c1';
    END IF;
END
$$;

ALTER USER evac1 NOCREATEDB NOCREATEROLE NOSUPERUSER;


GRANT CONNECT ON DATABASE evac1_db TO evac1;


GRANT USAGE ON SCHEMA public TO evac1;


GRANT SELECT ON vw_course_performance TO evac1;
GRANT SELECT ON vw_teacher_load TO evac1;
GRANT SELECT ON vw_students_at_risk TO evac1;
GRANT SELECT ON vw_attendance_by_group TO evac1;
GRANT SELECT ON vw_rank_students TO evac1;
