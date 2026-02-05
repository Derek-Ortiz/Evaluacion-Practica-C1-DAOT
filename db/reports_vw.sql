/*
View numero : 1
-- Que devuelve: 
-- Grain: 
-- Metricas:
-- Por qué usa GROUP BY/HAVING: 
*/
-- Vista 1: vw_course_performance
-- Descripción: Devuelve el rendimiento académico por curso y término, incluyendo promedios y porcentaje de reprobados.
-- Grain: Una fila por course_id, term y program
-- Métricas: total_estudiantes, promedio_final, porcentaje_reprobados
-- Filtros: WHERE term = '...' AND/OR program = '...'

CREATE OR REPLACE VIEW vw_course_performance AS
SELECT 
    c.course_name,
    c.code AS course_code,
    g.term,
    s.program,
    COUNT(DISTINCT e.student_id) AS total_estudiantes,
    AVG(gr.final) AS promedio_final,
    ROUND(
        (COUNT(CASE WHEN gr.final < 60 THEN 1 END) * 100.0 / COUNT(*)),
        2
    ) AS porcentaje_reprobados
FROM courses c
JOIN groups g ON c.id_course = g.course_id
JOIN enrollments e ON g.id_group = e.group_id
JOIN grades gr ON e.id_enrollment = gr.enrollment_id
JOIN students s ON e.student_id = s.id_student
GROUP BY c.id_course, c.course_name, c.code, g.term, s.program;

-- CREATE VIEW vw_course_performance AS
-- WITH promedio_alumno AS(
--     SELECT e.student_id,
--     e.id_enrollment
--     AVG(partial1, partial2, final) OVER (e.id_enrollment = g.enrollment_id )
-- )


/*
View numero : 2
-- Que devuelve: 
-- Grain: 
-- Metricas: 
-- Por qué usa GROUP BY/HAVING: 
*/

CREATE VIEW vw_teacher_load AS

/*
View numero : 3
-- Que devuelve: 
-- Grain: 
-- Metricas: 
-- Por qué usa GROUP BY/HAVING: 
*/

CREATE VIEW vw_students_at_risk AS

/*
View numero : 
-- Que devuelve: 
-- Grain: 
-- Metricas: 
-- Por qué usa GROUP BY/HAVING:
*/

CREATE VIEW vw_attendance_by_group AS

/*
View numero : 5
-- Que devuelve: 
-- Grain: 
-- Metricas:
-- Por qué usa GROUP BY/HAVING:
*/
CREATE VIEW vw_rank_students AS

CREATE VIEW vista_analisis_desempeno_usuarios AS
SELECT 
    u.nombre,
    COUNT(CASE WHEN o.status = 'entregado' THEN 1 END) AS ordenes_entregadas,
    COUNT(CASE WHEN o.status = 'cancelado' THEN 1 END) AS ordenes_canceladas,
    COALESCE(SUM(o.total), 0) AS monto_total,
    SUM(SUM(o.total)) OVER (ORDER BY u.id) AS monto_acumulado,
    CASE 
        WHEN COUNT(CASE WHEN o.status = 'entregado' THEN 1 END) > 0 THEN 'Cliente Activo'
        ELSE 'Cliente Inactivo'
    END AS clasificacion
FROM usuarios u
LEFT JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre
HAVING COUNT(CASE WHEN o.status IN ('entregado', 'pagado', 'enviado') THEN 1 END) > 0
ORDER BY monto_total DESC;

-- VERIFY 1: Ver análisis de desempeño de usuarios
SELECT * FROM vista_analisis_desempeno_usuarios;

-- VERIFY 2: Confirmar que Ada tiene 1 orden entregada
SELECT nombre, ordenes_entregadas, monto_total, clasificacion 
FROM vista_analisis_desempeño_usuarios 
WHERE nombre = 'Ada Lovelace';  