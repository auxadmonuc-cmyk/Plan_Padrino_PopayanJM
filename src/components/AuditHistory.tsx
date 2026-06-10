import React, { useMemo } from 'react';
import { ShieldCheck, History, Search, Calendar, User, Info, ArrowRight } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditHistoryProps {
  logs: AuditLog[];
}

export default function AuditHistory({ logs }: AuditHistoryProps) {
  const [filterSearch, setFilterSearch] = React.useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.userFullName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(filterSearch.toLowerCase()) ||
      log.targetName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(filterSearch.toLowerCase())
    );
  }, [logs, filterSearch]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
            <History className="h-5 w-5 text-blue-900" />
            Historial de Cambios y Auditoría General
          </h2>
          <p className="text-2xs text-slate-400 mt-0.5">Bitácora secuencial inmutable de modificaciones hechas por los administradores.</p>
        </div>

        {/* Audit Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <input
            type="text"
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Buscar en bitácora..."
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg block pl-8.5 pr-3 py-1.5 w-full focus:ring-blue-800 focus:border-blue-800 font-semibold"
          />
        </div>
      </div>

      {/* Logs stack list */}
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
          <Info className="h-8 w-8 text-slate-300 mb-2" />
          <span className="font-semibold text-xs text-slate-700">Sin bitácoras encontradas</span>
          <p className="text-3xs max-w-sm mt-0.5">Intente con otro descriptor de búsqueda de eventos de auditoría histórica.</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredLogs.map(log => {
            const dateObj = new Date(log.timestamp);
            const displayDate = isNaN(dateObj.getTime()) 
              ? '2026-06-06 14:30' 
              : `${dateObj.toISOString().split('T')[0]} ${dateObj.toTimeString().split(' ')[0].substring(0, 5)} (UTC)`;

            return (
              <div 
                key={log.id} 
                className="bg-slate-50 hover:bg-slate-100/50 p-4 rounded-2xl border border-slate-100 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs group"
              >
                
                {/* Event info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-900 text-amber-400 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">sobre:</span>
                    <span className="font-extrabold text-slate-900 uppercase tracking-tight truncate max-w-[170px]" title={log.targetName}>
                      {log.targetName}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium text-3xs leading-relaxed max-w-xl">
                    {log.details}
                  </p>
                </div>

                {/* Operator info / timestamp */}
                <div className="shrink-0 flex flex-col md:items-end text-3xs font-semibold text-slate-400 gap-1 md:pl-4 border-t md:border-t-0 md:border-l border-slate-200/60 pt-2.5 md:pt-0 leading-normal">
                  <div className="flex items-center gap-1 text-slate-500 font-bold whitespace-nowrap">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>{log.userFullName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap font-mono">
                    <Calendar className="h-3 w-3 text-slate-300" />
                    <span>{displayDate}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Fixed security disclaimer */}
      <div className="bg-blue-50 border border-blue-100/50 rounded-xl p-3 flex items-start gap-2 text-3xs font-medium text-blue-800 leading-normal">
        <ShieldCheck className="h-4.5 w-4.5 text-blue-700 shrink-0 mt-0.5" />
        <span>Bitácora de seguridad activa. Cualquier cambio en fechas autorizadas o subida de evidencias registrará automáticamente la IP remota del operador autorizado en cumplimiento de la Directiva de Auditoría Interna Org-TH.</span>
      </div>

    </div>
  );
}
