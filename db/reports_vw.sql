
-- Vista 1: vw_course_performance
-- Descripción: Devuelve el rendimiento académico por curso y término, incluyendo promedios y porcentaje de reprobados.
-- Grain: Una fila por course_id, term y program
-- Métricas: total_estudiantes, promedio_final, porcentaje_reprobados
-- Filtros: WHERE term = '...' AND/OR program = '...'
-- Verificación:
--   SELECT * FROM vw_course_performance WHERE term = 'Fall2024' AND program = 'Computer Science';
--   SELECT course_id, term, promedio_final FROM vw_course_performance WHERE porcentaje_reprobados > 30;

CREATE OR REPLACE VIEW vw_course_performance AS
SELECT 
    g.course_id,
    g.term,
    s.program,
    COUNT(DISTINCT e.student_id) AS total_estudiantes,
    ROUND(AVG(gr.final),2) AS promedio_final,
    ROUND(
        (COUNT(CASE WHEN gr.final < 60 THEN 1 END) * 100.0 / COUNT(*)),
        2
    ) AS porcentaje_reprobados
FROM groups g
JOIN enrollments e ON g.id_group = e.group_id
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
JOIN students s ON e.student_id = s.id_student
GROUP BY g.course_id, g.term, s.program;

-- Vista 2: vw_teacher_load
-- Descripción: Muestra la carga docente por profesor y término (número de grupos, alumnos y promedio general).
-- Grain: Una fila por teacher_id y term
-- Métricas: total_grupos, total_alumnos, promedio_general
-- Campo calculado: ratio_alumnos_por_grupo
-- Verificación:
--   SELECT * FROM vw_teacher_load WHERE term = 'Spring2024' ORDER BY total_alumnos DESC;
--   SELECT teacher_name, promedio_general FROM vw_teacher_load HAVING total_alumnos > 100;

CREATE OR REPLACE VIEW vw_teacher_load AS
SELECT 
    t.id_teacher,
    t.teacher_name,
    g.term,
    COUNT(DISTINCT g.id_group) AS total_grupos,
    COUNT(DISTINCT e.student_id) AS total_alumnos,
    ROUND(AVG(gr.final),2) AS promedio_general,
    ROUND(
        COUNT(DISTINCT e.student_id) * 1.0 / COUNT(DISTINCT g.id_group),
        1
    ) AS ratio_alumnos_por_grupo
FROM teachers t
JOIN groups g ON t.id_teacher = g.teacher_id
JOIN enrollments e ON g.id_group = e.group_id
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
GROUP BY t.id_teacher, t.teacher_name, g.term
HAVING COUNT(DISTINCT e.student_id) > 0;

-- Vista 3: vw_students_at_risk
-- Descripción: Identifica estudiantes en riesgo académico (bajo promedio o baja asistencia).
-- Grain: Una fila por estudiante y término
-- Métricas: promedio_calificaciones, porcentaje_asistencia, riesgo
-- Campo calculado: nivel_riesgo (usando CASE)
-- Verificación:
--   SELECT * FROM vw_students_at_risk WHERE nivel_riesgo = 'ALTO' AND term = 'Fall2024';
--   SELECT student_name, email FROM vw_students_at_risk WHERE promedio_calificaciones < 70 LIMIT 10;

CREATE OR REPLACE VIEW vw_students_at_risk AS
WITH student_metrics AS (
    SELECT 
        s.id_student,
        s.student_name,
        s.email,
        g.term,
        ROUND(AVG(gr.final),2) AS promedio_calificaciones,
        ROUND(AVG(CASE WHEN a.present THEN 1 ELSE 0 END),2) * 100 AS porcentaje_asistencia
    FROM students s
    JOIN enrollments e ON s.id_student = e.student_id
    JOIN groups g ON e.group_id = g.id_group
    LEFT JOIN grades gr ON e.id_enrollment = gr.enrollment_id
    LEFT JOIN attendance a ON e.id_enrollment = a.enrollment_id
    GROUP BY s.id_student, s.student_name, s.email, g.term
)
SELECT 
    id_student,
    student_name,
    email,
    term,
    promedio_calificaciones,
    COALESCE(porcentaje_asistencia, 0) AS porcentaje_asistencia,
    CASE 
        WHEN promedio_calificaciones < 60 OR COALESCE(porcentaje_asistencia, 0) < 75 THEN 'ALTO'
        WHEN promedio_calificaciones BETWEEN 60 AND 70 OR COALESCE(porcentaje_asistencia, 0) < 85 THEN 'MEDIO'
        ELSE 'BAJO'
    END AS nivel_riesgo
