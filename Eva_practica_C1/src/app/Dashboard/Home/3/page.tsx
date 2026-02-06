import { getVwStudentsAtRisk } from "@/app/actions/reportes";
import Link from "next/link";

export default async function Report3Page({
    searchParams
}: {
    searchParams: Promise<{ page?: string; search?: string; nivelRiesgo?: string }>
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const search = params.search || '';
    const nivelRiesgo = params.nivelRiesgo || 'todos';
    
    const { data: datos, destacado, pagination } = await getVwStudentsAtRisk({
        page,
        limit: 10,
        search,
        nivelRiesgo: nivelRiesgo as 'ALTO' | 'MEDIO' | 'BAJO' | 'todos'
    });
    
    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/Dashboard/Home" className="text-blue-500 hover:underline">
                    ← Volver a reportes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Estudiantes en Riesgo Académico</h1>
            <p className="text-gray-600 mb-4">
                Identificación de alumnos con bajo rendimiento o baja asistencia. Usa CTE para cálculos complejos.
            </p>
            
            {destacado && (
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 mb-6 shadow-lg">
                    <p className="text-sm uppercase tracking-wide opacity-80">Estudiantes en Riesgo Alto</p>
                    <p className="text-4xl font-bold">{destacado.estudiantesRiesgoAlto}</p>
                    <p className="text-lg mt-1">{destacado.alertaCritica}</p>
                    <p className="text-sm opacity-70 mt-2">
                        Riesgo Medio: {destacado.estudiantesRiesgoMedio} | 
                        Riesgo Bajo: {destacado.estudiantesRiesgoBajo} | 
                        Total: {destacado.totalEstudiantesEnRiesgo}
                    </p>
                </div>
            )}
            
            <div className="mb-4">
                <form className="flex gap-4 items-end flex-wrap">
                    <div>
                        <label className="block text-sm font-medium">Buscar por nombre/email:</label>
                        <input 
                            type="text" 
                            name="search" 
                            defaultValue={search}
                            className="border rounded px-3 py-2 w-64"
                            placeholder="Buscar estudiante..."
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Buscar
                    </button>
                </form>
            </div>
            
            <div className="mb-4 flex gap-2 flex-wrap">
                <span className="font-medium">Filtrar por nivel de riesgo:</span>
                {['todos', 'ALTO', 'MEDIO', 'BAJO'].map((n) => (
                    <Link 
                        key={n}
                        href={`/Dashboard/Home/3?nivelRiesgo=${n}&search=${search}&page=1`}
                        className={`px-3 py-1 rounded ${
                            nivelRiesgo === n ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {n}
                    </Link>
                ))}
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Nombre</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Período</th>
                            <th className="px-4 py-2 border">Promedio</th>
                            <th className="px-4 py-2 border">% Asistencia</th>
                            <th className="px-4 py-2 border">Nivel Riesgo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border text-center">{row.id_student}</td>
                                <td className="px-4 py-2 border">{row.student_name}</td>
                                <td className="px-4 py-2 border">{row.email}</td>
                                <td className="px-4 py-2 border">{row.term}</td>
                                <td className="px-4 py-2 border text-right">{Number(row.promedio_calificaciones).toFixed(2)}</td>
                                <td className="px-4 py-2 border text-right">{Number(row.porcentaje_asistencia).toFixed(1)}%</td>
                                <td className="px-4 py-2 border text-center">
                                    <span className={`px-2 py-1 rounded ${
                                        row.nivel_riesgo === 'ALTO' ? 'bg-red-200 text-red-800' :
                                        row.nivel_riesgo === 'MEDIO' ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-green-200 text-green-800'
                                    }`}>
                                        {row.nivel_riesgo}
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
                            href={`/Dashboard/Home/3?nivelRiesgo=${nivelRiesgo}&search=${search}&page=${pagination.page - 1}`}
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
                            href={`/Dashboard/Home/3?nivelRiesgo=${nivelRiesgo}&search=${search}&page=${pagination.page + 1}`}
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