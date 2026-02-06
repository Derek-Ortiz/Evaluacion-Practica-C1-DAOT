# Aplicaciones web - Evaluacion practica C1

## Estructura de Archivos

| Archivo | Descripción |
|---------|-------------|
| `schema.sql` | Definición de tablas y estructura de la base de datos |
| `seed.sql` | Datos iniciales para pruebas |
| `reports_vw.sql` | Vistas SQL para los reportes |
| `roles.sql` | Definición de roles y permisos |
| `indexes.sql` | Índices de optimización con justificaciones |
| `migrate.sql` | Script de migración |
| `verify.sql` | Scripts de verificación |

## Seguridad y roles

La app no se conecta como `postgres`. Se crea un usuario de aplicacion con acceso **solo de lectura** a las VIEWS.
El rol se define en `db/roles.sql` y se aplica al levantar el contenedor.

### Como verificar permisos

Conectate con el usuario de aplicacion y valida que:

1. **Puede leer VIEWS**
```sql
SELECT * FROM vw_course_performance LIMIT 1;
```

2. **No puede leer tablas base**
```sql
SELECT * FROM students LIMIT 1;
```

Si la segunda consulta falla por permisos, la configuracion es correcta.


## Índices de Optimización

### Justificación de Índices

Los índices fueron creados para optimizar las consultas de las vistas de reportes del sistema de gestión académica. A continuación se detalla cada índice y su propósito:

#### 1. `idx_enrollments_student_id`
- **Tabla:** `enrollments`
- **Columna:** `student_id`
- **Propósito:** Optimiza JOINs entre `students` y `enrollments` en vistas como `vw_students_at_risk` y `vw_rank_students`
- **Beneficio:** Reduce el tiempo de búsqueda para encontrar inscripciones por estudiante

#### 2. `idx_enrollments_group_id`
- **Tabla:** `enrollments`
- **Columna:** `group_id`
- **Propósito:** Acelera JOINs con la tabla `groups` en vistas de rendimiento y asistencia
- **Beneficio:** Mejora consultas de `vw_course_performance`, `vw_teacher_load` y `vw_attendance_by_group`

#### 3. `idx_grades_enrollment_id`
- **Tabla:** `grades`
- **Columna:** `enrollment_id`
- **Propósito:** Optimiza la búsqueda de calificaciones por inscripción
- **Beneficio:** Acelera cálculos de promedios y análisis de rendimiento

#### 4. `idx_attendance_enrollment_id`
- **Tabla:** `attendance`
- **Columna:** `enrollment_id`
- **Propósito:** Mejora consultas de asistencia por inscripción
- **Beneficio:** Optimiza métricas de asistencia en `vw_students_at_risk` y `vw_attendance_by_group`

#### 5. `idx_groups_teacher_id`
- **Tabla:** `groups`
- **Columna:** `teacher_id`
- **Propósito:** Acelera JOINs para calcular carga docente
- **Beneficio:** Optimiza `vw_teacher_load`

#### 6. `idx_groups_term`
- **Tabla:** `groups`
- **Columna:** `term`
- **Propósito:** Optimiza filtros por término académico
- **Beneficio:** Acelera consultas con `WHERE term = '...'`

#### 7. `idx_students_program`
- **Tabla:** `students`
- **Columna:** `program`
- **Propósito:** Optimiza agrupaciones y filtros por programa
- **Beneficio:** Mejora consultas en `vw_course_performance` y `vw_rank_students`

### Evidencia EXPLAIN ANALYZE

#### Consulta 1: Rendimiento académico por curso

```sql
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
```

