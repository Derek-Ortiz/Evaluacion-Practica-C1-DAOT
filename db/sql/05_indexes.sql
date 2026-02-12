-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================================
-- Este archivo contiene los índices necesarios para optimizar las consultas
-- de los reportes definidos en las vistas del sistema de gestión académica.
-- ============================================================================

-- ============================================================================
-- ÍNDICE 1: idx_enrollments_student_id
-- ============================================================================
-- JUSTIFICACIÓN:
-- Las vistas vw_students_at_risk y vw_rank_students realizan JOINs frecuentes
-- entre students y enrollments usando student_id. Este índice acelera
-- significativamente estas operaciones de JOIN.
-- 
-- CONSULTA BENEFICIADA:
-- SELECT s.student_name, COUNT(e.id_enrollment)
-- FROM students s JOIN enrollments e ON s.id_student = e.student_id
-- GROUP BY s.id_student
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);

-- ============================================================================
-- ÍNDICE 2: idx_enrollments_group_id
-- ============================================================================
-- JUSTIFICACIÓN:
-- Las vistas vw_course_performance, vw_teacher_load y vw_attendance_by_group
-- realizan JOINs frecuentes entre groups y enrollments usando group_id.
-- Este índice optimiza estas operaciones de JOIN y las agregaciones por grupo.
--
-- CONSULTAS BENEFICIADAS:
-- - Rendimiento por curso
-- - Carga docente
-- - Asistencia por grupo
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_group_id ON enrollments(group_id);

-- ============================================================================
-- ÍNDICE 3: idx_grades_enrollment_id
-- ============================================================================
-- JUSTIFICACIÓN:
-- Las vistas vw_course_performance, vw_students_at_risk y vw_rank_students
-- requieren JOINs con la tabla grades para obtener calificaciones.
-- Este índice acelera la búsqueda de calificaciones por inscripción.
--
-- CONSULTA BENEFICIADA:
-- SELECT e.student_id, AVG(g.final) FROM enrollments e
-- JOIN grades g ON e.id_enrollment = g.enrollment_id GROUP BY e.student_id
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_grades_enrollment_id ON grades(enrollment_id);

-- ============================================================================
-- ÍNDICE 4: idx_attendance_enrollment_id
-- ============================================================================
-- JUSTIFICACIÓN:
-- La vista vw_students_at_risk y vw_attendance_by_group calculan métricas
-- de asistencia por inscripción. Este índice optimiza estos cálculos.
--
-- CONSULTA BENEFICIADA:
-- SELECT e.id_enrollment, AVG(CASE WHEN a.present THEN 1 ELSE 0 END)
-- FROM enrollments e JOIN attendance a ON e.id_enrollment = a.enrollment_id
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_id ON attendance(enrollment_id);

-- ============================================================================
-- ÍNDICE 5: idx_groups_teacher_id
-- ============================================================================
-- JUSTIFICACIÓN:
-- La vista vw_teacher_load realiza JOINs entre teachers y groups.
-- Este índice permite localizar rápidamente los grupos de un profesor.
--
-- CONSULTA BENEFICIADA:
-- SELECT t.teacher_name, COUNT(g.id_group) FROM teachers t
-- JOIN groups g ON t.id_teacher = g.teacher_id GROUP BY t.id_teacher
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);

-- ============================================================================
-- ÍNDICE 6: idx_groups_term (Índice para filtros por término)
-- ============================================================================
-- JUSTIFICACIÓN:
-- La mayoría de las vistas permiten filtrar por término académico.
-- Este índice optimiza las consultas que filtran grupos por período.
--
-- CONSULTA BENEFICIADA:
-- SELECT * FROM vw_course_performance WHERE term = 'enero-abril'
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_groups_term ON groups(term);

-- ============================================================================
-- ÍNDICE 7: idx_students_program (Índice para filtros por programa)
-- ============================================================================
-- JUSTIFICACIÓN:
-- Las vistas vw_course_performance y vw_rank_students agrupan o filtran
-- por programa académico. Este índice acelera estas operaciones.
--
-- CONSULTA BENEFICIADA:
-- SELECT program, COUNT(*) FROM students GROUP BY program
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_program ON students(program);

-- ============================================================================
-- VERIFICACIÓN DE ÍNDICES CON EXPLAIN ANALYZE
-- ============================================================================
-- Las siguientes consultas demuestran el uso de los índices creados.
-- Ejecutar manualmente para ver los planes de ejecución.
-- ============================================================================

-- Consulta 1: Rendimiento académico por curso (usa idx_enrollments_group_id, idx_grades_enrollment_id)
EXPLAIN ANALYZE
SELECT 
    g.course_id,
    g.term,
    s.program,
    COUNT(DISTINCT e.student_id) AS total_estudiantes,
    ROUND(AVG(gr.final), 2) AS promedio_final
FROM groups g
JOIN enrollments e ON g.id_group = e.group_id
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
JOIN students s ON e.student_id = s.id_student
GROUP BY g.course_id, g.term, s.program;

-- Consulta 2: Estudiantes en riesgo (usa idx_enrollments_student_id, idx_grades_enrollment_id, idx_attendance_enrollment_id)
EXPLAIN ANALYZE
SELECT 
    s.id_student,
    s.student_name,
    g.term,
    ROUND(AVG(gr.final), 2) AS promedio_calificaciones,
    ROUND(AVG(CASE WHEN a.present THEN 1 ELSE 0 END) * 100, 2) AS porcentaje_asistencia
FROM students s
JOIN enrollments e ON s.id_student = e.student_id
JOIN groups g ON e.group_id = g.id_group
LEFT JOIN grades gr ON e.id_enrollment = gr.enrollment_id
LEFT JOIN attendance a ON e.id_enrollment = a.enrollment_id
GROUP BY s.id_student, s.student_name, g.term;
