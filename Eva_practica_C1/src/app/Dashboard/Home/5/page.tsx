import { getVwRankStudents } from "@/app/actions/reportes";
import Link from "next/link";

export default async function Report5Page({
    searchParams
}: {
    searchParams: Promise<{ page?: string; term?: string; program?: string; topN?: string }>
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const term = params.term || 'todos';
    const program = params.program || '';
    const topN = parseInt(params.topN || '10');
    
    const { data: datos, destacado, pagination } = await getVwRankStudents({
        page,
        limit: 10,
        term: term as 'enero-abril' | 'mayo-agosto' | 'septiembre-diciembre' | 'todos',
        program,
        topN
    });
    
    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/Dashboard/Home" className="text-blue-500 hover:underline">
                    ← Volver a reportes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Ranking de Estudiantes</h1>
            <p className="text-gray-600 mb-4">
                Clasificación de estudiantes por programa y período. Usa Window Functions (RANK, ROW_NUMBER, PERCENT_RANK).
            </p>
            
            {destacado && (
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <p className="text-sm uppercase tracking-wide opacity-80">Estudiante Destacado</p>
                    <p className="text-4xl font-bold">{destacado.mejorCalificacion}</p>
                    <p className="text-lg mt-1">🏆 {destacado.estudianteDestacado}</p>
                    <p className="text-sm opacity-70 mt-2">
                        Programa: {destacado.programaDestacado} | 
                        Promedio general: {destacado.promedioCalificaciones} |
                        Total estudiantes: {destacado.totalEstudiantes}
                    </p>
                </div>
            )}
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por período:</span>
                {['todos', 'enero-abril', 'mayo-agosto', 'septiembre-diciembre'].map((t) => (
                    <Link 
                        key={t}
                        href={`/Dashboard/Home/5?term=${t}&program=${program}&topN=${topN}&page=1`}
                        className={`px-3 py-1 rounded ${term === t ? 'bg-amber-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {t}
                    </Link>
                ))}
            </div>
            
            <div className="mb-4 flex gap-2 flex-wrap items-center">
                <span className="font-medium">Top N:</span>
                {[3, 5, 10, 20, 50].map((n) => (
                    <Link 
                        key={n}
                        href={`/Dashboard/Home/5?term=${term}&program=${program}&topN=${n}&page=1`}
                        className={`px-3 py-1 rounded ${topN === n ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Top {n}
                    </Link>
                ))}
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Rank Programa</th>
                            <th className="px-4 py-2 border">Rank Global</th>
                            <th className="px-4 py-2 border">Estudiante</th>
                            <th className="px-4 py-2 border">Programa</th>
                            <th className="px-4 py-2 border">Período</th>
                            <th className="px-4 py-2 border">Calificación</th>
                            <th className="px-4 py-2 border">Percentil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        row.ranking_programa === 1 ? 'bg-yellow-300 text-yellow-900 font-bold' :
                                        row.ranking_programa === 2 ? 'bg-gray-300 text-gray-800' :
                                        row.ranking_programa === 3 ? 'bg-orange-200 text-orange-800' :
                                        ''
                                    }`}>
                                        #{row.ranking_programa}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border text-center">#{row.ranking_global}</td>
                                <td className="px-4 py-2 border">{row.nombre_estudiante}</td>
                                <td className="px-4 py-2 border">{row.programa}</td>
                                <td className="px-4 py-2 border">{row.periodo}</td>
                                <td className="px-4 py-2 border text-right font-semibold">{Number(row.calificacion_final).toFixed(2)}</td>
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        Number(row.percentil) < 25 ? 'bg-green-200 text-green-800' :
                                        Number(row.percentil) < 50 ? 'bg-blue-200 text-blue-800' :
                                        Number(row.percentil) < 75 ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-red-200 text-red-800'
                                    }`}>
                                        {row.percentil}%
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
                            href={`/Dashboard/Home/5?term=${term}&program=${program}&topN=${topN}&page=${pagination.page - 1}`}
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
                            href={`/Dashboard/Home/5?term=${term}&program=${program}&topN=${topN}&page=${pagination.page + 1}`}
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