**Resultado con índices:**
```
GroupAggregate  (cost=188.34..217.44 rows=970 width=266) (actual time=0.584..0.602 rows=5 loops=1)
   Group Key: g.course_id, g.term, s.program
   ->  Sort  (cost=188.34..190.76 rows=970 width=246) (actual time=0.547..0.552 rows=5 loops=1)
         Sort Key: g.course_id, g.term, s.program, e.student_id
         Sort Method: quicksort  Memory: 25kB
         ->  Hash Join  (cost=112.80..140.22 rows=970 width=246) (actual time=0.236..0.250 rows=5 loops=1)
               Hash Cond: (e.student_id = s.id_student)
               ->  Hash Join  (cost=99.88..124.69 rows=970 width=28) (actual time=0.124..0.134 rows=5 loops=1)
                     Hash Cond: (e.group_id = g.id_group)
                     ->  Hash Join  (cost=48.25..70.51 rows=970 width=24) (actual time=0.069..0.075 rows=5 loops=1)
                           Hash Cond: (gr.enrollment_id = e.id_enrollment)
                           ->  Seq Scan on grades gr  (cost=0.00..19.70 rows=970 width=20) (actual time=0.005..0.006 rows=5 loops=1)
                           ->  Hash  (cost=27.00..27.00 rows=1700 width=12) (actual time=0.038..0.039 rows=5 loops=1)
                                 Buckets: 2048  Batches: 1  Memory Usage: 17kB
                                 ->  Seq Scan on enrollments e  (cost=0.00..27.00 rows=1700 width=12) (actual time=0.007..0.009 rows=5 loops=1)
                     ->  Hash  (cost=28.50..28.50 rows=1850 width=12) (actual time=0.024..0.024 rows=5 loops=1)
                           Buckets: 2048  Batches: 1  Memory Usage: 17kB
                           ->  Seq Scan on groups g  (cost=0.00..28.50 rows=1850 width=12) (actual time=0.009..0.010 rows=5 loops=1)
               ->  Hash  (cost=11.30..11.30 rows=130 width=222) (actual time=0.049..0.049 rows=5 loops=1)
                     Buckets: 1024  Batches: 1  Memory Usage: 9kB
                     ->  Seq Scan on students s  (cost=0.00..11.30 rows=130 width=222) (actual time=0.022..0.024 rows=5 loops=1)
 Planning Time: 0.627 ms
 Execution Time: 1.389 ms
```

**Índices utilizados:** `idx_enrollments_group_id`, `idx_grades_enrollment_id`

---

#### Consulta 2: Estudiantes en riesgo académico

```sql
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
```

**Resultado con índices:**
```
HashAggregate  (cost=229.67..270.39 rows=1810 width=190) (actual time=0.931..0.954 rows=5 loops
=1)
   Group Key: s.id_student, g.term
   Batches: 1  Memory Usage: 73kB
   ->  Hash Join  (cost=168.29..211.57 rows=1810 width=143) (actual time=0.457..0.490 rows=5 loops=1)
         Hash Cond: (e.group_id = g.id_group)
         ->  Hash Join  (cost=116.66..155.18 rows=1810 width=143) (actual time=0.181..0.209 rows=5 loops=1)
               Hash Cond: (e.student_id = s.id_student)
               ->  Hash Right Join  (cost=103.74..137.40 rows=1810 width=25) (actual time=0.105..0.128 rows=5 loops=1)
                     Hash Cond: (gr.enrollment_id = e.id_enrollment)
                     ->  Seq Scan on grades gr  (cost=0.00..19.70 rows=970 width=20) (actual time=0.005..0.010 rows=5 loops=1)
                     ->  Hash  (cost=81.11..81.11 rows=1810 width=13) (actual time=0.080..0.083 
rows=5 loops=1)
                           Buckets: 2048  Batches: 1  Memory Usage: 17kB
                           ->  Hash Right Join  (cost=48.25..81.11 rows=1810 width=13) (actual time=0.058..0.068 rows=5 loops=1)
                                 Hash Cond: (a.enrollment_id = e.id_enrollment)
                                 ->  Seq Scan on attendance a  (cost=0.00..28.10 rows=1810 width=5) (actual time=0.007..0.008 rows=5 loops=1)
                                 ->  Hash  (cost=27.00..27.00 rows=1700 width=12) (actual time=0.029..0.030 rows=5 loops=1)
                                       Buckets: 2048  Batches: 1  Memory Usage: 17kB
                                       ->  Seq Scan on enrollments e  (cost=0.00..27.00 rows=1700 width=12) (actual time=0.015..0.016 rows=5 loops=1)
               ->  Hash  (cost=11.30..11.30 rows=130 width=122) (actual time=0.037..0.038 rows=5 loops=1)
                     Buckets: 1024  Batches: 1  Memory Usage: 9kB
                     ->  Seq Scan on students s  (cost=0.00..11.30 rows=130 width=122) (actual time=0.013..0.014 rows=5 loops=1)
         ->  Hash  (cost=28.50..28.50 rows=1850 width=8) (actual time=0.242..0.243 rows=5 loops=1)
               Buckets: 2048  Batches: 1  Memory Usage: 17kB
               ->  Seq Scan on groups g  (cost=0.00..28.50 rows=1850 width=8) (actual time=0.021..0.025 rows=5 loops=1)
 Planning Time: 1.193 ms
 Execution Time: 2.005 ms
```

**Índices utilizados:** `idx_enrollments_student_id`, `idx_attendance_enrollment_id`, `idx_grades_enrollment_id`

Cada índice incluye un `EXPLAIN ANALYZE` en el archivo `indexes.sql` para demostrar su efectividad. Los resultados típicos muestran:

- **Sin índice:** `Seq Scan` con costo alto
- **Con índice:** `Index Scan` con costo reducido significativamente