FROM student_metrics;

-- Vista 4: vw_attendance_by_group
-- Descripción: Muestra la asistencia promedio por grupo en un término específico.
-- Grain: Una fila por group_id y término
-- Métricas: total_sesiones, asistencias, ausencias, porcentaje_asistencia
-- Campo calculado: estado_asistencia (usando CASE)
-- Verificación:
--   SELECT * FROM vw_attendance_by_group WHERE term = 'Fall2024' AND estado_asistencia = 'CRÍTICO';
--   SELECT course_id, porcentaje_asistencia FROM vw_attendance_by_group WHERE porcentaje_asistencia < 80;

CREATE OR REPLACE VIEW vw_attendance_by_group AS
SELECT 
    g.id_group,
    g.course_id,
    g.term,
    COUNT(a.id_attendance) AS total_sesiones,
    COUNT(CASE WHEN a.present = TRUE THEN 1 END) AS asistencias,
    COUNT(CASE WHEN a.present = FALSE THEN 1 END) AS ausencias,
    ROUND(
        COALESCE(
            AVG(CASE WHEN a.present = TRUE THEN 1.0 ELSE 0.0 END) * 100,
            0
        ),
        2
    ) AS porcentaje_asistencia,
    CASE 
        WHEN COALESCE(AVG(CASE WHEN a.present = TRUE THEN 1.0 ELSE 0.0 END), 0) < 0.7 THEN 'CRÍTICO'
        WHEN COALESCE(AVG(CASE WHEN a.present = TRUE THEN 1.0 ELSE 0.0 END), 0) < 0.8 THEN 'BAJO'
        WHEN COALESCE(AVG(CASE WHEN a.present = TRUE THEN 1.0 ELSE 0.0 END), 0) < 0.9 THEN 'ACEPTABLE'
        ELSE 'EXCELENTE'
    END AS estado_asistencia
FROM groups g
LEFT JOIN enrollments e ON g.id_group = e.group_id
LEFT JOIN attendance a ON e.id_enrollment = a.enrollment_id
GROUP BY g.id_group, g.course_id, g.term
HAVING COUNT(a.id_attendance) > 0;

-- Vista 5: vw_rank_students
-- Descripción: Ranking de estudiantes por programa y término basado en calificación final.
-- Grain: Una fila por estudiante, programa y término
-- Métricas: calificacion_final, ranking_programa, ranking_global
-- Campo calculado: percentil (usando función de ventana)
-- Verificación:
--   SELECT * FROM vw_rank_students WHERE program = 'Computer Science' AND term = 'Fall2024' AND ranking_programa <= 3;
--   SELECT student_name, program, ranking_programa FROM vw_rank_students WHERE ranking_programa = 1;

CREATE OR REPLACE VIEW vw_rank_students AS
WITH ranked_students AS (
    SELECT 
        s.id_student,
        s.student_name,
        s.program,
        g.term,
        gr.final AS calificacion_final,
        RANK() OVER (PARTITION BY s.program, g.term ORDER BY gr.final DESC) AS ranking_programa,
        ROW_NUMBER() OVER (ORDER BY gr.final DESC) AS ranking_global,
        PERCENT_RANK() OVER (PARTITION BY s.program, g.term ORDER BY gr.final DESC) AS percent_rank_raw
    FROM students s
    JOIN enrollments e ON s.id_student = e.student_id
    JOIN groups g ON e.group_id = g.id_group
    JOIN grades gr ON e.id_enrollment = gr.enrollment_id
    WHERE gr.final IS NOT NULL
)
SELECT 
    id_student,
    student_name,
    program,
    term,
    calificacion_final,
    ranking_programa,
    ranking_global,
    ROUND(CAST(percent_rank_raw * 100 AS numeric), 2) AS percentil
FROM ranked_students;