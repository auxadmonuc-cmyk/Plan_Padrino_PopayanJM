import { Collaborator, User, AuditLog, Alert, MilestoneStatus } from './types';

// Standard test users
export const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    fullName: 'Administrador de Talento Humano',
    role: 'Administrador',
    isActive: true,
    email: 'admin.th@empresa.com',
    password: 'admin'
  },
  {
    id: 'u2',
    username: 'consulta',
    fullName: 'Consulta de Talento Humano',
    role: 'Consulta',
    isActive: true,
    email: 'consulta.th@empresa.com',
    password: 'consulta'
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Helper to get raw date string from today
export function getDiffInDays(dateStr1: string, dateStr2: string = '2026-06-06'): number {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Function to calculate alerts based on dates
export function calculateAlerts(collaborators: Collaborator[], currentDateStr: string = '2026-06-06'): Alert[] {
  const alerts: Alert[] = [];

  // Only active collaborators have pending alerts
  const activeColabs = collaborators.filter(c => c.status === 'Activo');

  activeColabs.forEach(c => {
    const milestones: { name: 'Inducción' | 'Día 7' | 'Día 30' | 'Día 90'; info: typeof c.day7 }[] = [
      { name: 'Inducción', info: c.induction || { status: 'Pendiente', scheduledDate: c.entryDate, remarks: '', evidences: [] } },
      { name: 'Día 7', info: c.day7 || { status: 'Pendiente', scheduledDate: c.entryDate, remarks: '', evidences: [] } },
      { name: 'Día 30', info: c.day30 || { status: 'Pendiente', scheduledDate: c.entryDate, remarks: '', evidences: [] } },
      { name: 'Día 90', info: c.day90 || { status: 'Pendiente', scheduledDate: c.entryDate, remarks: '', evidences: [] } }
    ];

    milestones.forEach(m => {
      if (m.info.status !== 'Completado') {
        const daysRemaining = getDiffInDays(m.info.scheduledDate, currentDateStr);
        
        // Alerts triggers:
        // Overdue: daysRemaining < 0
        // Warning 3 days: daysRemaining >= 0 && daysRemaining <= 3
        // Warning 5 days: daysRemaining > 3 && daysRemaining <= 5
        if (daysRemaining < 0) {
          alerts.push({
            id: `alert-${c.id}-${m.name}-overdue`,
            collaboratorId: c.id,
            collaboratorName: c.fullName,
            milestoneName: m.name,
            scheduledDate: m.info.scheduledDate,
            daysRemaining,
            type: 'overdue'
          });
        } else if (daysRemaining === 3 || daysRemaining === 2 || daysRemaining === 1 || daysRemaining === 0) {
          alerts.push({
            id: `alert-${c.id}-${m.name}-warning3`,
            collaboratorId: c.id,
            collaboratorName: c.fullName,
            milestoneName: m.name,
            scheduledDate: m.info.scheduledDate,
            daysRemaining,
            type: 'warning-3'
          });
        } else if (daysRemaining === 5 || daysRemaining === 4) {
          alerts.push({
            id: `alert-${c.id}-${m.name}-warning5`,
            collaboratorId: c.id,
            collaboratorName: c.fullName,
            milestoneName: m.name,
            scheduledDate: m.info.scheduledDate,
            daysRemaining,
            type: 'warning-5'
          });
        }
      }
    });
  });

  return alerts;
}

// Helper to calculate milestone color based on state/date
export function getMilestoneStatusColor(status: MilestoneStatus, scheduledDate: string, currentDateStr: string = '2026-06-06'): {
  color: string;
  name: string;
  badgeBg: string;
  border: string;
} {
  if (status === 'Completado') {
    return {
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      name: 'Completado',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-500'
    };
  }
  
  const daysDiff = getDiffInDays(scheduledDate, currentDateStr);
  
  if (daysDiff < 0) {
    return {
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      name: 'Vencido',
      badgeBg: 'bg-rose-100 text-rose-800',
      border: 'border-rose-500'
    };
  } else if (daysDiff <= 5 && daysDiff >= 0) {
    return {
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      name: 'Próximo a vencer',
      badgeBg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-500'
    };
  } else {
    return {
      color: 'text-slate-500 bg-slate-50 border-slate-200',
      name: 'Pendiente',
      badgeBg: 'bg-slate-100 text-slate-800',
      border: 'border-slate-300'
    };
  }
}
