'use server'

import pool from '@/lib/db'
import { 
    coursePerformanceFilterSchema,
    teacherLoadFilterSchema,
    studentsAtRiskFilterSchema,
    attendanceByGroupFilterSchema,
    rankStudentsFilterSchema,
    type CoursePerformanceFilter,
    type TeacherLoadFilter,
    type StudentsAtRiskFilter,
    type AttendanceByGroupFilter,
    type RankStudentsFilter
} from '@/lib/validations'

// ============================================================================
// REPORTE 1: Rendimiento Académico por Curso (vw_course_performance)
// ============================================================================
// Título: Rendimiento Académico por Curso
// Descripción: Análisis del desempeño estudiantil por curso y período académico
// KPI Destacado: Promedio general y tasa de reprobación
// ============================================================================

export async function getVwCoursePerformance(rawFilters?: Partial<CoursePerformanceFilter>) {
    try {
        const filters = coursePerformanceFilterSchema.parse(rawFilters || {});
        
        const orderByWhitelist: Record<string, string> = {
            'promedio_final': 'promedio_final',
            'porcentaje_reprobados': 'porcentaje_reprobados',
            'total_estudiantes': 'total_estudiantes'
        };
        
        const orderColumn = orderByWhitelist[filters.orderBy] || 'promedio_final';
        const orderDirection = filters.orderDir === 'ASC' ? 'ASC' : 'DESC';
        
        const params: (string | number)[] = [];
        const whereConditions: string[] = [];
        let paramIndex = 1;
        
        if (filters.term && filters.term !== 'todos') {
            whereConditions.push(`term = $${paramIndex}`);
            params.push(filters.term);
            paramIndex++;
        }
        
        if (filters.program && filters.program !== '') {
            whereConditions.push(`program ILIKE $${paramIndex}`);
            params.push(`%${filters.program}%`);
            paramIndex++;
        }
        
        if (filters.minReprobados > 0) {
            whereConditions.push(`porcentaje_reprobados >= $${paramIndex}`);
            params.push(filters.minReprobados);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        const result = await pool.query(
            `SELECT 
                course_id,
                term AS periodo,
                program AS programa,
                total_estudiantes,
                promedio_final,
                porcentaje_reprobados
             FROM vw_course_performance 
             ${whereClause}
             ORDER BY ${orderColumn} ${orderDirection}`,
            params
        );
        
        // Cálculo de KPIs destacados
        const totalEstudiantes = result.rows.reduce((sum, row) => sum + parseInt(row.total_estudiantes || 0), 0);
        const promedioGeneral = result.rows.length > 0
            ? (result.rows.reduce((sum, row) => sum + parseFloat(row.promedio_final || 0), 0) / result.rows.length).toFixed(2)
            : 0;
        const cursoMejorPromedio = result.rows.reduce((best, row) => 
            (!best || parseFloat(row.promedio_final) > parseFloat(best.promedio_final)) ? row : best, null);
        const tasaReprobacionPromedio = result.rows.length > 0
            ? (result.rows.reduce((sum, row) => sum + parseFloat(row.porcentaje_reprobados || 0), 0) / result.rows.length).toFixed(2)
            : 0;
        
        const destacado = {
            totalEstudiantes,
            promedioGeneral,
            cursoDestacado: cursoMejorPromedio?.course_id,
            mejorPromedio: cursoMejorPromedio?.promedio_final,
            tasaReprobacionPromedio: `${tasaReprobacionPromedio}%`,
            totalCursos: result.rows.length
        };
        
        return { data: result.rows, destacado };
    } catch (error) {
        console.error('Error al obtener vw_course_performance', error);
        throw new Error('Error al obtener rendimiento de cursos');
    }
}

// ============================================================================
// REPORTE 2: Carga Docente (vw_teacher_load)
// ============================================================================
// Título: Carga Docente por Período
// Descripción: Análisis de la distribución de trabajo entre profesores
// KPI Destacado: Ratio alumnos/grupo y promedio general de calificaciones
// ============================================================================

export async function getVwTeacherLoad(rawFilters?: Partial<TeacherLoadFilter>) {
    try {
        const filters = teacherLoadFilterSchema.parse(rawFilters || {});
        
        const offset = (filters.page - 1) * filters.limit;
        
        const orderByWhitelist: Record<string, string> = {
            'total_alumnos': 'total_alumnos',
            'total_grupos': 'total_grupos',
            'promedio_general': 'promedio_general',
            'ratio_alumnos_por_grupo': 'ratio_alumnos_por_grupo'
        };
        
        const orderColumn = orderByWhitelist[filters.orderBy] || 'total_alumnos';
        const orderDirection = filters.orderDir === 'ASC' ? 'ASC' : 'DESC';
        
        const params: (string | number)[] = [];
        const whereConditions: string[] = [];
        let paramIndex = 1;
        
        if (filters.term && filters.term !== 'todos') {
            whereConditions.push(`term = $${paramIndex}`);
            params.push(filters.term);
            paramIndex++;
        }
        
        if (filters.minAlumnos > 0) {
            whereConditions.push(`total_alumnos >= $${paramIndex}`);
            params.push(filters.minAlumnos);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Query de datos con paginación
        const dataQuery = `
            SELECT 
                id_teacher,
                teacher_name AS nombre_profesor,
                term AS periodo,
                total_grupos,
                total_alumnos,
                promedio_general,
                ratio_alumnos_por_grupo
            FROM vw_teacher_load 
            ${whereClause}
            ORDER BY ${orderColumn} ${orderDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(filters.limit, offset);
        
        // Query de conteo
        const countParams = params.slice(0, -2);
        const countQuery = `SELECT COUNT(*) as total FROM vw_teacher_load ${whereClause}`;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, countParams)
        ]);
        
        const total = parseInt(countResult.rows[0]?.total || '0');
        const totalPages = Math.ceil(total / filters.limit);
        
        // KPIs destacados
        const statsQuery = await pool.query(
            `SELECT 
                MAX(total_alumnos) as max_alumnos,
                AVG(promedio_general) as promedio_general_global,
                AVG(ratio_alumnos_por_grupo) as ratio_promedio
             FROM vw_teacher_load ${whereClause}`,
            countParams
        );
        
        const docenteConMasAlumnos = dataResult.rows[0];
        
        const destacado = {
            docenteDestacado: docenteConMasAlumnos?.nombre_profesor,
            maxAlumnos: statsQuery.rows[0]?.max_alumnos,
            promedioGeneralGlobal: parseFloat(statsQuery.rows[0]?.promedio_general_global || 0).toFixed(2),
            ratioPromedioAlumnosGrupo: parseFloat(statsQuery.rows[0]?.ratio_promedio || 0).toFixed(1),
            totalDocentes: total
        };
        
        return { 
            data: dataResult.rows, 
            destacado,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error al obtener vw_teacher_load', error);
        throw new Error('Error al obtener carga docente');
    }
}

// ============================================================================
// REPORTE 3: Estudiantes en Riesgo (vw_students_at_risk)
// ============================================================================
// Título: Estudiantes en Riesgo Académico
// Descripción: Identificación de alumnos con bajo rendimiento o asistencia
// KPI Destacado: Distribución por nivel de riesgo
// ============================================================================

export async function getVwStudentsAtRisk(rawFilters?: Partial<StudentsAtRiskFilter>) {
    try {
        const filters = studentsAtRiskFilterSchema.parse(rawFilters || {});
        
        const offset = (filters.page - 1) * filters.limit;
        
        const orderByWhitelist: Record<string, string> = {
            'promedio_calificaciones': 'promedio_calificaciones',
            'porcentaje_asistencia': 'porcentaje_asistencia',
            'student_name': 'student_name'
        };
        
        const orderColumn = orderByWhitelist[filters.orderBy] || 'promedio_calificaciones';
        const orderDirection = filters.orderDir === 'ASC' ? 'ASC' : 'DESC';
        
        const params: (string | number)[] = [];
        const whereConditions: string[] = [];
        let paramIndex = 1;
        
        // Búsqueda por nombre o email
        if (filters.search && filters.search !== '') {
            whereConditions.push(`(student_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        
        if (filters.term && filters.term !== 'todos') {
            whereConditions.push(`term = $${paramIndex}`);
            params.push(filters.term);
            paramIndex++;
        }
        
        if (filters.nivelRiesgo && filters.nivelRiesgo !== 'todos') {
            whereConditions.push(`nivel_riesgo = $${paramIndex}`);
            params.push(filters.nivelRiesgo);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Query de datos con paginación
        const dataQuery = `
            SELECT 
                id_student,
                student_name AS nombre_estudiante,
                email,
                term AS periodo,
                promedio_calificaciones,
                porcentaje_asistencia,
                nivel_riesgo
            FROM vw_students_at_risk 
            ${whereClause}
            ORDER BY ${orderColumn} ${orderDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(filters.limit, offset);
        
        // Query de conteo
        const countParams = params.slice(0, -2);
        const countQuery = `SELECT COUNT(*) as total FROM vw_students_at_risk ${whereClause}`;
        
        // Query de distribución por riesgo
        const riesgoQuery = `
            SELECT nivel_riesgo, COUNT(*) as cantidad 
            FROM vw_students_at_risk ${whereClause}
            GROUP BY nivel_riesgo
        `;
        
        const [dataResult, countResult, riesgoResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, countParams),
            pool.query(riesgoQuery, countParams)
        ]);
        
        const total = parseInt(countResult.rows[0]?.total || '0');
        const totalPages = Math.ceil(total / filters.limit);
        
        // Distribución de riesgo
        const distribucionRiesgo: Record<string, number> = {};
        riesgoResult.rows.forEach(row => {
            distribucionRiesgo[row.nivel_riesgo] = parseInt(row.cantidad);
        });
        
        const estudiantesAltoRiesgo = distribucionRiesgo['ALTO'] || 0;
        const porcentajeAltoRiesgo = total > 0 ? ((estudiantesAltoRiesgo / total) * 100).toFixed(1) : 0;
        
        const destacado = {
            totalEstudiantesEnRiesgo: total,
            estudiantesRiesgoAlto: estudiantesAltoRiesgo,
            estudiantesRiesgoMedio: distribucionRiesgo['MEDIO'] || 0,
            estudiantesRiesgoBajo: distribucionRiesgo['BAJO'] || 0,
            porcentajeAltoRiesgo: `${porcentajeAltoRiesgo}%`,
            alertaCritica: estudiantesAltoRiesgo > 10 ? '⚠️ Alta cantidad de estudiantes en riesgo' : '✓ Niveles aceptables'
        };
        
        return { 
            data: dataResult.rows, 
            destacado,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error al obtener vw_students_at_risk', error);
        throw new Error('Error al obtener estudiantes en riesgo');
    }
}

// ============================================================================
// REPORTE 4: Asistencia por Grupo (vw_attendance_by_group)
// ============================================================================
// Título: Asistencia por Grupo
// Descripción: Análisis de asistencia promedio por grupo y período
// KPI Destacado: Estado de asistencia y grupos críticos
// ============================================================================

export async function getVwAttendanceByGroup(rawFilters?: Partial<AttendanceByGroupFilter>) {
    try {
        const filters = attendanceByGroupFilterSchema.parse(rawFilters || {});
        
        const orderByWhitelist: Record<string, string> = {
            'porcentaje_asistencia': 'porcentaje_asistencia',
            'total_sesiones': 'total_sesiones',
            'course_id': 'course_id'
        };
        
        const orderColumn = orderByWhitelist[filters.orderBy] || 'porcentaje_asistencia';
        const orderDirection = filters.orderDir === 'ASC' ? 'ASC' : 'DESC';
        
        const params: (string | number)[] = [];
        const whereConditions: string[] = [];
        let paramIndex = 1;
        
        if (filters.term && filters.term !== 'todos') {
            whereConditions.push(`term = $${paramIndex}`);
            params.push(filters.term);
            paramIndex++;
        }
        
        if (filters.estadoAsistencia && filters.estadoAsistencia !== 'todos') {
            whereConditions.push(`estado_asistencia = $${paramIndex}`);
            params.push(filters.estadoAsistencia);
            paramIndex++;
        }
        
        if (filters.minAsistencia > 0) {
            whereConditions.push(`porcentaje_asistencia >= $${paramIndex}`);
            params.push(filters.minAsistencia);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        const result = await pool.query(
            `SELECT 
                id_group,
                course_id,
                term AS periodo,
                total_sesiones,
                asistencias,
                ausencias,
                porcentaje_asistencia,
                estado_asistencia
             FROM vw_attendance_by_group 
             ${whereClause}
             ORDER BY ${orderColumn} ${orderDirection}`,
            params
        );
        
        // Calcular distribución por estado
        const distribucionEstado: Record<string, number> = {};
        result.rows.forEach(row => {
            distribucionEstado[row.estado_asistencia] = (distribucionEstado[row.estado_asistencia] || 0) + 1;
        });
        
        const promedioAsistenciaGlobal = result.rows.length > 0
            ? (result.rows.reduce((sum, row) => sum + parseFloat(row.porcentaje_asistencia || 0), 0) / result.rows.length).toFixed(2)
            : 0;
        
        const gruposCriticos = distribucionEstado['CRÍTICO'] || 0;
        const gruposBajos = distribucionEstado['BAJO'] || 0;
        
        const destacado = {
            totalGrupos: result.rows.length,
            promedioAsistenciaGlobal: `${promedioAsistenciaGlobal}%`,
            gruposCriticos,
            gruposBajos,
            gruposAceptables: distribucionEstado['ACEPTABLE'] || 0,
            gruposExcelentes: distribucionEstado['EXCELENTE'] || 0,
            alerta: gruposCriticos > 0 ? `⚠️ ${gruposCriticos} grupo(s) con asistencia crítica` : '✓ Sin grupos críticos'
        };
        
        return { data: result.rows, destacado };
    } catch (error) {
        console.error('Error al obtener vw_attendance_by_group', error);
        throw new Error('Error al obtener asistencia por grupo');
    }
}

// ============================================================================
// REPORTE 5: Ranking de Estudiantes (vw_rank_students)
// ============================================================================
// Título: Ranking de Estudiantes
// Descripción: Clasificación de estudiantes por programa y período académico
// KPI Destacado: Top estudiantes y distribución de percentiles
// ============================================================================

export async function getVwRankStudents(rawFilters?: Partial<RankStudentsFilter>) {
    try {
        const filters = rankStudentsFilterSchema.parse(rawFilters || {});
        
        const offset = (filters.page - 1) * filters.limit;
        
        const orderByWhitelist: Record<string, string> = {
            'ranking_programa': 'ranking_programa',
            'ranking_global': 'ranking_global',
            'calificacion_final': 'calificacion_final',
            'percentil': 'percentil'
        };
        
        const orderColumn = orderByWhitelist[filters.orderBy] || 'ranking_programa';
        const orderDirection = filters.orderDir === 'ASC' ? 'ASC' : 'DESC';
        
        const params: (string | number)[] = [];
        const whereConditions: string[] = [];
        let paramIndex = 1;
        
        if (filters.program && filters.program !== '') {
            whereConditions.push(`program ILIKE $${paramIndex}`);
            params.push(`%${filters.program}%`);
            paramIndex++;
        }
        
        if (filters.term && filters.term !== 'todos') {
            whereConditions.push(`term = $${paramIndex}`);
            params.push(filters.term);
            paramIndex++;
        }
        
        // Filtro para top N por ranking de programa
        if (filters.topN < 100) {
            whereConditions.push(`ranking_programa <= $${paramIndex}`);
            params.push(filters.topN);
            paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        // Query de datos con paginación
        const dataQuery = `
            SELECT 
                id_student,
                student_name AS nombre_estudiante,
                program AS programa,
                term AS periodo,
                calificacion_final,
                ranking_programa,
                ranking_global,
                percentil
            FROM vw_rank_students 
            ${whereClause}
            ORDER BY ${orderColumn} ${orderDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(filters.limit, offset);
        
        // Query de conteo
        const countParams = params.slice(0, -2);
        const countQuery = `SELECT COUNT(*) as total FROM vw_rank_students ${whereClause}`;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, countParams)
        ]);
        
        const total = parseInt(countResult.rows[0]?.total || '0');
        const totalPages = Math.ceil(total / filters.limit);
        
        // KPIs: obtener el top 1 y estadísticas
        const topStudentQuery = await pool.query(
            `SELECT student_name, program, calificacion_final, percentil 
             FROM vw_rank_students 
             ${whereClause.replace(/ranking_programa <= \$\d+( AND)?/g, '')}
             ORDER BY calificacion_final DESC 
             LIMIT 1`,
            countParams.filter((_, i) => i < countParams.length - (filters.topN < 100 ? 1 : 0))
        );
        
        const topStudent = topStudentQuery.rows[0];
        const promedioCalificaciones = dataResult.rows.length > 0
            ? (dataResult.rows.reduce((sum, row) => sum + parseFloat(row.calificacion_final || 0), 0) / dataResult.rows.length).toFixed(2)
            : 0;
        
        const destacado = {
            estudianteDestacado: topStudent?.student_name,
            programaDestacado: topStudent?.program,
            mejorCalificacion: topStudent?.calificacion_final,
            promedioCalificaciones,
            totalEstudiantes: total,
            percentilPromedio: dataResult.rows.length > 0
                ? (dataResult.rows.reduce((sum, row) => sum + parseFloat(row.percentil || 0), 0) / dataResult.rows.length).toFixed(2)
                : 0
        };
        
        return { 
            data: dataResult.rows, 
            destacado,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total,
                totalPages
            }
        };
    } catch (error) {
        console.error('Error al obtener vw_rank_students', error);
        throw new Error('Error al obtener ranking de estudiantes');
    }
}