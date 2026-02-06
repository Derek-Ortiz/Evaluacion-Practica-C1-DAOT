import { getVwAttendanceByGroup } from "@/app/actions/reportes";
import Link from "next/link";

export default async function Report4Page({
    searchParams
}: {
    searchParams: Promise<{ term?: string; estado?: string }>
}) {
    const params = await searchParams;
    const term = params.term || 'todos';
    const estado = params.estado || 'todos';
    
    const { data: datos, destacado } = await getVwAttendanceByGroup({
        term: term as 'enero-abril' | 'mayo-agosto' | 'septiembre-diciembre' | 'todos',
        estadoAsistencia: estado as 'CRÍTICO' | 'BAJO' | 'ACEPTABLE' | 'EXCELENTE' | 'todos'
    });
    
    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/Dashboard/Home" className="text-blue-500 hover:underline">
                    ← Volver a reportes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Asistencia por Grupo</h1>
            <p className="text-gray-600 mb-4">
                Análisis de asistencia promedio por grupo y período. Usa CASE y COALESCE para clasificar estados.
            </p>
            
            {destacado && (
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <p className="text-sm uppercase tracking-wide opacity-80">Asistencia Global Promedio</p>
                    <p className="text-4xl font-bold">{destacado.promedioAsistenciaGlobal}</p>
                    <p className="text-lg mt-1">{destacado.alerta}</p>
                    <p className="text-sm opacity-70 mt-2">
                        Excelentes: {destacado.gruposExcelentes} | 
                        Aceptables: {destacado.gruposAceptables} | 
                        Bajos: {destacado.gruposBajos} | 
                        Críticos: {destacado.gruposCriticos}
                    </p>
                </div>
            )}
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por período:</span>
                {['todos', 'enero-abril', 'mayo-agosto', 'septiembre-diciembre'].map((t) => (
                    <Link 
                        key={t}
                        href={`/Dashboard/Home/4?term=${t}&estado=${estado}`}
                        className={`px-3 py-1 rounded ${term === t ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {t}
                    </Link>
                ))}
            </div>
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por estado:</span>
                {['todos', 'EXCELENTE', 'ACEPTABLE', 'BAJO', 'CRÍTICO'].map((e) => (
                    <Link 
                        key={e}
                        href={`/Dashboard/Home/4?term=${term}&estado=${encodeURIComponent(e)}`}
                        className={`px-3 py-1 rounded ${estado === e ? 'bg-violet-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {e}
                    </Link>
                ))}
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Grupo ID</th>
                            <th className="px-4 py-2 border">Curso ID</th>
                            <th className="px-4 py-2 border">Período</th>
                            <th className="px-4 py-2 border">Total Sesiones</th>
                            <th className="px-4 py-2 border">Asistencias</th>
                            <th className="px-4 py-2 border">Ausencias</th>
                            <th className="px-4 py-2 border">% Asistencia</th>
                            <th className="px-4 py-2 border">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border text-center">{row.id_group}</td>
                                <td className="px-4 py-2 border text-center">{row.course_id}</td>
                                <td className="px-4 py-2 border">{row.term}</td>
                                <td className="px-4 py-2 border text-center">{row.total_sesiones}</td>
                                <td className="px-4 py-2 border text-center">{row.asistencias}</td>
                                <td className="px-4 py-2 border text-center">{row.ausencias}</td>
                                <td className="px-4 py-2 border text-right">{Number(row.porcentaje_asistencia).toFixed(2)}%</td>
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        row.estado_asistencia === 'EXCELENTE' ? 'bg-green-200 text-green-800' :
                                        row.estado_asistencia === 'ACEPTABLE' ? 'bg-blue-200 text-blue-800' :
                                        row.estado_asistencia === 'BAJO' ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-red-200 text-red-800'
                                    }`}>
                                        {row.estado_asistencia}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}