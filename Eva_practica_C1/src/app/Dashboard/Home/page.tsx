import React from 'react';
import ReportCard from './ReportCard';
import TopBar from './TopBar';

export default function ReportsPage() {
    return (
        <div className='reports-page'>
            <TopBar />
            <div className='reports-container'>
                <ReportCard 
                    title='Rendimiento por Curso' 
                    description='Análisis del desempeño académico por curso y período con tasa de reprobación' 
                    href='/Dashboard/Home/1' 
                />
                <ReportCard 
                    title='Carga Docente' 
                    description='Distribución de carga de trabajo entre profesores con HAVING' 
                    href='/Dashboard/Home/2' 
                />
                <ReportCard 
                    title='Estudiantes en Riesgo' 
                    description='Identificación de alumnos en riesgo académico usando CTE' 
                    href='/Dashboard/Home/3' 
                />
                <ReportCard 
                    title='Asistencia por Grupo' 
                    description='Análisis de asistencia con CASE y COALESCE para clasificación' 
                    href='/Dashboard/Home/4' 
                />
                <ReportCard 
                    title='Ranking Estudiantes' 
                    description='Clasificación de estudiantes usando Window Functions (RANK)' 
                    href='/Dashboard/Home/5' 
                />
            </div>
        </div>
    );
}