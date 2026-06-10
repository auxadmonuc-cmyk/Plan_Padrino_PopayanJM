import React, { useMemo } from 'react';
import { 
  Users, 
  CircleDot, 
  FileCheck, 
  AlertTriangle, 
  Percent, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Building2, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Collaborator, Alert } from '../types';
import { calculateAlerts, getDiffInDays } from '../demoData';

interface DashboardProps {
  collaborators: Collaborator[];
  onSelectCollaborator: (id: string) => void;
  onNavigateToSection: (section: string) => void;
}

export default function Dashboard({ 
  collaborators, 
  onSelectCollaborator, 
  onNavigateToSection 
}: DashboardProps) {

  // Current simulation date is June 6, 2026
  const SIM_DATE = '2026-06-06';

  const stats = useMemo(() => {
    const active = collaborators.filter(c => c.status === 'Activo');
    const retired = collaborators.filter(c => c.status === 'Retirado');

    let completedAllCount = 0;
    let inProcessCount = 0;
    let totallyPendingCount = 0;

    let totalMilestonesCount = active.length * 4;
    let completedMilestonesCount = 0;

    active.forEach(c => {
      const inductionCompl = c.induction?.status === 'Completado';
      const day7Compl = c.day7?.status === 'Completado';
      const day30Compl = c.day30?.status === 'Completado';
      const day90Compl = c.day90?.status === 'Completado';

      const completedCount = (inductionCompl ? 1 : 0) + (day7Compl ? 1 : 0) + (day30Compl ? 1 : 0) + (day90Compl ? 1 : 0);

      if (completedCount === 4) {
        completedAllCount++;
      } else if (completedCount > 0 || c.induction?.status === 'En proceso' || c.day7?.status === 'En proceso' || c.day30?.status === 'En proceso' || c.day90?.status === 'En proceso') {
        inProcessCount++;
      } else {
        totallyPendingCount++;
      }

      completedMilestonesCount += completedCount;
    });

    const activeAlerts = calculateAlerts(collaborators, SIM_DATE);
    const overdueCount = activeAlerts.filter(a => a.type === 'overdue').length;
    const warning3Count = activeAlerts.filter(a => a.type === 'warning-3').length;
    const warning5Count = activeAlerts.filter(a => a.type === 'warning-5').length;

    const complianceRate = totalMilestonesCount > 0 
      ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) 
      : 0;

    return {
      totalActive: active.length,
      totalRetired: retired.length,
      completedAll: completedAllCount,
      inProcess: inProcessCount,
      totallyPending: totallyPendingCount,
      totalMilestones: totalMilestonesCount,
      completedMilestones: completedMilestonesCount,
      complianceRate,
      activeAlerts,
      overdueCount,
      upcomingExpiries: warning3Count + warning5Count,
    };
  }, [collaborators]);

  // Data for Charts
  // 1. Milestone Status Distribution
  const milestoneDistributionData = useMemo(() => {
    const active = collaborators.filter(c => c.status === 'Activo');
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    let pending = 0;

    active.forEach(c => {
      [c.induction || { status: 'Pendiente', scheduledDate: c.entryDate, evidences: [] }, c.day7, c.day30, c.day90].forEach(m => {
        if (m.status === 'Completado') {
          completed++;
        } else if (m.status === 'En proceso') {
          inProgress++;
        } else {
          // Pendiente - could be overdue or clean pending
          const days = getDiffInDays(m.scheduledDate, SIM_DATE);
          if (days < 0) {
            overdue++;
          } else {
            pending++;
          }
        }
      });
    });

    return [
      { name: 'Completados', value: completed, color: '#10b981' }, // emerald-500
      { name: 'En Proceso', value: inProgress, color: '#0ea5e9' }, // sky-500
      { name: 'Vencidos', value: overdue, color: '#f43f5e' }, // rose-500
      { name: 'Pendientes a Tiempo', value: pending, color: '#cbd5e1' } // slate-300
    ].filter(item => item.value > 0);
  }, [collaborators]);

  // 2. Compliance by Area
  const analyticsByArea = useMemo(() => {
    const areas: { [key: string]: { total: number; completed: number } } = {};
    const active = collaborators.filter(c => c.status === 'Activo');

    active.forEach(c => {
      const area = c.area || 'Sin Área';
      if (!areas[area]) {
        areas[area] = { total: 0, completed: 0 };
      }
      areas[area].total += 4;
      areas[area].completed += (c.induction?.status === 'Completado' ? 1 : 0) +
                                (c.day7?.status === 'Completado' ? 1 : 0) +
                                (c.day30?.status === 'Completado' ? 1 : 0) +
                                (c.day90?.status === 'Completado' ? 1 : 0);
    });

    return Object.keys(areas).map(key => {
      const pct = Math.round((areas[key].completed / areas[key].total) * 100);
      return {
        area: key,
        Completados: areas[key].completed,
        Total: areas[key].total,
        Cumplimiento: pct
      };
    });
  }, [collaborators]);

  // 3. Status by Company
  const analyticsByCompany = useMemo(() => {
    const companies: { [key: string]: { total: number; completed: number } } = {};
    const active = collaborators.filter(c => c.status === 'Activo');

    active.forEach(c => {
      const comp = c.company || 'Sin Empresa';
      if (!companies[comp]) {
        companies[comp] = { total: 0, completed: 0 };
      }
      companies[comp].total += 1;
      const allDone = (c.induction?.status === 'Completado') && c.day7?.status === 'Completado' && c.day30?.status === 'Completado' && c.day90?.status === 'Completado';
      companies[comp].completed += allDone ? 1 : 0;
    });

    return Object.keys(companies).map(key => {
      return {
        empresa: key,
        'Padrinamientos Totales': companies[key].total,
        'Onboardings Cerrados': companies[key].completed,
      };
    });
  }, [collaborators]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
            Panel de Control de Padrinamiento
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Información en tiempo real del onboarding y planes de padrinamiento para el período de inducción. Evaluaciones automáticas al <span className="font-semibold text-slate-700">06/06/2026</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            id="go_register"
            onClick={() => onNavigateToSection('colaboradores')} 
            className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 shadow-2xs rounded-lg transition"
          >
            Registrar Colaborador
          </button>
          <button 
            id="go_reports"
            onClick={() => onNavigateToSection('reportes')} 
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-xs rounded-lg transition"
          >
            Exportar Reportes
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        
        {/* Metric 1 */}
        <div id="metric_active_colabs" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Colaboradores Activos</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-950">{stats.totalActive}</h3>
            <p className="text-2xs text-slate-500 mt-1">Registrados activos</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric_in_process" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">En Proceso</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800">
              <CircleDot className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-950">{stats.inProcess}</h3>
            <p className="text-2xs text-slate-500 mt-1">Seguimiento activo</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric_pending" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Totalmente Pendientes</span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-950">{stats.totallyPending}</h3>
            <p className="text-2xs text-slate-500 mt-1">Sin hitos cargados</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric_completed" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Padrinamientos Listos</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-950">{stats.completedAll}</h3>
            <p className="text-2xs text-slate-500 mt-1">7, 30 y 90 d cerrados</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div id="metric_warnings" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Alertas Próximas</span>
            <div className={`p-2.5 rounded-xl ${stats.upcomingExpiries > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-950">{stats.upcomingExpiries}</h3>
            <p className="text-2xs text-slate-500 mt-1">Faltan 3 o 5 días</p>
          </div>
        </div>

        {/* Metric 6 */}
        <div id="metric_compliance" className="bg-blue-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-blue-300 text-xs font-semibold tracking-wide uppercase">% Cumplimiento</span>
            <div className="p-2.5 rounded-xl bg-blue-900/50 text-amber-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-amber-400">{stats.complianceRate}%</h3>
            <p className="text-2xs text-blue-200 mt-1">Metas alcanzadas</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Alerts Hub and Interactive List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Dynamic Alerts System */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full">
            <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  Alertas Generadas
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Detección oportuna de demoras</p>
              </div>
              <span className="text-2xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-100">
                {stats.activeAlerts.length} En total
              </span>
            </div>

            {stats.activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center flex-grow">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2.5" />
                <span className="font-medium text-sm text-slate-700">¡Todo al día!</span>
                <p className="text-xs max-w-[200px] mt-1">No hay alertas activas de vencimientos próximos ni hitos demorados.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1 flex-grow">
                {stats.activeAlerts.map(alert => {
                  const isOverdue = alert.type === 'overdue';
                  const isWarning3 = alert.type === 'warning-3';
                  const isWarning5 = alert.type === 'warning-5';

                  return (
                    <div 
                      key={alert.id}
                      onClick={() => onSelectCollaborator(alert.collaboratorId)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-2 relative overflow-hidden group hover:shadow-xs active:scale-98 ${
                        isOverdue 
                          ? 'bg-rose-50/40 hover:bg-rose-50 border-rose-100' 
                          : isWarning3 
                          ? 'bg-amber-50/30 hover:bg-amber-50 border-amber-200' 
                          : 'bg-indigo-50/20 hover:bg-indigo-50 border-indigo-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight group-hover:text-blue-900 transition">
                            {alert.collaboratorName}
                          </h4>
                          <span className="text-2xs font-medium text-slate-500 block mt-0.5">
                            Fase: <strong className="text-slate-700 font-semibold">{alert.milestoneName}</strong>
                          </span>
                        </div>

                        <span className={`text-3xs font-extrabold px-2 py-0.5 rounded ${
                          isOverdue 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : isWarning3 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {isOverdue 
                            ? 'VENCIDA' 
                            : isWarning3 
                            ? 'DÍA -3' 
                            : 'DÍA -5'
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-2xs pt-1.5 border-t border-slate-100/50">
                        <span className="text-slate-500">
                          {isOverdue 
                            ? `Retraso: ${Math.abs(alert.daysRemaining)} días` 
                            : `Faltan ${alert.daysRemaining} días`
                          }
                        </span>
                        <div className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                          Ir a ficha <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Graphics integration */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Chart 1: Milestone states */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-800" />
                  Hitos de Seguimiento Activos
                </h3>
                <p className="text-3xs text-slate-400 mt-0.5">Distribución total de hitos en activos</p>
              </div>

              <div className="flex-grow flex items-center justify-center p-2" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={milestoneDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {milestoneDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={9}
                      wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Compliance by company or closing */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Building2 className="h-4.5 w-4.5 text-blue-800" />
                  Cierres por Empresa
                </h3>
                <p className="text-3xs text-slate-400 mt-0.5">Colaboradores con ciclo de padrinamiento cerrado</p>
              </div>

              <div className="flex-grow flex items-center justify-center p-1" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart
                    data={analyticsByCompany}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="empresa" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Padrinamientos Totales" fill="#1e3a8a" name="Totales" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Onboardings Cerrados" fill="#eab308" name="Completados (100%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Area Compliance Performance Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Briefcase className="h-4.5 w-4.5 text-blue-800" />
                Cumplimiento General Por Área (%)
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">Porcentaje acumulado de actividades ejecutadas a tiempo</p>
            </div>

            <div style={{ minHeight: '190px' }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  data={analyticsByArea}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                  <YAxis type="category" dataKey="area" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="Cumplimiento" fill="#3b82f6" name="Avance Promedio" radius={[0, 6, 6, 0]} barSize={16}>
                    {analyticsByArea.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Access Grid: Imminent / Active Collaborators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-md font-bold text-slate-900">Vista Rápida de Colaboradores Recientes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Últimos casos registrados y estado de avance global</p>
          </div>
          <button 
            id="view_all_colabs"
            onClick={() => onNavigateToSection('colaboradores')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline transition"
          >
            Ver todos los colaboradores ({collaborators.length}) <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Colaborador</th>
                <th className="px-4 py-3">Cargo / Área</th>
                <th className="px-4 py-3">Ingreso</th>
                <th className="px-4 py-3">Progreso</th>
                <th className="px-4 py-3 text-center">Inducción</th>
                <th className="px-4 py-3 text-center">7 Días</th>
                <th className="px-4 py-3 text-center">30 Días</th>
                <th className="px-4 py-3 text-center">90 Días</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Operaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collaborators.filter(c => c.status === 'Activo').slice(0, 4).map(colab => {
                // calculate progress %
                const cInd = colab.induction?.status === 'Completado' ? 1 : 0;
                const c7 = colab.day7?.status === 'Completado' ? 1 : 0;
                const c30 = colab.day30?.status === 'Completado' ? 1 : 0;
                const c90 = colab.day90?.status === 'Completado' ? 1 : 0;
                const pct = Math.round(((cInd + c7 + c30 + c90) / 4) * 100);

                const getBadge = (status: string, date: string) => {
                  if (status === 'Completado') return <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium bg-emerald-100 text-emerald-800">Cerrado</span>;
                  const d = getDiffInDays(date, SIM_DATE);
                  if (d < 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium bg-rose-100 text-rose-800">Vencido</span>;
                  if (d <= 5) return <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium bg-amber-100 text-amber-800">Próximo</span>;
                  return <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium bg-slate-100 text-slate-600">Pendiente</span>;
                };

                return (
                  <tr key={colab.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 text-xs">{colab.fullName}</div>
                      <div className="text-3xs text-slate-400 mt-0.5">{colab.company} • Doc. {colab.documentId}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-slate-700">{colab.role}</div>
                      <div className="text-3xs text-slate-400 mt-0.5">{colab.area}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{colab.entryDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-3xs font-bold text-slate-700">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">{getBadge(colab.induction?.status || 'Pendiente', colab.induction?.scheduledDate || colab.entryDate)}</td>
                    <td className="px-4 py-3.5 text-center">{getBadge(colab.day7?.status || 'Pendiente', colab.day7?.scheduledDate || colab.entryDate)}</td>
                    <td className="px-4 py-3.5 text-center">{getBadge(colab.day30?.status || 'Pendiente', colab.day30?.scheduledDate || colab.entryDate)}</td>
                    <td className="px-4 py-3.5 text-center">{getBadge(colab.day90?.status || 'Pendiente', colab.day90?.scheduledDate || colab.entryDate)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => onSelectCollaborator(colab.id)}
                        className="p-1 px-2.5 text-3xs font-bold text-blue-800 bg-blue-50 border border-blue-100/30 rounded-lg hover:bg-blue-900 hover:text-white transition active:scale-95"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
