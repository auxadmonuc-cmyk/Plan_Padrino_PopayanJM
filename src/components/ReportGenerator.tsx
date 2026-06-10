import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Briefcase, 
  DollarSign, 
  BadgeHelp,
  Loader2,
  Calendar
} from 'lucide-react';
import { Collaborator, UserRole } from '../types';
import { getDiffInDays } from '../demoData';

interface ReportGeneratorProps {
  collaborators: Collaborator[];
  userRole: UserRole;
  onLogAudit: (action: string, target: string, details: string) => void;
}

type ReportType = 'cumplimiento' | 'vencidos' | 'seguimientos_realizados' | 'avance_area' | 'avance_empresa' | 'avance_costo';

export default function ReportGenerator({
  collaborators,
  userRole,
  onLogAudit
}: ReportGeneratorProps) {

  const SIM_DATE = '2026-06-06';
  const [selectedReport, setSelectedReport] = useState<ReportType>('cumplimiento');
  const [isExporting, setIsExporting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null);

  // Filter and process data based on selected report
  const processedData = useMemo(() => {
    const active = collaborators.filter(c => c.status === 'Activo');

    switch (selectedReport) {
      case 'cumplimiento': {
        // Full list of active collaborators and their completions and % progress
        return active.map(c => {
          const countInd = c.induction?.status === 'Completado' ? 1 : 0;
          const count7 = c.day7.status === 'Completado' ? 1 : 0;
          const count30 = c.day30.status === 'Completado' ? 1 : 0;
          const count90 = c.day90.status === 'Completado' ? 1 : 0;
          const pct = Math.round(((countInd + count7 + count30 + count90) / 4) * 100);
          return {
            id: c.documentId,
            fullName: c.fullName,
            cargo: c.role,
            area: c.area,
            empresa: c.company,
            centroCosto: c.costCenter,
            avance: `${pct}%`,
            avanceNum: pct,
            ingreso: c.entryDate,
            induction: c.induction?.status || 'Pendiente',
            day7: c.day7.status,
            day30: c.day30.status,
            day90: c.day90.status,
          };
        }).filter(item => 
          item.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.id.includes(searchFilter) ||
          item.area.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      case 'vencidos': {
        // List of all overdue milestones
        const list: any[] = [];
        active.forEach(c => {
          const milestones = [
            { name: 'Inducción', data: c.induction || { status: 'Pendiente', scheduledDate: c.entryDate, evidences: [] } },
            { name: 'Día 7', data: c.day7 },
            { name: 'Día 30', data: c.day30 },
            { name: 'Día 90', data: c.day90 }
          ];

          milestones.forEach(m => {
            if (m.data.status !== 'Completado') {
              const diff = getDiffInDays(m.data.scheduledDate, SIM_DATE);
              if (diff < 0) {
                list.push({
                  id: c.documentId,
                  fullName: c.fullName,
                  area: c.area,
                  empresa: c.company,
                  hito: m.name,
                  programado: m.data.scheduledDate,
                  estado: m.data.status,
                  diasMora: Math.abs(diff),
                  jefe: c.immediateBoss,
                });
              }
            }
          });
        });

        return list.filter(item => 
          item.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.hito.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.area.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      case 'seguimientos_realizados': {
        // Completed milestones
        const list: any[] = [];
        collaborators.forEach(c => {
          const milestones = [
            { name: 'Inducción', data: c.induction || { status: 'Pendiente', scheduledDate: c.entryDate, evidences: [] } },
            { name: 'Día 7', data: c.day7 },
            { name: 'Día 30', data: c.day30 },
            { name: 'Día 90', data: c.day90 }
          ];

          milestones.forEach(m => {
            if (m.data.status === 'Completado') {
              list.push({
                id: c.documentId,
                fullName: c.fullName,
                area: c.area,
                empresa: c.company,
                hito: m.name,
                programado: m.data.scheduledDate,
                ejecutado: m.data.executedDate || m.data.scheduledDate,
                evidenciasCount: m.data.evidences.length,
                evidenciasList: m.data.evidences.map(e => e.fileName),
                comentarios: m.data.remarks || 'Sin observaciones.',
              });
            }
          });
        });

        return list.filter(item => 
          item.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.hito.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      case 'avance_area': {
        // Metrics grouping by Area
        const areas: { [key: string]: { total: number; completed: number; colabsCount: number } } = {};
        active.forEach(c => {
          const key = c.area || 'Sin Área';
          if (!areas[key]) {
            areas[key] = { total: 0, completed: 0, colabsCount: 0 };
          }
          areas[key].colabsCount++;
          areas[key].total += 4;
          areas[key].completed += (c.induction?.status === 'Completado' ? 1 : 0) +
                                  (c.day7.status === 'Completado' ? 1 : 0) +
                                  (c.day30.status === 'Completado' ? 1 : 0) +
                                  (c.day90.status === 'Completado' ? 1 : 0);
        });

        return Object.keys(areas).map(key => {
          const pct = Math.round((areas[key].completed / areas[key].total) * 100) || 0;
          return {
            grupo: key,
            colaboradores: areas[key].colabsCount,
            hitosPlanificados: areas[key].total,
            hitosCompletados: areas[key].completed,
            porcentaje: `${pct}%`,
            porcentajeNum: pct,
          };
        }).filter(item => item.grupo.toLowerCase().includes(searchFilter.toLowerCase()));
      }

      case 'avance_empresa': {
        // Grouping by Company
        const companies: { [key: string]: { total: number; completed: number; colabsCount: number } } = {};
        active.forEach(c => {
          const key = c.company || 'Sin Empresa';
          if (!companies[key]) {
            companies[key] = { total: 0, completed: 0, colabsCount: 0 };
          }
          companies[key].colabsCount++;
          companies[key].total += 4;
          companies[key].completed += (c.induction?.status === 'Completado' ? 1 : 0) +
                                      (c.day7.status === 'Completado' ? 1 : 0) +
                                      (c.day30.status === 'Completado' ? 1 : 0) +
                                      (c.day90.status === 'Completado' ? 1 : 0);
        });

        return Object.keys(companies).map(key => {
          const pct = Math.round((companies[key].completed / companies[key].total) * 100) || 0;
          return {
            grupo: key,
            colaboradores: companies[key].colabsCount,
            hitosPlanificados: companies[key].total,
            hitosCompletados: companies[key].completed,
            porcentaje: `${pct}%`,
            porcentajeNum: pct,
          };
        }).filter(item => item.grupo.toLowerCase().includes(searchFilter.toLowerCase()));
      }

      case 'avance_costo': {
        // Grouping by Cost Center
        const centers: { [key: string]: { total: number; completed: number; colabsCount: number } } = {};
        active.forEach(c => {
          const key = c.costCenter || 'Sin Centro';
          if (!centers[key]) {
            centers[key] = { total: 0, completed: 0, colabsCount: 0 };
          }
          centers[key].colabsCount++;
          centers[key].total += 4;
          centers[key].completed += (c.induction?.status === 'Completado' ? 1 : 0) +
                                    (c.day7.status === 'Completado' ? 1 : 0) +
                                    (c.day30.status === 'Completado' ? 1 : 0) +
                                    (c.day90.status === 'Completado' ? 1 : 0);
        });

        return Object.keys(centers).map(key => {
          const pct = Math.round((centers[key].completed / centers[key].total) * 100) || 0;
          return {
            grupo: key,
            colaboradores: centers[key].colabsCount,
            hitosPlanificados: centers[key].total,
            hitosCompletados: centers[key].completed,
            porcentaje: `${pct}%`,
            porcentajeNum: pct,
          };
        }).filter(item => item.grupo.toLowerCase().includes(searchFilter.toLowerCase()));
      }

      default:
        return [];
    }
  }, [collaborators, selectedReport, searchFilter]);

  // Handle Export Simulating
  const handleExport = (type: 'excel' | 'pdf') => {
    setExportType(type);
    setIsExporting(true);

    const logLabel = selectedReport.toUpperCase().replace('_', ' ');

    setTimeout(() => {
      onLogAudit(
        `Exportación de Reporte (${type.toUpperCase()})`,
        'Módulo de Reportes',
        `Se genera y descarga reporte de "${logLabel}" para el personal activo.`
      );

      // Simulation download link trick!
      // We convert data to structured CSV with header for Excel, and formatted text for PDF
      const headers = Object.keys(processedData[0] || {}).join(';');
      const rows = processedData.map(row => 
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(';')
      ).join('\n');
      
      const fileContent = `${headers}\n${rows}`;
      const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const filename = `Reporte_${selectedReport}_${type === 'excel' ? 'Onboarding_TH.csv' : 'Onboarding_TH.txt'}`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportType(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Corporate header info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight">
            Centro de Reportes y Descargas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generación de planillas estructuradas de cumplimiento de padrinamiento, análisis demográfico y alertas de vencimiento por áreas.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            id="export_excel_btn"
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-xl transition duration-150 active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Descargar Excel (.xlsx)
          </button>
          <button 
            id="export_pdf_btn"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-xl transition duration-150 active:scale-95"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            Descargar PDF (.pdf)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Reports Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex flex-col gap-2.5 h-full">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 mb-2 block">
            Seleccionar Reporte
          </span>

          {/* Nav Item 1 */}
          <button
            id="r_cumplimiento"
            onClick={() => { setSelectedReport('cumplimiento'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'cumplimiento'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <Award className={`h-4.5 w-4.5 ${selectedReport === 'cumplimiento' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Cumplimiento Padrinamiento</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'cumplimiento' ? 'text-blue-200' : 'text-slate-400'}`}>
                Avance global de colaboradores
              </p>
            </div>
          </button>

          {/* Nav Item 2 */}
          <button
            id="r_vencidos"
            onClick={() => { setSelectedReport('vencidos'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'vencidos'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <AlertTriangle className={`h-4.5 w-4.5 ${selectedReport === 'vencidos' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Actividades Vencidas</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'vencidos' ? 'text-blue-200' : 'text-slate-400'}`}>
                Inducción retrasada o vencida
              </p>
            </div>
          </button>

          {/* Nav Item 3 */}
          <button
            id="r_seguimientos"
            onClick={() => { setSelectedReport('seguimientos_realizados'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'seguimientos_realizados'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <CheckCircle className={`h-4.5 w-4.5 ${selectedReport === 'seguimientos_realizados' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Seguimientos Realizados</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'seguimientos_realizados' ? 'text-blue-200' : 'text-slate-400'}`}>
                Historial de hitos aprobados
              </p>
            </div>
          </button>

          {/* Nav Item 4 */}
          <button
            id="r_area"
            onClick={() => { setSelectedReport('avance_area'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'avance_area'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <Layers className={`h-4.5 w-4.5 ${selectedReport === 'avance_area' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Avance por Área</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'avance_area' ? 'text-blue-200' : 'text-slate-400'}`}>
                Rendimiento por gerencia
              </p>
            </div>
          </button>

          {/* Nav Item 5 */}
          <button
            id="r_empresa"
            onClick={() => { setSelectedReport('avance_empresa'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'avance_empresa'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <Layers className={`h-4.5 w-4.5 ${selectedReport === 'avance_empresa' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Avance por Empresa</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'avance_empresa' ? 'text-blue-200' : 'text-slate-400'}`}>
                Comparativa corporativa sedes
              </p>
            </div>
          </button>

          {/* Nav Item 6 */}
          <button
            id="r_costo"
            onClick={() => { setSelectedReport('avance_costo'); setSearchFilter(''); }}
            className={`w-full text-left p-3.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-3 border ${
              selectedReport === 'avance_costo'
                ? 'bg-blue-900 text-white border-transparent shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
            }`}
          >
            <Layers className={`h-4.5 w-4.5 ${selectedReport === 'avance_costo' ? 'text-amber-400' : 'text-slate-400'}`} />
            <div>
              <span>Avance por C. de Costo</span>
              <p className={`text-[10px] font-medium block mt-0.5 ${selectedReport === 'avance_costo' ? 'text-blue-200' : 'text-slate-400'}`}>
                Detalle por unidades financieras
              </p>
            </div>
          </button>

        </div>

        {/* Report Preview Arena */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col min-h-[480px]">
          
          {/* Action search and bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-500">
                {selectedReport === 'cumplimiento' && 'Vista Previa: Cumplimiento Padrinamiento'}
                {selectedReport === 'vencidos' && 'Vista Previa: Actividades Retrasadas y Alertas'}
                {selectedReport === 'seguimientos_realizados' && 'Vista Previa: Seguimientos Realizados Exitosos'}
                {selectedReport === 'avance_area' && 'Vista Previa: Acumulado por Áreas'}
                {selectedReport === 'avance_empresa' && 'Vista Previa: Acumulado por Empresas'}
                {selectedReport === 'avance_costo' && 'Vista Previa: Acumulado por Centros de Costo'}
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">Mostrando {processedData.length} registros estructurados</p>
            </div>

            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filtrar por nombre grupo..."
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg block pl-8 pr-3 py-1.5 w-full focus:ring-blue-800 focus:border-blue-800"
              />
            </div>
          </div>

          {/* Table representation */}
          <div className="flex-grow overflow-x-auto">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center h-full">
                <BadgeHelp className="h-10 w-10 text-slate-300 mb-2" />
                <span className="font-semibold text-xs text-slate-700">Sin datos en el reporte actual</span>
                <p className="text-3xs max-w-sm mt-0.5">No hay conciliados de auditorías que coincidan con la búsqueda o la categoría.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600 font-sans">
                <thead className="bg-slate-50 text-slate-400 text-3xs font-black uppercase tracking-wider border-b border-slate-100">
                  
                  {/* Cumplimiento headers */}
                  {selectedReport === 'cumplimiento' && (
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Documento</th>
                      <th className="px-4 py-3">Nombre Colaborador</th>
                      <th className="px-4 py-3">Área / Empresa</th>
                      <th className="px-4 py-3 text-center">Inducción</th>
                      <th className="px-4 py-3 text-center">Día 7</th>
                      <th className="px-4 py-3 text-center">Día 30</th>
                      <th className="px-4 py-3 text-center">Día 90</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Progreso</th>
                    </tr>
                  )}

                  {/* Vencidos headers */}
                  {selectedReport === 'vencidos' && (
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Colaborador</th>
                      <th className="px-4 py-3">Área de Trabajo</th>
                      <th className="px-4 py-3">Hito Comercial</th>
                      <th className="px-4 py-3 text-center">Fecha Plan</th>
                      <th className="px-4 py-3 text-center">Mora Real</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Jefe de Área</th>
                    </tr>
                  )}

                  {/* Seguimientos realizados headers */}
                  {selectedReport === 'seguimientos_realizados' && (
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Colaborador</th>
                      <th className="px-4 py-3">Cumplido en</th>
                      <th className="px-4 py-3 text-center">Programado</th>
                      <th className="px-4 py-3 text-center">Realizado</th>
                      <th className="px-4 py-3 text-center">Evidencias</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Comentarios</th>
                    </tr>
                  )}

                  {/* Area, Empresa or Cost Center summarizer headers */}
                  {(selectedReport === 'avance_area' || selectedReport === 'avance_empresa' || selectedReport === 'avance_costo') && (
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Agrupamiento Clave</th>
                      <th className="px-4 py-3 text-center">Total Colaboradores Activos</th>
                      <th className="px-4 py-3 text-center">Hitos Planificados</th>
                      <th className="px-4 py-3 text-center">Hitos Ejecutados</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Porcentaje de Cumplimiento</th>
                    </tr>
                  )}

                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  
                  {/* Cumplimiento rows */}
                  {selectedReport === 'cumplimiento' && processedData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-mono text-3xs text-slate-500">{row.id}</td>
                      <td className="px-4 py-3">
                        <span className="text-slate-900 block">{row.fullName}</span>
                        <span className="text-3xs text-slate-400 font-medium block mt-0.5">{row.cargo}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium text-3xs">
                        <span>{row.area}</span><br />
                        <span className="text-slate-400">{row.empresa}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          row.induction === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>{row.induction}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          row.day7 === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>{row.day7}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          row.day30 === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>{row.day30}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          row.day90 === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>{row.day90}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        <span className="text-blue-800">{row.avance}</span>
                      </td>
                    </tr>
                  ))}

                  {/* Vencidos rows */}
                  {selectedReport === 'vencidos' && processedData.map((row: any, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-xs">
                        <span className="font-bold text-slate-900 block">{row.fullName}</span>
                        <span className="text-3xs text-slate-400 font-mono">Doc: {row.id}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium text-3xs">
                        <span>{row.area}</span><br />
                        <span className="text-slate-400">{row.empresa}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-bold">{row.hito}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">{row.programado}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-rose-600">
                        {row.diasMora} días de retraso
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium">{row.jefe}</td>
                    </tr>
                  ))}

                  {/* Seguimientos realizados rows */}
                  {selectedReport === 'seguimientos_realizados' && processedData.map((row: any, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{row.fullName}</span>
                        <span className="text-3xs text-slate-400 block mt-0.5">{row.area} • {row.empresa}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-900">{row.hito}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">{row.programado}</td>
                      <td className="px-4 py-3 text-center font-mono text-emerald-800 bg-emerald-50/20">{row.ejecutado}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-500">
                        <div>{row.evidenciasCount} {row.evidenciasCount === 1 ? 'archivo' : 'archivos'}</div>
                        {row.evidenciasList && row.evidenciasList.length > 0 && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-1 max-w-[170px] truncate mx-auto bg-slate-50 p-1 rounded border border-slate-100" title={row.evidenciasList.join(', ')}>
                            {row.evidenciasList.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-3xs text-slate-400 italic font-medium max-w-[180px] truncate" title={row.comentarios}>
                        "{row.comentarios}"
                      </td>
                    </tr>
                  ))}

                  {/* Area, Empresa or Cost Center rows */}
                  {(selectedReport === 'avance_area' || selectedReport === 'avance_empresa' || selectedReport === 'avance_costo') && processedData.map((row: any, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-slate-800 font-bold text-xs">{row.grupo}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{row.colaboradores} activos</td>
                      <td className="px-4 py-3 text-center text-slate-500">{row.hitosPlanificados}</td>
                      <td className="px-4 py-3 text-center text-emerald-800">{row.hitosCompletados}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        <span className="text-blue-900 text-xs">{row.porcentaje}</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full inline-block ml-3 overflow-hidden align-middle">
                          <div className="bg-amber-500 h-1.5" style={{ width: `${row.porcentajeNum}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            )}
          </div>

          {/* Simulated progress load overlay */}
          {isExporting && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center z-50">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center gap-3.5 text-center">
                <Loader2 className="h-9 w-9 text-amber-500 animate-spin" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                    Procesando Archivo Corporativo
                  </h4>
                  <p className="text-3xs text-slate-500 mt-1">
                    Exportando {processedData.length} registros como {exportType === 'excel' ? 'planilla CSV (.csv)' : 'documento de texto (.txt)'}...
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
