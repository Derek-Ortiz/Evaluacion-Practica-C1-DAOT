import { getVwCoursePerformance } from "@/app/actions/reportes";
import Link from "next/link";

export default async function Report1Page({
    searchParams
}: {
    searchParams: Promise<{ term?: string; program?: string }>
}) {
    const params = await searchParams;
    const term = params.term || 'todos';
    const program = params.program || '';
    
    const { data: datos, destacado } = await getVwCoursePerformance({
        term: term as 'enero-abril' | 'mayo-agosto' | 'septiembre-diciembre' | 'todos',
        program
    });
    
    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/Dashboard/Home" className="text-blue-500 hover:underline">
                    ← Volver a reportes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Rendimiento Académico por Curso</h1>
            <p className="text-gray-600 mb-4">
                Análisis del desempeño estudiantil por curso y período académico, incluyendo promedios y tasa de reprobación.
            </p>
            
            {destacado && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <p className="text-sm uppercase tracking-wide opacity-80">KPI Destacado</p>
                    <p className="text-4xl font-bold">{destacado.promedioGeneral}</p>
                    <p className="text-lg mt-1">📊 Promedio General</p>
                    <p className="text-sm opacity-70 mt-2">
                        {destacado.totalEstudiantes} estudiantes | {destacado.totalCursos} cursos | Tasa reprobación: {destacado.tasaReprobacionPromedio}
                    </p>
                </div>
            )}
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por período:</span>
                {['todos', 'enero-abril', 'mayo-agosto', 'septiembre-diciembre'].map((t) => (
                    <Link 
                        key={t}
                        href={`/Dashboard/Home/1?term=${t}&program=${program}`}
                        className={`px-3 py-1 rounded ${term === t ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {t}
                    </Link>
                ))}
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Curso ID</th>
                            <th className="px-4 py-2 border">Período</th>
                            <th className="px-4 py-2 border">Programa</th>
                            <th className="px-4 py-2 border">Total Estudiantes</th>
                            <th className="px-4 py-2 border">Promedio Final</th>
                            <th className="px-4 py-2 border">% Reprobados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border text-center">{row.course_id}</td>
                                <td className="px-4 py-2 border">{row.term}</td>
                                <td className="px-4 py-2 border">{row.program}</td>
                                <td className="px-4 py-2 border text-center">{row.total_estudiantes}</td>
                                <td className="px-4 py-2 border text-right">{Number(row.promedio_final).toFixed(2)}</td>
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        Number(row.porcentaje_reprobados) > 30 ? 'bg-red-200 text-red-800' :
                                        Number(row.porcentaje_reprobados) > 15 ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-green-200 text-green-800'
                                    }`}>
                                        {row.porcentaje_reprobados}%
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