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

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'c001',
    documentId: '1234567890',
    fullName: 'Juan Carlos Rodríguez',
    role: 'Ingeniero de Sistemas',
    area: 'Tecnología',
    costCenter: 'CC-001',
    company: 'Plan Padrino Popayán',
    immediateBoss: 'María González López',
    entryDate: '2026-05-27',
    email: 'juan.rodriguez@empresa.com',
    phone: '+57 3001234567',
    status: 'Activo',
    padrinoId: 'p001',
    padrinoName: 'Carlos Alberto Pérez',
    induction: {
      scheduledDate: '2026-05-27',
      executedDate: '2026-05-27',
      status: 'Completado',
      remarks: 'Inducción exitosa completada',
      evidences: []
    },
    day7: {
      scheduledDate: '2026-06-03',
      executedDate: '2026-06-03',
      status: 'Completado',
      remarks: 'Primera semana de adaptación completada',
      evidences: []
    },
    day30: {
      scheduledDate: '2026-06-26',
      executedDate: undefined,
      status: 'En proceso',
      remarks: 'Evaluación a los 30 días en progreso',
      evidences: []
    },
    day90: {
      scheduledDate: '2026-08-25',
      executedDate: undefined,
      status: 'Pendiente',
      remarks: '',
      evidences: []
    }
  },
  {
    id: 'c002',
    documentId: '0987654321',
    fullName: 'Ana María Gómez Martínez',
    role: 'Analista de RRHH',
    area: 'Talento Humano',
    costCenter: 'CC-002',
    company: 'Plan Padrino Popayán',
    immediateBoss: 'Patricia Sánchez Ruiz',
    entryDate: '2026-06-02',
    email: 'ana.gomez@empresa.com',
    phone: '+57 3009876543',
    status: 'Activo',
    padrinoId: 'p002',
    padrinoName: 'Laura Fernández García',
    induction: {
      scheduledDate: '2026-06-02',
      executedDate: '2026-06-02',
      status: 'Completado',
      remarks: 'Inducción completada con éxito',
      evidences: []
    },
    day7: {
      scheduledDate: '2026-06-09',
      executedDate: undefined,
      status: 'Pendiente',
      remarks: '',
      evidences: []
    },
    day30: {
      scheduledDate: '2026-07-02',
      executedDate: undefined,
      status: 'Pendiente',
      remarks: '',
      evidences: []
    },
    day90: {
      scheduledDate: '2026-09-01',
      executedDate: undefined,
      status: 'Pendiente',
      remarks: '',
      evidences: []
    }
  },
  {
    id: 'c003',
    documentId: '1111111111',
    fullName: 'Miguel Ángel López Castro',
    role: 'Diseñador Gráfico',
    area: 'Marketing',
    costCenter: 'CC-003',
    company: 'Plan Padrino Popayán',
    immediateBoss: 'Roberto Díaz Flores',
    entryDate: '2026-05-01',
    email: 'miguel.lopez@empresa.com',
    phone: '+57 3015555555',
    status: 'Retirado',
    padrinoId: 'p001',
    padrinoName: 'Carlos Alberto Pérez',
    induction: {
      scheduledDate: '2026-05-01',
      executedDate: '2026-05-01',
      status: 'Completado',
      remarks: 'Inducción completada',
      evidences: []
    },
    day7: {
      scheduledDate: '2026-05-08',
      executedDate: '2026-05-08',
      status: 'Completado',
      remarks: 'Primera semana completada',
      evidences: []
    },
    day30: {
      scheduledDate: '2026-05-31',
      executedDate: '2026-05-31',
      status: 'Completado',
      remarks: 'Evaluación a 30 días completada - Desempeño excelente',
      evidences: []
    },
    day90: {
      scheduledDate: '2026-07-30',
      executedDate: undefined,
      status: 'Pendiente',
      remarks: '',
      evidences: []
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log001',
    timestamp: '2026-06-16T10:30:00Z',
    userId: 'u1',
    userFullName: 'Administrador de Talento Humano',
    action: 'CREATE',
    targetName: 'Juan Carlos Rodríguez',
    entity: 'Collaborator',
    entityId: 'c001',
    details: 'Nuevo colaborador registrado: Juan Carlos Rodríguez',
    changes: { status: 'Activo', fullName: 'Juan Carlos Rodríguez' }
  },
  {
    id: 'log002',
    timestamp: '2026-06-03T14:15:00Z',
    userId: 'u1',
    userFullName: 'Administrador de Talento Humano',
    action: 'UPDATE',
    targetName: 'Juan Carlos Rodríguez',
    entity: 'Milestone',
    entityId: 'c001_day7',
    details: 'Hito "Día 7" marcado como completado para Juan Carlos Rodríguez',
    changes: { status: 'Completado', executedDate: '2026-06-03' }
  },
  {
    id: 'log003',
    timestamp: '2026-06-02T09:00:00Z',
    userId: 'u1',
    userFullName: 'Administrador de Talento Humano',
    action: 'CREATE',
    targetName: 'Ana María Gómez Martínez',
    entity: 'Collaborator',
    entityId: 'c002',
    details: 'Nuevo colaborador registrado: Ana María Gómez Martínez',
    changes: { status: 'Activo', fullName: 'Ana María Gómez Martínez' }
  },
  {
    id: 'log004',
    timestamp: '2026-06-01T16:45:00Z',
    userId: 'u1',
    userFullName: 'Administrador de Talento Humano',
    action: 'UPDATE',
    targetName: 'Miguel Ángel López Castro',
    entity: 'Collaborator',
    entityId: 'c003',
    details: 'Estado del colaborador actualizado a Retirado: Miguel Ángel López Castro',
    changes: { status: 'Retirado' }
  }
];

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
