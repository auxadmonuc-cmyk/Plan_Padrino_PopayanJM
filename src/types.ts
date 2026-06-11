/**
 * Types and Interfaces for the Padrinamiento Onboarding Application
 */

export type UserRole = 'Administrador' | 'Consulta';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  email: string;
  password?: string;
}

export type CollaboratorStatus = 'Activo' | 'Retirado';

export type MilestoneStatus = 'Pendiente' | 'En proceso' | 'Completado';

export type FileType = 'pdf' | 'word' | 'excel' | 'image' | 'video';

export interface Evidence {
  id: string;
  fileName: string;
  fileType: FileType;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string; // Base64 or object URL simulated
}

export interface Milestone {
  scheduledDate: string; // YYYY-MM-DD
  executedDate?: string; // YYYY-MM-DD
  status: MilestoneStatus;
  remarks: string;
  evidences: Evidence[];
}

export interface Collaborator {
  id: string; // can be same as documentId
  documentId: string; // Documento de identidad
  fullName: string;
  avatar?: string; // Foto/Avatar del colaborador (Base64 data URL)
  role: string; // Cargo
  area: string; // Área
  costCenter: string; // Centro de costo
  company: string; // Empresa
  immediateBoss: string; // Jefe inmediato
  entryDate: string; // Fecha de ingreso
  email: string;
  phone: string;
  status: CollaboratorStatus;
  induction: Milestone;
  day7: Milestone;
  day30: Milestone;
  day90: Milestone;
  padrinoId?: string; // ID del padrino encargado
  padrinoName?: string; // Nombre del padrino encargado
}

export interface Padrino {
  id: string;
  documentId: string;
  fullName: string;
  role: string;
  area: string;
  company: string;
  email: string;
  phone: string;
  isActive: boolean;
  avatar?: string; // Base64 data URL for Padrino's photo
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userFullName: string;
  action: string; // e.g. 'Registro de colaborador', 'Actualización Día 7', 'Carga de evidencia'
  targetName: string; // e.g. 'Juan Pérez'
  details: string;
}

export interface Alert {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  milestoneName: 'Inducción' | 'Día 7' | 'Día 30' | 'Día 90';
  scheduledDate: string;
  daysRemaining: number; // Positive for upcoming, negative for overdue
  type: 'warning-5' | 'warning-3' | 'overdue'; // corresponding to 5 days, 3 days, or overdue
}
