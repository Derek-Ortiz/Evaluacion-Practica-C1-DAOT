import { z } from 'zod';


export const paginationSchema = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(10),
});



export const coursePerformanceFilterSchema = z.object({
    term: z.enum(['enero-abril', 'mayo-agosto', 'septiembre-diciembre', 'todos']).optional().default('todos'),
    program: z.string().optional().default(''),
    minReprobados: z.number().min(0).max(100).optional().default(0),
    orderBy: z.enum(['promedio_final', 'porcentaje_reprobados', 'total_estudiantes']).optional().default('promedio_final'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});


export const teacherLoadFilterSchema = z.object({
    term: z.enum(['enero-abril', 'mayo-agosto', 'septiembre-diciembre', 'todos']).optional().default('todos'),
    minAlumnos: z.number().min(0).optional().default(0),
    orderBy: z.enum(['total_alumnos', 'total_grupos', 'promedio_general', 'ratio_alumnos_por_grupo']).optional().default('total_alumnos'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
}).merge(paginationSchema);


export const studentsAtRiskFilterSchema = z.object({
    search: z.string().optional().default(''),
    term: z.enum(['enero-abril', 'mayo-agosto', 'septiembre-diciembre', 'todos']).optional().default('todos'),
    nivelRiesgo: z.enum(['ALTO', 'MEDIO', 'BAJO', 'todos']).optional().default('todos'),
    orderBy: z.enum(['promedio_calificaciones', 'porcentaje_asistencia', 'student_name']).optional().default('promedio_calificaciones'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
}).merge(paginationSchema);


export const attendanceByGroupFilterSchema = z.object({
    term: z.enum(['enero-abril', 'mayo-agosto', 'septiembre-diciembre', 'todos']).optional().default('todos'),
    estadoAsistencia: z.enum(['CRÍTICO', 'BAJO', 'ACEPTABLE', 'EXCELENTE', 'todos']).optional().default('todos'),
    minAsistencia: z.number().min(0).max(100).optional().default(0),
    orderBy: z.enum(['porcentaje_asistencia', 'total_sesiones', 'course_id']).optional().default('porcentaje_asistencia'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});


export const rankStudentsFilterSchema = z.object({
    program: z.string().optional().default(''),
    term: z.enum(['enero-abril', 'mayo-agosto', 'septiembre-diciembre', 'todos']).optional().default('todos'),
    topN: z.number().min(1).max(100).optional().default(10),
    orderBy: z.enum(['ranking_programa', 'ranking_global', 'calificacion_final', 'percentil']).optional().default('ranking_programa'),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
}).merge(paginationSchema);


export type PaginationParams = z.infer<typeof paginationSchema>;
export type CoursePerformanceFilter = z.infer<typeof coursePerformanceFilterSchema>;
export type TeacherLoadFilter = z.infer<typeof teacherLoadFilterSchema>;
export type StudentsAtRiskFilter = z.infer<typeof studentsAtRiskFilterSchema>;
export type AttendanceByGroupFilter = z.infer<typeof attendanceByGroupFilterSchema>;
export type RankStudentsFilter = z.infer<typeof rankStudentsFilterSchema>;

