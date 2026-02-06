import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center max-w-4xl mx-auto">
        
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>

        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Sistema de Reportes
        </h1>

        
        <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
          Evaluación C1 - Análisis académico con vistas SQL, Window Functions y
          agregaciones avanzadas
        </p>

        
        <Link
          href="/Dashboard/Home"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
        >
          <span>Ir a Reportes</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-blue-500 rounded-2xl p-6 text-left shadow-md hover:shadow-lg transition-shadow">
            <span className="text-2xl mb-3 block">📊</span>
            <h3 className="text-lg font-semibold text-white mb-2">
              5 Vistas SQL
            </h3>
            <p className="text-blue-100 text-sm">
              Rendimiento, carga docente, estudiantes en riesgo, asistencia y
              rankings
            </p>
          </div>

          <div className="bg-orange-500 rounded-2xl p-6 text-left shadow-md hover:shadow-lg transition-shadow">
            <span className="text-2xl mb-3 block">🔢</span>
            <h3 className="text-lg font-semibold text-white mb-2">
              Window Functions
            </h3>
            <p className="text-orange-100 text-sm">
              RANK, ROW_NUMBER, PERCENT_RANK para análisis avanzado de datos
            </p>
          </div>

          <div className="bg-amber-400 rounded-2xl p-6 text-left shadow-md hover:shadow-lg transition-shadow">
            <span className="text-2xl mb-3 block">⚡</span>
            <h3 className="text-lg font-semibold text-white mb-2">
              Next.js + Zod
            </h3>
            <p className="text-amber-50 text-sm">
              Server Actions con validación de esquemas y paginación eficiente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
