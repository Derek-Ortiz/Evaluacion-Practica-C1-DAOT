/*
View numero : 1
-- Que devuelve: Promedio de precios por categoría
-- Grain: Una fila representa una categoría
-- Metricas: AVG, COUNT
-- Por qué usa GROUP BY/HAVING: Agrupa por categoría y filtra las que tienen más de 2 productos
*/
CREATE VIEW vw_course_performance

/*
View numero : 2
-- Que devuelve: Ranking de usuarios por total gastado con clasificación de nivel
-- Grain: Una fila representa un usuario
-- Metricas: SUM, COUNT, RANK (Window Function)
-- Por qué usa GROUP BY/HAVING: Agrupa por usuario y filtra los que tienen más de 0 órdenes
*/

CREATE VIEW vw_teacher_load

/*
View numero : 3
-- Que devuelve: Órdenes por status con conteo y porcentaje de distribución
-- Grain: Una fila representa un status de orden
-- Metricas: COUNT, SUM, Porcentaje calculado
-- Por qué usa GROUP BY/HAVING: Agrupa por status y filtra los que tienen más de 0 órdenes
*/

CREATE VIEW vw_students_at_risk

/*
View numero : 4
-- Que devuelve: Productos más vendidos con estado de inventario
-- Grain: Una fila representa un producto
-- Metricas: SUM (cantidad vendida), Window Function ROW_NUMBER
-- Por qué usa GROUP BY/HAVING: Agrupa por producto y filtra los vendidos más de 1 vez
*/

CREATE VIEW vw_attendance_by_group

/*
View numero : 5
-- Que devuelve: Análisis de desempeño de usuarios por estado de órdenes
-- Grain: Una fila representa un usuario
-- Metricas: COUNT con CASE, AVG, Window Function SUM OVER
-- Por qué usa GROUP BY/HAVING: Agrupa por usuario y filtra los que tienen órdenes entregadas
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