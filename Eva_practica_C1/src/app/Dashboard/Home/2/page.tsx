import { getVwTeacherLoad } from "@/lib/reportes";
import Link from "next/link";

export default async function Report2Page({
    searchParams
}: {
    searchParams: Promise<{ page?: string; term?: string }>
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const term = params.term || 'todos';
    
    const { data: datos, destacado, pagination } = await getVwTeacherLoad({
        page,
        limit: 10,
        term: term as 'enero-abril' | 'mayo-agosto' | 'septiembre-diciembre' | 'todos'
    });
    
    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/Dashboard/Home" className="text-blue-500 hover:underline">
                    ← Volver a reportes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Carga Docente por Período</h1>
            <p className="text-gray-600 mb-4">
                Análisis de la distribución de trabajo entre profesores. Incluye HAVING para filtrar docentes con alumnos.
            </p>
            
            {destacado && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <p className="text-sm uppercase tracking-wide opacity-80">Docente con mayor carga</p>
                    <p className="text-4xl font-bold">{destacado.maxAlumnos} alumnos</p>
                    <p className="text-lg mt-1">🎓 {destacado.docenteDestacado}</p>
                    <p className="text-sm opacity-70 mt-2">
                        Promedio general: {destacado.promedioGeneralGlobal} | 
                        Ratio alumnos/grupo: {destacado.ratioPromedioAlumnosGrupo} |
                        Total docentes: {destacado.totalDocentes}
                    </p>
                </div>
            )}
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por período:</span>
                {['todos', 'enero-abril', 'mayo-agosto', 'septiembre-diciembre'].map((t) => (
                    <Link 
                        key={t}
                        href={`/Dashboard/Home/2?term=${t}&page=1`}
                        className={`px-3 py-1 rounded ${term === t ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {t}
                    </Link>
                ))}
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Profesor</th>
                            <th className="px-4 py-2 border">Período</th>
                            <th className="px-4 py-2 border">Total Grupos</th>
                            <th className="px-4 py-2 border">Total Alumnos</th>
                            <th className="px-4 py-2 border">Promedio General</th>
                            <th className="px-4 py-2 border">Ratio Alumnos/Grupo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border text-center">{row.id_teacher}</td>
                                <td className="px-4 py-2 border">{row.teacher_name}</td>
                                <td className="px-4 py-2 border">{row.term}</td>
                                <td className="px-4 py-2 border text-center">{row.total_grupos}</td>
                                <td className="px-4 py-2 border text-center">{row.total_alumnos}</td>
                                <td className="px-4 py-2 border text-right">{Number(row.promedio_general).toFixed(2)}</td>
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        Number(row.ratio_alumnos_por_grupo) > 30 ? 'bg-red-200 text-red-800' :
                                        Number(row.ratio_alumnos_por_grupo) > 20 ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-green-200 text-green-800'
                                    }`}>
                                        {row.ratio_alumnos_por_grupo}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {pagination && (
                <div className="mt-4 flex justify-center gap-2">
                    {pagination.page > 1 && (
                        <Link 
                            href={`/Dashboard/Home/2?term=${term}&page=${pagination.page - 1}`}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Anterior
                        </Link>
                    )}
                    <span className="px-4 py-2">
                        Página {pagination.page} de {pagination.totalPages || 1}
                    </span>
                    {pagination.page < pagination.totalPages && (
                        <Link 
                            href={`/Dashboard/Home/2?term=${term}&page=${pagination.page + 1}`}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Siguiente
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}