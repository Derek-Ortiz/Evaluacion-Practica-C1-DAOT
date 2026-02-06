-- ============================================
-- VERIFY.SQL - Queries de Verificación
-- Esquema Académico
-- ============================================

\echo '============================================'
\echo 'VERIFICACIÓN DE BASE DE DATOS ACADÉMICA'
\echo '============================================'

-- ============================================
-- 1. CONTEOS POR TABLA
-- ============================================

\echo ''
\echo '--- CONTEOS POR TABLA ---'

SELECT 'students' AS tabla, COUNT(*) AS registros FROM students
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
ORDER BY tabla;

-- ============================================
-- 2. JOINs DE VERIFICACIÓN
-- ============================================

\echo ''
\echo '--- JOIN 1: Estudiantes con sus inscripciones ---'

SELECT 
    s.student_name AS estudiante,
    s.program AS programa,
    c.course_name AS curso,
    t.teacher_name AS profesor,
    g.term AS periodo
FROM students s
JOIN enrollments e ON s.id_student = e.student_id
JOIN groups g ON e.group_id = g.id_group
JOIN courses c ON g.course_id = c.id_course
JOIN teachers t ON g.teacher_id = t.id_teacher
ORDER BY s.student_name
LIMIT 10;

\echo ''
\echo '--- JOIN 2: Calificaciones por estudiante ---'

SELECT 
    s.student_name AS estudiante,
    c.code AS codigo_curso,
    c.course_name AS curso,
    gr.partial1,
    gr.partial2,
    gr.final
FROM students s
JOIN enrollments e ON s.id_student = e.student_id
JOIN groups g ON e.group_id = g.id_group
JOIN courses c ON g.course_id = c.id_course
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
ORDER BY s.student_name
LIMIT 10;

-- ============================================
-- 3. AGREGACIONES (GROUP BY)
-- ============================================

\echo ''
\echo '--- Estudiantes por programa ---'

SELECT 
    program AS programa,
    COUNT(*) AS total_estudiantes
FROM students
GROUP BY program
ORDER BY total_estudiantes DESC;

\echo ''
\echo '--- Carga docente (grupos por profesor) ---'

SELECT 
    t.teacher_name AS profesor,
    COUNT(g.id_group) AS total_grupos,
    COUNT(DISTINCT e.student_id) AS total_alumnos
FROM teachers t
LEFT JOIN groups g ON t.id_teacher = g.teacher_id
LEFT JOIN enrollments e ON g.id_group = e.group_id
GROUP BY t.id_teacher, t.teacher_name
ORDER BY total_grupos DESC
LIMIT 10;

\echo ''
\echo '--- Promedio de calificaciones por curso ---'

SELECT 
    c.code AS codigo,
    c.course_name AS curso,
    ROUND(AVG(gr.final)::numeric, 2) AS promedio_final,
    COUNT(gr.id_grade) AS total_calificaciones
FROM courses c
JOIN groups g ON c.id_course = g.course_id
JOIN enrollments e ON g.id_group = e.group_id
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
GROUP BY c.id_course, c.code, c.course_name
ORDER BY promedio_final DESC
LIMIT 10;

\echo ''
\echo '--- Asistencia por periodo ---'

SELECT 
    g.term AS periodo,
    COUNT(a.id_attendance) AS total_registros,
    SUM(CASE WHEN a.present THEN 1 ELSE 0 END) AS asistencias,
    SUM(CASE WHEN NOT a.present THEN 1 ELSE 0 END) AS ausencias,
    ROUND(AVG(CASE WHEN a.present THEN 1.0 ELSE 0.0 END) * 100, 2) AS porcentaje_asistencia
FROM groups g
JOIN enrollments e ON g.id_group = e.group_id
JOIN attendance a ON e.id_enrollment = a.enrollment_id
GROUP BY g.term
ORDER BY g.term;

-- ============================================
-- 4. VERIFICACIÓN DE INTEGRIDAD
-- ============================================

\echo ''
\echo '--- Verificación de FKs (debe estar vacío si todo OK) ---'

SELECT 'groups_sin_curso' AS problema, COUNT(*) AS cantidad
FROM groups g
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id_course = g.course_id);

SELECT 'groups_sin_profesor' AS problema, COUNT(*) AS cantidad
FROM groups g
WHERE NOT EXISTS (SELECT 1 FROM teachers t WHERE t.id_teacher = g.teacher_id);

SELECT 'enrollments_sin_estudiante' AS problema, COUNT(*) AS cantidad
FROM enrollments e
WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id_student = e.student_id);

SELECT 'grades_sin_enrollment' AS problema, COUNT(*) AS cantidad
FROM grades gr
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.id_enrollment = gr.enrollment_id);

\echo ''
\echo '--- Verificación de datos ---'

SELECT 'calificaciones_fuera_rango' AS caso, COUNT(*) AS cantidad
FROM grades WHERE final < 0 OR final > 10;

SELECT 'estudiantes_sin_inscripciones' AS caso, COUNT(*) AS cantidad
FROM students s
WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id_student);

-- ============================================
-- 5. MUESTRA DE DATOS
-- ============================================

\echo ''
\echo '--- Muestra de estudiantes ---'
SELECT id_student, student_name, email, program FROM students LIMIT 5;

\echo ''
\echo '--- Muestra de profesores ---'
SELECT id_teacher, teacher_name, email FROM teachers LIMIT 5;

\echo ''
\echo '--- Muestra de cursos ---'
SELECT id_course, code, course_name, credits FROM courses LIMIT 5;

\echo ''
\echo '============================================'
\echo 'FIN DE VERIFICACIÓN'
\echo '============================================'
