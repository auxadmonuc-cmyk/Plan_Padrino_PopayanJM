import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  User, 
  Edit3, 
  UploadCloud, 
  FileText, 
  File, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Tag,
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Clock,
  Trash2,
  Lock,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { Collaborator, Milestone, MilestoneStatus, FileType, Evidence, UserRole, CollaboratorStatus, Padrino } from '../types';
import { getDiffInDays, getMilestoneStatusColor } from '../demoData';
import { compressImage } from '../utils';

interface CollaboratorCardProps {
  collaborator: Collaborator;
  userRole: UserRole;
  onBack: () => void;
  onUpdateCollaborator: (updated: Collaborator) => void;
  onLogAudit: (action: string, target: string, details: string) => void;
  padrinosList: Padrino[];
}

export default function CollaboratorCard({
  collaborator,
  userRole,
  onBack,
  onUpdateCollaborator,
  onLogAudit,
  padrinosList
}: CollaboratorCardProps) {
  
  const isAdmin = userRole === 'Administrador';
  const SIM_DATE = '2026-06-06';

  // Toggle Edit personal info mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState(collaborator.fullName);
  const [editRole, setEditRole] = useState(collaborator.role);
  const [editArea, setEditArea] = useState(collaborator.area);
  const [editCostCenter, setEditCostCenter] = useState(collaborator.costCenter);
  const [editCompany, setEditCompany] = useState(collaborator.company);
  const [editBoss, setEditBoss] = useState(collaborator.immediateBoss);
  const [editEmail, setEditEmail] = useState(collaborator.email);
  const [editPhone, setEditPhone] = useState(collaborator.phone);
  const [editStatus, setEditStatus] = useState<CollaboratorStatus>(collaborator.status);
  const [editAvatar, setEditAvatar] = useState(collaborator.avatar || '');
  const [editPadrinoId, setEditPadrinoId] = useState(collaborator.padrinoId || '');
  const [editEntryDate, setEditEntryDate] = useState(collaborator.entryDate);

  // Selected Milestone for Details / Upload (induction, 7 days, 30 days, 90 days)
  const [selectedTab, setSelectedTab] = useState<'induction' | 'day7' | 'day30' | 'day90'>('induction');

  // Milestone edit states
  const currentMilestone: Milestone = collaborator[selectedTab] || {
    scheduledDate: collaborator.entryDate,
    status: 'Pendiente',
    remarks: '',
    evidences: []
  };
  const [milestoneStatus, setMilestoneStatus] = useState<MilestoneStatus>(currentMilestone.status);
  const [milestoneDate, setMilestoneDate] = useState(currentMilestone.scheduledDate);
  const [milestoneExecutedDate, setMilestoneExecutedDate] = useState(currentMilestone.executedDate || '');
  const [remarks, setRemarks] = useState(currentMilestone.remarks);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

  // Selected image and name for full visualizer modal popup
  const [selectedImageModal, setSelectedImageModal] = useState<{ url: string; name: string } | null>(null);

  // Sync state when tab changes
  React.useEffect(() => {
    setMilestoneStatus(currentMilestone.status);
    setMilestoneDate(currentMilestone.scheduledDate);
    setMilestoneExecutedDate(currentMilestone.executedDate || '');
    setRemarks(currentMilestone.remarks);
    setDragError('');
  }, [selectedTab, collaborator]);

  // Sync edit profile state when collaborator object updates
  React.useEffect(() => {
    setEditFullName(collaborator.fullName);
    setEditRole(collaborator.role);
    setEditArea(collaborator.area);
    setEditCostCenter(collaborator.costCenter);
    setEditCompany(collaborator.company);
    setEditBoss(collaborator.immediateBoss);
    setEditEmail(collaborator.email);
    setEditPhone(collaborator.phone);
    setEditStatus(collaborator.status);
    setEditAvatar(collaborator.avatar || '');
    setEditPadrinoId(collaborator.padrinoId || '');
    setEditEntryDate(collaborator.entryDate);
  }, [collaborator]);

  // Overall progress percentage
  const globalProgressPct = useMemo(() => {
    const cInd = (collaborator.induction?.status === 'Completado') ? 1 : 0;
    const c7 = collaborator.day7.status === 'Completado' ? 1 : 0;
    const c30 = collaborator.day30.status === 'Completado' ? 1 : 0;
    const c90 = collaborator.day90.status === 'Completado' ? 1 : 0;
    return Math.round(((cInd + c7 + c30 + c90) / 4) * 100);
  }, [collaborator]);

  // Calculate milestones meta
  const milestonesMeta = useMemo(() => {
    return {
      induction: getMilestoneStatusColor(collaborator.induction?.status || 'Pendiente', collaborator.induction?.scheduledDate || collaborator.entryDate, SIM_DATE),
      day7: getMilestoneStatusColor(collaborator.day7.status, collaborator.day7.scheduledDate, SIM_DATE),
      day30: getMilestoneStatusColor(collaborator.day30.status, collaborator.day30.scheduledDate, SIM_DATE),
      day90: getMilestoneStatusColor(collaborator.day90.status, collaborator.day90.scheduledDate, SIM_DATE),
    };
  }, [collaborator]);

  // Save personal details modifications
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim() || !editRole.trim()) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const matchedPadrino = padrinosList.find(p => p.id === editPadrinoId);

    // Dynamic projection for matching dates if editEntryDate changed
    let d7Str = collaborator.day7?.scheduledDate || '';
    let d30Str = collaborator.day30?.scheduledDate || '';
    let d90Str = collaborator.day90?.scheduledDate || '';

    try {
      const baseDate = new Date(editEntryDate + 'T00:00:00');
      
      const d7 = new Date(baseDate);
      d7.setDate(baseDate.getDate() + 7);
      d7Str = d7.toISOString().split('T')[0];

      const d30 = new Date(baseDate);
      d30.setDate(baseDate.getDate() + 30);
      d30Str = d30.toISOString().split('T')[0];

      const d90 = new Date(baseDate);
      d90.setDate(baseDate.getDate() + 90);
      d90Str = d90.toISOString().split('T')[0];
    } catch (err) {
      console.error('Error calculando nuevas proyecciones de fecha', err);
    }

    const updatedColab: Collaborator = {
      ...collaborator,
      fullName: editFullName.trim(),
      avatar: editAvatar || undefined,
      role: editRole.trim(),
      area: editArea,
      costCenter: editCostCenter,
      company: editCompany,
      immediateBoss: editBoss,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      status: editStatus,
      entryDate: editEntryDate,
      padrinoId: editPadrinoId || undefined,
      padrinoName: matchedPadrino ? matchedPadrino.fullName : undefined,
      induction: {
        ...(collaborator.induction || {}),
        scheduledDate: collaborator.induction?.status === 'Pendiente' ? editEntryDate : (collaborator.induction?.scheduledDate || editEntryDate),
        status: collaborator.induction?.status || 'Pendiente',
        remarks: collaborator.induction?.remarks || 'Inducción inicial programada para el día de ingreso.',
        evidences: collaborator.induction?.evidences || []
      },
      day7: {
        ...(collaborator.day7 || {}),
        scheduledDate: collaborator.day7?.status === 'Pendiente' ? d7Str : d7Str,
        status: collaborator.day7?.status || 'Pendiente',
        remarks: collaborator.day7?.remarks || 'Planeación inicial automatizada.',
        evidences: collaborator.day7?.evidences || []
      },
      day30: {
        ...(collaborator.day30 || {}),
        scheduledDate: collaborator.day30?.status === 'Pendiente' ? d30Str : d30Str,
        status: collaborator.day30?.status || 'Pendiente',
        remarks: collaborator.day30?.remarks || 'Planeación inicial automatizada.',
        evidences: collaborator.day30?.evidences || []
      },
      day90: {
        ...(collaborator.day90 || {}),
        scheduledDate: collaborator.day90?.status === 'Pendiente' ? d90Str : d90Str,
        status: collaborator.day90?.status || 'Pendiente',
        remarks: collaborator.day90?.remarks || 'Planeación inicial automatizada.',
        evidences: collaborator.day90?.evidences || []
      }
    };

    onUpdateCollaborator(updatedColab);
    onLogAudit(
      'Edición de colaborador',
      updatedColab.fullName,
      `Modificación de campos de perfil corporativo. Estado: ${editStatus}`
    );
    setIsEditMode(false);
  };

  // Save changes to current milestone (Día 7, 30 o 90)
  const handleSaveMilestoneDetails = () => {
    if (!isAdmin) return;

    const updatedMilestone: Milestone = {
      ...currentMilestone,
      status: milestoneStatus,
      scheduledDate: milestoneDate,
      executedDate: milestoneStatus === 'Completado' ? (milestoneExecutedDate || SIM_DATE) : undefined,
      remarks: remarks.trim()
    };

    const updatedColab: Collaborator = {
      ...collaborator,
      [selectedTab]: updatedMilestone
    };

    onUpdateCollaborator(updatedColab);
    onLogAudit(
      `Actualización ${selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'}`,
      collaborator.fullName,
      `Cambio de estado a ${milestoneStatus}. Observaciones: "${remarks.slice(0, 40)}..."`
    );
    
    alert('Información de seguimiento actualizada exitosamente.');
  };

  // Files simulation helper
  const handleFileAttached = (name: string, size: number, dataUrl?: string) => {
    if (!isAdmin) return;

    // Detect format of file to store standard tag
    let type: FileType = 'pdf';
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'docx' || ext === 'doc' || ext === 'rtf') type = 'word';
    else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') type = 'excel';
    else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') type = 'image';
    else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') type = 'video';

    // Check size limit for non-image files to avoid Firestore document 1MB limit crash
    if (type !== 'image' && size > 850 * 1024) {
      alert(`Error de almacenamiento:\nEl archivo "${name}" supera el tamaño máximo permitido de 850 KB.\nPara archivos grandes (PDF, Excel, Videos), por favor cargue un archivo más ligero o simplificado para garantizar que se guarde correctamente en la base de datos Firestore.`);
      return;
    }

    setIsUploading(true);

    const saveEvidence = (finalDataUrl?: string, finalSize?: number) => {
      // Format file size in KBs or MBs
      let sizeStr = '500 KB';
      const activeSize = finalSize !== undefined ? finalSize : size;
      if (activeSize > 1024 * 1024) {
        sizeStr = `${(activeSize / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        sizeStr = `${Math.round(activeSize / 1024)} KB`;
      }

      setTimeout(() => {
        const newEvidence: Evidence = {
          id: `ev-${Date.now()}`,
          fileName: name,
          fileType: type,
          fileSize: sizeStr,
          uploadedAt: SIM_DATE,
          uploadedBy: 'admin',
          url: finalDataUrl
        };

        const updatedMilestone: Milestone = {
          ...currentMilestone,
          evidences: [...currentMilestone.evidences, newEvidence]
        };

        const updatedColab: Collaborator = {
          ...collaborator,
          [selectedTab]: updatedMilestone
        };

        onUpdateCollaborator(updatedColab);
        onLogAudit(
          'Carga de evidencia',
          collaborator.fullName,
          `Archivo "${name}" cargado y asociado a ${selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'}`
        );

        setIsUploading(false);
      }, 900);
    };

    if (type === 'image' && dataUrl) {
      // Compress image to fit within Firebase document bounds optimally
      compressImage(dataUrl, (compressedUrl) => {
        // Calculate estimated size of compressed Base64 string
        const head = compressedUrl.split(',')[0];
        const approxBytes = Math.round((compressedUrl.length - head.length - 1) * 3 / 4);
        saveEvidence(compressedUrl, approxBytes);
      }, 600, 0.7); // 600px max dimension, 70% quality (compact but perfect quality)
    } else {
      saveEvidence(dataUrl, size);
    }
  };

  // Trigger manual select
  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFileAttached(f.name, f.size, reader.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  // Drag over handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragError('');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'mp4', 'mov'];
      const fileExt = f.name.split('.').pop()?.toLowerCase() || '';
      
      if (!validExtensions.includes(fileExt)) {
        setDragError('Formato no permitido. Solo se cargan PDF, Word, Excel, Fotos y Videos.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFileAttached(f.name, f.size, reader.result as string);
      };
      reader.readAsDataURL(f);
    }
  };

  // Safe delete simulated file
  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (!isAdmin) return;

    if (confirm(`¿Estás seguro de que deseas eliminar la evidencia "${fileName}"?`)) {
      const updatedMilestone: Milestone = {
        ...currentMilestone,
        evidences: currentMilestone.evidences.filter(e => e.id !== fileId)
      };

      const updatedColab: Collaborator = {
        ...collaborator,
        [selectedTab]: updatedMilestone
      };

      onUpdateCollaborator(updatedColab);
      onLogAudit(
        'Eliminación de evidencia',
        collaborator.fullName,
        `Se descarta archivo "${fileName}" de ${selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'}`
      );
    }
  };

  // Helper icons logic
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-rose-500 shrink-0" />;
      case 'word':
        return <File className="h-5 w-5 text-blue-500 shrink-0" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-cyan-500 shrink-0" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back connection header */}
      <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-100 shadow-3xs">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-900 transition bg-slate-50 p-2 rounded-xl border border-slate-100 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Listado de Colaboradores
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Avance Global</span>
          <div className="flex items-center gap-2 bg-blue-950 text-white px-3 py-1.5 rounded-xl border border-blue-900/50">
            <span className="text-xs font-extrabold text-amber-400">{globalProgressPct}%</span>
            <div className="w-16 bg-blue-900 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-1" style={{ width: `${globalProgressPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left profile panel, right tracking timeline and evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card left */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-950 text-white p-6 rounded-3xl relative overflow-hidden border border-slate-800 shadow-md">
            
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <User className="h-40 w-40" />
            </div>

            {!isEditMode ? (
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4 items-start justify-between">
                  <div className="flex gap-3.5 items-center">
                     {collaborator.avatar ? (
                      <img 
                        src={collaborator.avatar} 
                        alt={collaborator.fullName}
                        className="h-14 w-14 rounded-full object-cover border-2 border-[#2F5D73] shadow-md shrink-0 cursor-pointer hover:scale-115 hover:border-amber-400 transition-all duration-150"
                        title="Haga clic para ampliar foto de perfil"
                        onClick={() => setSelectedImageModal({ url: collaborator.avatar!, name: collaborator.fullName })}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-extrabold text-sm uppercase font-sans shrink-0">
                        {collaborator.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-extrabold uppercase bg-blue-900/60 text-blue-300">
                        Doc. Identidad
                      </span>
                      <h3 className="text-lg font-extrabold tracking-tight font-sans mt-1 text-white leading-tight">
                        {collaborator.fullName}
                      </h3>
                      <p className="text-2xs text-slate-400 font-mono mt-0.5">{collaborator.documentId}</p>
                    </div>
                  </div>

                  <span className={`inline-flex px-2 py-0.5 rounded-md text-3xs font-black uppercase shrink-0 ${
                    collaborator.status === 'Activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {collaborator.status}
                  </span>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-slate-900 text-xs">
                  
                  {/* Cargo */}
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Cargo Actual</span>
                      <span className="text-slate-200 font-semibold">{collaborator.role}</span>
                    </div>
                  </div>

                  {/* Area */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Área u Operación</span>
                      <span className="text-slate-200 font-semibold">{collaborator.area}</span>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Empresa Razon</span>
                      <span className="text-slate-200 font-semibold">{collaborator.company}</span>
                    </div>
                  </div>

                  {/* Jefe Inmediato */}
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Reporta a (Gerente)</span>
                      <span className="text-slate-200 font-semibold">{collaborator.immediateBoss}</span>
                    </div>
                  </div>

                  {/* Ingreso */}
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Fecha de Contratación</span>
                      <span className="text-slate-200 font-mono font-bold">{collaborator.entryDate}</span>
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Correo Institucional</span>
                      <span className="text-slate-200 truncate block max-w-[200px]">{collaborator.email}</span>
                    </div>
                  </div>

                  {/* Telefono */}
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-slate-500 block font-bold uppercase">Celular Directo</span>
                      <span className="text-slate-200 font-mono">{collaborator.phone}</span>
                    </div>
                  </div>

                  {/* Padrino de Seguimiento */}
                  <div className="flex items-start gap-2.5 bg-blue-900/40 p-2.5 rounded-xl border border-blue-800/60">
                    <User className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-3xs text-amber-400 block font-bold uppercase">Padrino de Seguimiento</span>
                      <span className="text-slate-100 font-bold">{collaborator.padrinoName || 'Sin padrino asignado'}</span>
                    </div>
                  </div>

                </div>

                {isAdmin ? (
                  <button 
                    id="btn_edit_profile"
                    onClick={() => {
                      setEditFullName(collaborator.fullName);
                      setEditRole(collaborator.role);
                      setEditArea(collaborator.area);
                      setEditCostCenter(collaborator.costCenter);
                      setEditCompany(collaborator.company);
                      setEditBoss(collaborator.immediateBoss);
                      setEditEmail(collaborator.email);
                      setEditPhone(collaborator.phone);
                      setEditStatus(collaborator.status);
                      setEditAvatar(collaborator.avatar || '');
                      setEditPadrinoId(collaborator.padrinoId || '');
                      setEditEntryDate(collaborator.entryDate);
                      setIsEditMode(true);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                    Editar Datos Generales
                  </button>
                ) : (
                  <div className="text-center pt-2 text-3xs text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Solo lectura habilitada
                  </div>
                )}
              </div>
            ) : (
              // Edit Profile form
              <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-white/10">
                  Modificar Colaborador
                </h4>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Cargo Técnico *</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Área Operativa</label>
                  <select
                    value={editArea}
                    onChange={e => setEditArea(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500 font-semibold"
                  >
                    <option value="Administrativo">Administrativo</option>
                    <option value="Operativo">Operativo</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase mb-1">Foto del Colaborador</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    {editAvatar ? (
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-xs">
                        <img src={editAvatar} className="w-full h-full object-cover" alt="Edit Avatar" />
                        <button
                          type="button"
                          onClick={() => setEditAvatar('')}
                          className="absolute inset-0 bg-red-950/80 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white text-[9px] font-bold"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0 text-3xs font-bold font-sans">
                        S/F
                      </div>
                    )}
                    <div className="flex-grow">
                      <input
                        type="file"
                        id="edit-avatar-upload"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(f);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="edit-avatar-upload"
                        className="cursor-pointer inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-[#2F5D73]/30 text-slate-300 p-1 px-2.5 rounded-lg text-3xs font-bold transition"
                      >
                        Cambiar Foto...
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Empresa Sede</label>
                  <select
                    value={editCompany}
                    onChange={e => setEditCompany(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500 font-bold"
                  >
                    <option value="Zura Group">Zura Group</option>
                    <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Jefe Inmediato</label>
                  <input
                    type="text"
                    value={editBoss}
                    onChange={e => setEditBoss(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Contacto Celular</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase">Estado Corporativo</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as CollaboratorStatus)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Retirado">Retirado / Desvinculado</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs text-slate-400 block font-extrabold uppercase font-black text-amber-500">Fecha de ingreso</label>
                  <input
                    type="date"
                    value={editEntryDate}
                    onChange={e => setEditEntryDate(e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500 font-bold"
                  />
                </div>

                {/* Selección de Padrino */}
                <div>
                  <label className="text-3xs text-[#2F5D73] font-black block uppercase mb-1">
                    Padrino / Mentor de Seguimiento *
                  </label>
                  <select
                    value={editPadrinoId}
                    onChange={e => setEditPadrinoId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs focus:ring-amber-500 font-bold"
                  >
                    <option value="">-- Sin padrino / seleccionar uno --</option>
                    {padrinosList && padrinosList.filter(p => p.isActive).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.role} - {p.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition shadow-md"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Onboarding Timelines tracker & detail profile right */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Visual Progress representation */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs">
            <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest pb-2 border-b border-slate-100 mb-6 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-500" />
              Línea de Tiempo Visual del Avance
            </h4>

            {/* Time progress bar */}
            <div className="relative mt-8 mb-6 px-4">
              
              {/* Connecting progress line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
              
              {/* Colored active path */}
              <div 
                className="absolute top-1/2 left-4 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ 
                  width: selectedTab === 'induction' ? '0%' : selectedTab === 'day7' ? '33.33%' : selectedTab === 'day30' ? '66.66%' : '100%' 
                }}
              ></div>

              <div className="relative flex justify-between items-center z-10 text-xs text-center">

                {/* Milestone Inducción */}
                <div 
                  onClick={() => setSelectedTab('induction')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-3xs shadow-xs transition-all ${
                    selectedTab === 'induction' ? 'scale-110 ring-4 ring-blue-50' : ''
                  } ${milestonesMeta.induction.border} ${milestonesMeta.induction.color}`}>
                    IND
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-700 mt-2 uppercase">Inducción</span>
                  <span className={`text-[8px] font-black uppercase mt-0.5 p-0.5 px-1.5 rounded ${milestonesMeta.induction.badgeBg}`}>
                    {milestonesMeta.induction.name}
                  </span>
                </div>
                
                {/* Milestone 7 days */}
                <div 
                  onClick={() => setSelectedTab('day7')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    selectedTab === 'day7' ? 'scale-110 ring-4 ring-blue-50' : ''
                  } ${milestonesMeta.day7.border} ${milestonesMeta.day7.color}`}>
                    7d
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-700 mt-2 uppercase">7 Días</span>
                  <span className={`text-[8px] font-black uppercase mt-0.5 p-0.5 px-1.5 rounded ${milestonesMeta.day7.badgeBg}`}>
                    {milestonesMeta.day7.name}
                  </span>
                </div>

                {/* Milestone 30 days */}
                <div 
                  onClick={() => setSelectedTab('day30')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    selectedTab === 'day30' ? 'scale-110 ring-4 ring-blue-50' : ''
                  } ${milestonesMeta.day30.border} ${milestonesMeta.day30.color}`}>
                    30d
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-700 mt-2 uppercase">30 Días</span>
                  <span className={`text-[8px] font-black uppercase mt-0.5 p-0.5 px-1.5 rounded ${milestonesMeta.day30.badgeBg}`}>
                    {milestonesMeta.day30.name}
                  </span>
                </div>

                {/* Milestone 90 days */}
                <div 
                  onClick={() => setSelectedTab('day90')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    selectedTab === 'day90' ? 'scale-110 ring-4 ring-blue-50' : ''
                  } ${milestonesMeta.day90.border} ${milestonesMeta.day90.color}`}>
                    90d
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-700 mt-2 uppercase">90 Días</span>
                  <span className={`text-[8px] font-black uppercase mt-0.5 p-0.5 px-1.5 rounded ${milestonesMeta.day90.badgeBg}`}>
                    {milestonesMeta.day90.name}
                  </span>
                </div>

              </div>
            </div>
            
            {/* Legend guide code */}
            <div className="flex flex-wrap gap-4 justify-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-emerald-500 rounded-full inline-block"></span> Verde = Completado</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-amber-500 rounded-full inline-block"></span> Amarillo = Próximo a vencer</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-rose-500 rounded-full inline-block"></span> Rojo = Vencido</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-slate-300 rounded-full inline-block"></span> Gris = Pendiente</span>
            </div>

          </div>

          {/* Active Milestone tracking form & files upload */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-md font-bold text-slate-900">
                  Seguimiento: {selectedTab === 'induction' ? 'Inducción de Onboarding' : selectedTab === 'day7' ? 'Seguimiento de 7 Días' : selectedTab === 'day30' ? 'Seguimiento de 30 Días' : 'Cierre de 90 Días'}
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">Control de fechas, actas de acuerdos e ingresos de comentarios corporativos.</p>
              </div>

              <div className="flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-100 p-1.5 px-3 rounded-xl text-3xs font-extrabold">
                <Calendar className="h-3.5 w-3.5" />
                Límite: {currentMilestone.scheduledDate}
              </div>
            </div>

            {/* Inputs Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Left Form: Status controllers */}
              <div className="space-y-4">
                
                {/* 1. Status selector */}
                <div>
                  <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-400">Estado del Hito *</label>
                  <select
                    disabled={!isAdmin}
                    value={milestoneStatus}
                    onChange={e => setMilestoneStatus(e.target.value as MilestoneStatus)}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs focus:ring-blue-800 disabled:opacity-75 disabled:cursor-not-allowed font-medium text-slate-800"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>

                {/* 2. Scheduled Date and executed date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-400">Fecha Estimada *</label>
                    <input
                      type="date"
                      disabled={!isAdmin}
                      value={milestoneDate}
                      onChange={e => setMilestoneDate(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 disabled:opacity-75 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-400">Fecha Realización</label>
                    <input
                      type="date"
                      disabled={!isAdmin || milestoneStatus !== 'Completado'}
                      value={milestoneExecutedDate}
                      placeholder="Sin ejecutar"
                      onChange={e => setMilestoneExecutedDate(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 disabled:opacity-50 disabled:bg-slate-100 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Remarks textarea */}
                <div>
                  <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    Observaciones y Retroalimentación
                  </label>
                  <textarea
                    rows={4}
                    disabled={!isAdmin}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Escriba comentarios del padrino o novedades relevantes para la carpeta del colaborador..."
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:ring-blue-800 disabled:opacity-75 resize-none leading-relaxed"
                  />
                </div>

                {/* Save button milestones */}
                {isAdmin && (
                  <button
                    id="save_milestone_details"
                    type="button"
                    onClick={handleSaveMilestoneDetails}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold rounded-xl transition shadow-xs active:scale-98"
                  >
                    Guardar Datos del Seguimiento ({selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? '7 Días' : selectedTab === 'day30' ? '30 Días' : '90 Días'})
                  </button>
                )}

              </div>

              {/* Right Form: Evidences drag and drop list */}
              <div className="flex flex-col h-full space-y-4">
                
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5 text-blue-950 font-bold">
                    <UploadCloud className="h-4 w-4 text-amber-500" />
                    Archivos de Evidencia de {selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'}
                  </span>
                  <span className="bg-amber-100 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                    {selectedTab === 'induction' ? 'Fase Inducción' : selectedTab === 'day7' ? 'Fase 7 días' : selectedTab === 'day30' ? 'Fase 30 días' : 'Fase 90 días'}
                  </span>
                </label>

                {isAdmin ? (
                  /* Drag & Drop active visual interface */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col justify-center items-center transition relative overflow-hidden group select-none min-h-[140px] ${
                      isDragging 
                        ? 'border-amber-500 bg-amber-50/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="manual_file_picker"
                      className="hidden"
                      onChange={handleManualFileSelect}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
                        <span className="text-3xs font-black text-slate-800 uppercase tracking-widest mt-1">Cargando archivo...</span>
                      </div>
                    ) : (
                      <label htmlFor="manual_file_picker" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="h-7 w-7 text-slate-400 group-hover:scale-110 duration-200" />
                        <span className="text-[9px] font-extrabold text-blue-850 mt-2 uppercase tracking-wide group-hover:underline">
                          Cargar evidencia para {selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'}
                        </span>
                        <p className="text-[8px] text-slate-500 mt-1 max-w-[240px] font-medium leading-relaxed">
                          Arrastra los archivos o haz clic. Asociados al hito seleccionado de {selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? '7 Días' : selectedTab === 'day30' ? '30 Días' : '90 Días'}.
                        </p>
                      </label>
                    )}

                    {dragError && (
                      <span className="absolute bottom-2 text-4xs bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-100">
                        {dragError}
                      </span>
                    )}

                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-center text-3xs text-slate-400 font-bold uppercase py-10 flex flex-col items-center gap-1">
                    <Lock className="h-5 w-5 text-slate-300" />
                    Carga deshabilitada por rol de consulta
                  </div>
                )}

                {/* Evidence List */}
                <div className="flex-grow flex flex-col">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1.5 mb-2.5 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-700 font-bold">Evidencias Cargadas ({selectedTab === 'induction' ? 'Inducción' : selectedTab === 'day7' ? 'Día 7' : selectedTab === 'day30' ? 'Día 30' : 'Día 90'})</span>
                    <span className="text-slate-500 font-mono text-[10px] bg-white border border-slate-200 p-0.5 px-2 rounded-md">
                      {currentMilestone.evidences.length} {currentMilestone.evidences.length === 1 ? 'archivo' : 'archivos'}
                    </span>
                  </span>

                  {currentMilestone.evidences.length === 0 ? (
                    <div className="flex-grow flex justify-center items-center p-6 text-slate-400 bg-slate-50/40 rounded-2xl text-[10px] italic font-semibold border border-slate-100/50 text-center">
                      Sin actas ni archivos de evidencia cargados para {selectedTab === 'induction' ? 'Inducción de Onboarding' : selectedTab === 'day7' ? 'Día 7 (7 días)' : selectedTab === 'day30' ? 'Día 30 (30 días)' : 'Día 90 (90 días)'}.
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[170px] pr-1 flex-grow">
                      {currentMilestone.evidences.map(ev => (
                        <div 
                          key={ev.id}
                          className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition hover:bg-slate-100/50 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getFileIcon(ev.fileType)}
                            <div className="min-w-0">
                              <span className="text-3xs font-black text-slate-800 uppercase tracking-tight block truncate max-w-[170px]" title={ev.fileName}>
                                {ev.fileName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {ev.fileSize} • Subido por: {ev.uploadedBy}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button 
                              onClick={() => setPreviewEvidence(ev)}
                              className="p-1 px-2.5 text-3xs font-bold text-white bg-[#2F5D73] hover:bg-[#1F2A33] rounded-md transition"
                            >
                              Visualizar
                            </button>

                            <a 
                              href={ev.url || '#'} 
                              onClick={(e) => {
                                if (!ev.url) {
                                  e.preventDefault();
                                  alert(`Simulando descarga de: ${ev.fileName}`);
                                }
                              }}
                              download={ev.fileName}
                              className="p-1 text-3xs bg-slate-100 hover:bg-[#E6E7EA] border border-slate-200 text-slate-700 font-bold px-2 rounded-md transition"
                            >
                              Descargar
                            </a>
                            
                            {isAdmin && (
                              <button 
                                onClick={() => handleDeleteFile(ev.id, ev.fileName)}
                                className="p-1 px-[7px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 bg-slate-100 rounded-md border border-slate-200/40 transition"
                                title="Eliminar archivo"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Evidence Preview Modal */}
      {previewEvidence && (
        <div style={{ zIndex: 100 }} className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1F2A33] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2B2B2B] rounded-lg">
                  {getFileIcon(previewEvidence.fileType)}
                </div>
                <div>
                  <h3 className="text-sm font-bold block truncate max-w-md sm:max-w-xl text-white">
                    {previewEvidence.fileName}
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    {previewEvidence.fileSize} • Subido el {previewEvidence.uploadedAt} por {previewEvidence.uploadedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewEvidence.url || '#'}
                  onClick={(e) => {
                    if (!previewEvidence.url) {
                      e.preventDefault();
                      alert(`Simulando descarga de: ${previewEvidence.fileName}`);
                    }
                  }}
                  download={previewEvidence.fileName}
                  className="px-3.5 py-1.5 bg-[#2F5D73] hover:bg-[#1F2A33] text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 text-white"
                >
                  Descargar
                </a>
                <button
                  onClick={() => setPreviewEvidence(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Active visualization of content */}
            <div className="p-6 bg-slate-100/50 overflow-y-auto flex-grow flex flex-col items-center justify-center min-h-[350px]">
              {previewEvidence.url && (previewEvidence.fileType === 'image' || previewEvidence.fileName.match(/\.(png|jpe?g|gif|webp)$/i)) ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm max-w-full">
                  <img
                    src={previewEvidence.url}
                    alt={previewEvidence.fileName}
                    className="max-h-[50vh] object-contain rounded-lg mx-auto"
                  />
                  <div className="mt-2 text-center text-xs text-slate-400 italic">
                    Vista previa de imagen real cargada por el usuario
                  </div>
                </div>
              ) : previewEvidence.url && (previewEvidence.fileType === 'video' || previewEvidence.fileName.match(/\.(mp4|mov|avi|mkv)$/i)) ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 max-w-full">
                  <video
                    src={previewEvidence.url}
                    controls
                    className="max-h-[50vh] rounded-lg mx-auto"
                  />
                </div>
              ) : (
                /* Custom, detailed interactive high-fidelity preview simulators based on document type */
                <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl border border-slate-200/80 p-8 text-left font-sans text-xs relative overflow-hidden select-text">
                  
                  {/* Decorative corporate certificate background header */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2F5D73] via-[#4CB7A5] to-[#E3B23C]" />
                  
                  {previewEvidence.fileType === 'pdf' ? (
                    <div>
                      {/* PDF Simulator layout */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
                        <div>
                          <div className="text-[10px] text-[#2F5D73] font-extrabold uppercase tracking-widest">
                            {collaborator.company || 'ZURA GROUP'}
                          </div>
                          <div className="font-display text-lg font-black text-slate-900 tracking-tight mt-1">
                            ACTA OFICIAL DE COMPROMISO Y ONBOARDING
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Documento ID: ONB-{collaborator.documentId || 'MOCK'}-2026 / {selectedTab.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase p-1 px-2.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            VERIFICADO
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">Pág. 1 de 1</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-slate-700 leading-relaxed text-[11px]">
                        <p>
                          En la ciudad de Bogotá, el día <span className="font-bold underline text-slate-800">{currentMilestone.executedDate || currentMilestone.scheduledDate}</span>, se da constancia y cierre formal al hito de <span className="font-bold text-[#2F5D73]">{selectedTab === 'induction' ? 'Inducción General' : selectedTab === 'day7' ? 'Seguimiento Técnico del Día 7' : selectedTab === 'day30' ? 'Cierre del Primer Mes (Día 30)' : 'Evaluación Final del Día 90'}</span> para el nuevo colaborador de la compañía.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-105 grid grid-cols-2 gap-3 font-medium text-slate-600 my-4 text-[10px]">
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Colaborador</span>
                            <span className="text-slate-900 font-bold text-xs">{collaborator.fullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Documento / ID</span>
                            <span className="text-slate-900 font-bold text-xs">{collaborator.documentId}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Cargo / Rol</span>
                            <span className="text-slate-900">{collaborator.role}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Empresa</span>
                            <span className="text-slate-900 font-semibold">{collaborator.company}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Ubicación / Área</span>
                            <span className="text-slate-900">{collaborator.area}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase text-[8px] font-bold">Jefe Inmediato</span>
                            <span className="text-slate-900">{collaborator.immediateBoss}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">Observaciones de Ejecución</h4>
                          <blockquote className="border-l-4 border-[#2F5D73]/30 pl-3 italic text-slate-500 bg-slate-50/50 py-2 rounded-r-lg">
                            "{currentMilestone.remarks || 'Se completaron de manera satisfactoria las actividades asignadas al hito de onboarding. No se reportan novedades críticas. El colaborador muestra alta alineación con los valores de la empresa.'}"
                          </blockquote>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 text-center">
                          <div className="flex flex-col items-center">
                            <div className="h-10 flex items-end justify-center mb-1">
                              <span className="text-slate-400 font-mono text-[9px] border-b border-dashed border-slate-300 pb-1 font-bold italic tracking-wider text-[#2F5D73]">
                                FIRMA DIGITAL VALIDADA {collaborator.documentId}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[8px] uppercase font-bold">Colaborador Activo</span>
                            <span className="text-slate-900 font-bold block text-[10px]">{collaborator.fullName}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="h-10 flex items-end justify-center mb-1">
                              <span className="text-slate-400 font-mono text-[9px] border-b border-dashed border-slate-300 pb-1 font-bold italic tracking-wider text-[#4CB7A5]">
                                AUTORIZADO TH
                              </span>
                            </div>
                            <span className="text-slate-400 text-[8px] uppercase font-bold">Líder Onboarding / Padrino</span>
                            <span className="text-slate-900 font-bold block text-[10px]">{collaborator.immediateBoss}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[8px] text-slate-400">
                        <span>Hash: cf23df2207d99a74fbe169e3eba035e633d</span>
                        <span>Sello de Seguridad Universidad</span>
                      </div>
                    </div>
                  ) : previewEvidence.fileType === 'excel' ? (
                    <div>
                      {/* Excel Simulator layout */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">HOJA_CONTROL_ONBOARDING.XLSX</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Matriz de Hitos de {collaborator.fullName}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">Microsoft Excel Mode</span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="border-r border-slate-200 p-2 text-left font-bold text-slate-600">ID Fila</th>
                              <th className="border-r border-slate-200 p-2 text-left font-bold text-slate-600">Actividad de Onboarding</th>
                              <th className="border-r border-slate-200 p-2 text-left font-bold text-slate-600">Estatus</th>
                              <th className="border-r border-slate-200 p-2 text-left font-bold text-slate-600">Firma / Aprobó</th>
                              <th className="p-2 text-left font-bold text-slate-600">Puntaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100">
                              <td className="border-r border-slate-200 p-2 font-mono text-slate-400">1</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">Inducción y Bienvenida Institucional</td>
                              <td className="border-r border-slate-200 p-2 text-emerald-600 font-bold">OK - Completado</td>
                              <td className="border-r border-slate-200 p-2 text-slate-600">{collaborator.immediateBoss}</td>
                              <td className="p-2 font-mono font-bold text-slate-800">100 / 100</td>
                            </tr>
                            <tr className="border-b border-slate-100 bg-slate-50/40">
                              <td className="border-r border-slate-200 p-2 font-mono text-slate-400">2</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">Entrega de Credenciales de Seguridad y TI</td>
                              <td className="border-r border-slate-200 p-2 text-emerald-600 font-bold">OK - Completado</td>
                              <td className="border-r border-slate-200 p-2 text-slate-600">Soporte Tecnologías</td>
                              <td className="p-2 font-mono font-bold text-slate-800">100 / 100</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="border-r border-slate-200 p-2 font-mono text-slate-400">3</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">Entrega de Equipamento y Software de Trabajo</td>
                              <td className="border-r border-slate-200 p-2 text-emerald-600 font-bold">OK - Completado</td>
                              <td className="border-r border-slate-200 p-2 text-slate-600">Líder TI</td>
                              <td className="p-2 font-mono font-bold text-slate-800">95 / 100</td>
                            </tr>
                            <tr className="border-b border-slate-100 bg-[#E6E7EA]/40">
                              <td className="border-r border-slate-200 p-2 font-mono text-slate-400">4</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">Lectura y firma de Reglamento General Interno</td>
                              <td className="border-r border-slate-200 p-2 text-emerald-600 font-bold">OK - Completado</td>
                              <td className="border-r border-slate-200 p-2 text-slate-600">Talento Humano</td>
                              <td className="p-2 font-mono font-bold text-slate-800">100 / 100</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="border-r border-slate-200 p-2 font-mono text-slate-400">5</td>
                              <td className="border-r border-slate-200 p-2 font-medium text-slate-800">Reunión de Feedback de Integración</td>
                              <td className="border-r border-slate-200 p-2 text-slate-800">
                                {selectedTab === 'induction' ? 'No Requerido' : 'Pendiente o En proceso'}
                              </td>
                              <td className="border-r border-slate-200 p-2 text-slate-600">{collaborator.immediateBoss}</td>
                              <td className="p-2 font-mono text-slate-400">--</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-705">Porcentaje de Cumplimiento Calculado:</span>
                        <span className="font-mono text-xs font-black text-emerald-750">98.5% de Eficacia</span>
                      </div>
                    </div>
                  ) : previewEvidence.fileType === 'word' ? (
                    <div>
                      {/* Word Simulator layout */}
                      <div className="flex justify-between items-start border-b border-slate-150 pb-4 mb-4">
                        <div className="text-slate-400 font-bold tracking-tight text-[10px]">MEMORÁNDUM INTERNO • TALENTO HUMANO</div>
                        <span className="text-[#2F5D73] bg-blue-50 px-2 py-0.5 rounded text-[9px] font-bold border border-blue-100 font-mono">Word Document</span>
                      </div>

                      <div className="font-serif text-slate-800 text-[11px] leading-relaxed space-y-3">
                        <p className="font-bold text-xs font-sans text-slate-900 border-b border-slate-100 pb-1 mb-2">
                          Asunto: Registro de Seguimiento {selectedTab === 'induction' ? 'Inicial' : selectedTab === 'day7' ? '7 Días' : selectedTab === 'day30' ? '30 Días' : 'Final 90 Días'}
                        </p>
                        <p>
                          <span className="font-bold">DE:</span> Oficina de Gestión de Talento Humano y Experiencia de Onboarding.<br />
                          <span className="font-bold">PARA:</span> Carpeta de Evidencias de <span className="font-semibold text-slate-950">{collaborator.fullName}</span>.<br />
                          <span className="font-bold">COPIA:</span> {collaborator.immediateBoss} (Jefe Inmediato).
                        </p>

                        <div className="border-b border-slate-100 my-3" />

                        <p>
                          Por medio del presente documento, se anexa el reporte correspondiente de comentarios de adaptación. El colaborador ha estado desempeñándose de manera excepcional bajo el rol corporativo de <span className="font-semibold text-slate-905">{collaborator.role}</span> en la empresa {collaborator.company}.
                        </p>
                        <p>
                          Durante el último periodo evaluado, se destaca la buena predisposición del equipo de trabajo y de su padrino, logrando esclarecer dudas operativas clave en menor tiempo del estimado. Se insta a seguir completando los puntos pendientes en el cronograma.
                        </p>

                        <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-101 font-sans text-[10px] my-3">
                          <span className="font-bold text-slate-900 block mb-1">Notas TH del Mentor:</span>
                          <span className="italic">
                            "{currentMilestone.remarks || 'Se visualizan competencias técnicas acordes al perfil buscado. Excelente sinergia del binomio colaborador-padrino.'}"
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Interactive Generic Viewer (video/image mock placeholder) */}
                      <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
                        <div className="font-bold text-slate-950 text-sm">RECURSIVO_EVIDENCIA_MULTIMEDIA</div>
                        <span className="text-[#2F5D73] bg-blue-50 text-[10px] font-black p-1 px-2.5 rounded-full border border-blue-200">REPRODUCCIÓN MULTIMEDIA</span>
                      </div>

                      <div className="p-10 bg-slate-905 text-stone-300 rounded-xl text-center flex flex-col justify-center items-center gap-4 border border-slate-950">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-800">
                          {getFileIcon(previewEvidence.fileType)}
                        </div>
                        <div>
                          <p className="font-bold font-sans text-xs text-white uppercase tracking-wider">{previewEvidence.fileName}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Stream interactivo simulado • Formato multimedia {previewEvidence.fileType === 'video' ? 'Video HD' : 'Imagen'}</p>
                        </div>
                        <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 relative border border-slate-950">
                          <div className="bg-[#2F5D73] absolute inset-0 rounded-full animate-pulse" />
                        </div>
                        <span className="text-[10px] text-[#2F5D73] font-bold tracking-widest mt-1">SINCALIBRADO DE CANAL ADJUNTO</span>
                      </div>
                    </div>
                  )}

                  {/* Stamp detail */}
                  <div className="mt-8 flex justify-between items-center text-[9px] text-slate-400 font-medium font-sans bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span>Universidad Corporativa - Todos los derechos de onboarding reservados.</span>
                    <span className="text-[#2F5D73] font-bold">ONBOARDING TH</span>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 flex justify-end gap-2 border-t border-slate-200/60">
              <button
                onClick={() => setPreviewEvidence(null)}
                className="px-4.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition active:scale-95 text-white"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedImageModal && (
        <div 
          id="colab-photo-viewer-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in transition-all duration-300"
          onClick={() => setSelectedImageModal(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-6 transition-all transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4 text-[#2F5D73]" />
                Visualizador de Perfil (Colaborador)
              </h4>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Cerrar Visualizador"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Portrait frame */}
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
              <img 
                src={selectedImageModal.url} 
                className="w-full h-full object-cover" 
                alt={selectedImageModal.name} 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption name */}
            <div className="mt-4 text-center">
              <p className="text-xs font-black text-white">{selectedImageModal.name}</p>
              <p className="text-3xs text-[#2F5D73] font-bold uppercase tracking-widest mt-1">Colaborador en Proceso de Apadrinamiento</p>
            </div>
            
            {/* Bottom Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="mt-6 w-full py-2 bg-[#2F5D73] hover:bg-[#1F2A33] text-white font-extrabold text-3xs uppercase tracking-widest rounded-xl transition"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
