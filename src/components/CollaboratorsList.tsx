import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  UserPlus, 
  Calendar, 
  Building, 
  Info, 
  Tag, 
  FileText, 
  Unlock, 
  Lock,
  X,
  MapPin,
  Check,
  User as UserIcon
} from 'lucide-react';
import { Collaborator, CollaboratorStatus, UserRole, Padrino } from '../types';
import { getDiffInDays } from '../demoData';

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  userRole: UserRole;
  onAddCollaborator: (colab: Collaborator) => void;
  onSelectCollaborator: (id: string) => void;
  onLogAudit: (action: string, target: string, details: string) => void;
  padrinosList: Padrino[];
}

export default function CollaboratorsList({
  collaborators,
  userRole,
  onAddCollaborator,
  onSelectCollaborator,
  onLogAudit,
  padrinosList
}: CollaboratorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('Todas');
  const [filterCompany, setFilterCompany] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Activo'); // Default to view Autores Activos

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected image and name for full visualizer modal popup
  const [selectedImageModal, setSelectedImageModal] = useState<{ url: string; name: string } | null>(null);

  // New Collaborator Form details
  const [docId, setDocId] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');
  const [area, setArea] = useState('');
  const [costCenter, setCostCenter] = useState('CC-General');
  const [company, setCompany] = useState('');
  const [boss, setBoss] = useState('');
  const [entryDate, setEntryDate] = useState('2026-06-06');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPadrinoId, setSelectedPadrinoId] = useState('');

  // Date Configuration (Configurar fechas 7, 30, 90 días)
  const [date7, setDate7] = useState('');
  const [date30, setDate30] = useState('');
  const [date90, setDate90] = useState('');
  const [isDatesOverridden, setIsDatesOverridden] = useState(false);

  const isAdmin = userRole === 'Administrador';

  // Extract unique areas and companies for filter lists
  const areasList = useMemo(() => {
    const list = new Set(collaborators.map(c => c.area).filter(Boolean));
    return ['Todas', ...Array.from(list)];
  }, [collaborators]);

  const companiesList = useMemo(() => {
    const list = new Set(collaborators.map(c => c.company).filter(Boolean));
    return ['Todas', ...Array.from(list)];
  }, [collaborators]);

  // Handle entry date modification to auto-calculate the 7, 30, 90 days periods
  const handleEntryDateChange = (val: string) => {
    setEntryDate(val);
    if (!isDatesOverridden) {
      calculateProjectedDates(val);
    }
  };

  const calculateProjectedDates = (baseDateStr: string) => {
    if (!baseDateStr) return;
    try {
      const baseDate = new Date(baseDateStr + 'T00:00:00');
      
      const d7 = new Date(baseDate);
      d7.setDate(baseDate.getDate() + 7);
      const d7Str = d7.toISOString().split('T')[0];

      const d30 = new Date(baseDate);
      d30.setDate(baseDate.getDate() + 30);
      const d30Str = d30.toISOString().split('T')[0];

      const d90 = new Date(baseDate);
      d90.setDate(baseDate.getDate() + 90);
      const d90Str = d90.toISOString().split('T')[0];

      setDate7(d7Str);
      setDate30(d30Str);
      setDate90(d90Str);
    } catch (e) {
      console.error('Error calculando fechas automáticas', e);
    }
  };

  // Trigger default projection on modal open
  const openNewColabModal = () => {
    if (!isAdmin) return;
    // reset form
    setDocId('');
    setFullName('');
    setAvatar('');
    setRole('');
    setArea('');
    setCostCenter('CC-General');
    setCompany('');
    setBoss('');
    setEntryDate('2026-06-06');
    setEmail('');
    setPhone('');
    calculateProjectedDates('2026-06-06');
    setIsDatesOverridden(false);
    setSelectedPadrinoId('');
    setIsModalOpen(true);
  };

  const overrideDates = () => {
    setIsDatesOverridden(true);
  };

  // Submit new collaborator
  const handleSubmitNewColab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !fullName || !role || !area || !company || !boss) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (collaborators.some(c => c.documentId === docId.trim())) {
      alert(`Ya existe un colaborador registrado con el Documento de Identidad ${docId}`);
      return;
    }

    const matchedPadrino = padrinosList.find(p => p.id === selectedPadrinoId);

    const newColab: Collaborator = {
      id: docId.trim(),
      documentId: docId.trim(),
      fullName: fullName.trim(),
      avatar: avatar || undefined,
      role: role.trim(),
      area: area.trim(),
      costCenter: 'CC-General',
      company: company.trim(),
      immediateBoss: boss.trim(),
      entryDate,
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
      phone: phone.trim() || '3000000000',
      status: 'Activo',
      padrinoId: selectedPadrinoId || undefined,
      padrinoName: matchedPadrino ? matchedPadrino.fullName : undefined,
      induction: {
        scheduledDate: entryDate,
        status: 'Pendiente',
        remarks: 'Inducción inicial programada para el día de ingreso.',
        evidences: []
      },
      day7: {
        scheduledDate: date7,
        status: 'Pendiente',
        remarks: 'Planeación inicial automatizada.',
        evidences: []
      },
      day30: {
        scheduledDate: date30,
        status: 'Pendiente',
        remarks: 'Planeación inicial automatizada.',
        evidences: []
      },
      day90: {
        scheduledDate: date90,
        status: 'Pendiente',
        remarks: 'Planeación inicial automatizada.',
        evidences: []
      }
    };

    onAddCollaborator(newColab);
    onLogAudit(
      'Registro de colaborador',
      newColab.fullName,
      `Se registra en el sistema. Fechas de padrinamiento: 7d: ${date7}, 30d: ${date30}, 90d: ${date90}.`
    );

    setIsModalOpen(false);
  };

  // Filter calculations
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter(colab => {
      const matchSearch = 
        colab.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.documentId.includes(searchTerm) ||
        colab.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchArea = filterArea === 'Todas' || colab.area === filterArea;
      const matchCompany = filterCompany === 'Todas' || colab.company === filterCompany;
      const matchStatus = filterStatus === 'Todas' || colab.status === filterStatus;

      return matchSearch && matchArea && matchCompany && matchStatus;
    });
  }, [collaborators, searchTerm, filterArea, filterCompany, filterStatus]);

  return (
    <div className="space-y-6">
      
      {/* Title section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            Colaboradores Registrados
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administración de personal activo y retirado, programación de inducciones y asignación de términos.
          </p>
        </div>
        
        {isAdmin ? (
          <button
            id="open_registration_modal"
            onClick={openNewColabModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nuevo Colaborador
          </button>
        ) : (
          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Lock className="h-3.5 w-3.5" />
            Solo Lectura (Consulta)
          </div>
        )}
      </div>

      {/* Filters Hub Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Termino de busqueda */}
          <div className="relative">
            <label className="block text-3xs font-extrabold uppercase tracking-wide text-slate-400 mb-1">Buscar por nombre o documento</label>
            <div className="relative mt-1 rounded-md shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Ej: Laura Gómez..."
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:ring-blue-800 focus:border-blue-800 block w-full pl-9 pr-3 py-2 text-xs placeholder-slate-400 transition"
              />
            </div>
          </div>

          {/* Filtro Area */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wide text-slate-400 mb-1">Filtrar por Área</label>
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="mt-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-blue-800 focus:border-blue-800 block w-full p-2"
            >
              {areasList.map(areaItem => (
                <option key={areaItem} value={areaItem}>{areaItem}</option>
              ))}
            </select>
          </div>

          {/* Filtro Empresa */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wide text-slate-400 mb-1">Filtrar por Empresa</label>
            <select
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
              className="mt-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-blue-800 focus:border-blue-800 block w-full p-2"
            >
              {companiesList.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-3xs font-extrabold uppercase tracking-wide text-slate-400 mb-1">Filtrar por Estado</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="mt-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:ring-blue-800 focus:border-blue-800 block w-full p-2"
            >
              <option value="Todas">Todos los Estados (Activo/Retirado)</option>
              <option value="Activo">Colaboradores Activos</option>
              <option value="Retirado">Colaboradores Retirados</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid View of Collaborators */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {filteredCollaborators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
            <Info className="h-12 w-12 text-slate-300 mb-3" />
            <span className="font-semibold text-md text-slate-700">Sin colaboradores encontrados</span>
            <p className="text-xs max-w-sm mt-1">Intenta ajustando los términos de búsqueda o filtros generales del área.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-slate-400 text-3xs font-extrabold uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Apadrinado</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Ingreso</th>
                  <th className="px-6 py-4">Padrino</th>
                  <th className="px-6 py-4">Etapas Apadrinamiento</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right rounded-r-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCollaborators.map(colab => {
                  const daysPassed = getDiffInDays('2026-06-06', colab.entryDate);
                  
                  // Calculate quick phases counts
                  const totalCompleted = 
                    (colab.day7.status === 'Completado' ? 1 : 0) +
                    (colab.day30.status === 'Completado' ? 1 : 0) +
                    (colab.day90.status === 'Completado' ? 1 : 0);

                  return (
                    <tr 
                      key={colab.id} 
                      className="hover:bg-slate-50/40 transition duration-150 cursor-pointer"
                      onClick={() => onSelectCollaborator(colab.id)}
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {colab.avatar ? (
                            <img 
                              src={colab.avatar} 
                              alt={colab.fullName}
                              className="h-9 w-9 rounded-full object-cover border border-[#2F5D73]/30 shadow-xs cursor-pointer hover:scale-110 hover:border-blue-500 transition-all duration-150"
                              title="Haga clic para ampliar foto de perfil"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageModal({ url: colab.avatar!, name: colab.fullName });
                              }}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-150 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase font-sans">
                              {colab.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{colab.fullName}</div>
                            <div className="text-3xs text-slate-400 mt-0.5">Doc: <span className="font-mono text-slate-600 font-semibold">{colab.documentId}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="text-xs font-semibold text-slate-700">{colab.role}</div>
                        <div className="text-3xs text-slate-500 font-medium mt-0.5">{colab.area} • {colab.costCenter}</div>
                      </td>
                      <td className="px-6 py-4.5 text-xs">
                        <div className="text-slate-600 truncate max-w-[180px]">{colab.email}</div>
                        <div className="text-3xs text-slate-400 mt-0.5">{colab.phone}</div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-xs text-slate-500 font-mono block">{colab.entryDate}</span>
                        <span className="text-3xs text-slate-400 block mt-0.5">
                          {colab.status === 'Activo' 
                            ? `Hace ${daysPassed} días` 
                             : 'Retirado'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-slate-600">
                        <div className="font-bold text-slate-800">
                          {colab.padrinoName || 'Sin asignar'}
                        </div>
                        {colab.padrinoName && (
                          <div className="text-3xs text-slate-400 mt-0.5 font-medium">Padrino</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            colab.day7.status === 'Completado' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} title="Día 7" />
                          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            colab.day30.status === 'Completado' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} title="Día 30" />
                          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            colab.day90.status === 'Completado' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} title="Día 90" />
                          <span className="text-3xs text-slate-500 font-bold ml-1">{totalCompleted}/3 Completados</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-extrabold uppercase ${
                          colab.status === 'Activo' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {colab.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCollaborator(colab.id);
                          }}
                          className="px-2.5 py-1 text-3xs font-extrabold text-blue-900 bg-blue-50 border border-blue-100/50 hover:bg-blue-900 hover:text-white rounded-lg transition"
                        >
                          Ver Historial
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Collaborator Modal (Configuración y Fechas Automáticas) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
            
            {/* Header */}
            <div className="bg-blue-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-amber-400" />
                  Registrar de Colaborador Nuevo
                </h3>
                <p className="text-2xs text-blue-200 mt-0.5">La asignación de fechas y plazos de onboarding se autocalcula según ingreso.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-2.5 bg-blue-900/40 text-blue-100 rounded-lg hover:bg-blue-900/60 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Form Scrollable */}
            <form onSubmit={handleSubmitNewColab} className="overflow-y-auto p-6 space-y-6 flex-grow">
              
              {/* Sección 1: Datos Personales */}
              <div>
                <h4 className="text-3xs font-extrabold text-blue-900 uppercase tracking-widest border-b border-blue-100 pb-1 mb-4 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Información de Contratación y Personales
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre completo */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ej: Sofía Jaramillo Giraldo"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Documento de Identidad */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Documento de identidad (Cédula) *</label>
                    <input
                      type="text"
                      required
                      value={docId}
                      onChange={e => setDocId(e.target.value)}
                      placeholder="Ej: 1017244589"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Cargo */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Cargo / Rol Técnico *</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="Ej: Desarrollador Backend Junior"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Área */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Área / Departamento *</label>
                    <select
                      required
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-semibold"
                    >
                      <option value="">Seleccione un área...</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Operativo">Operativo</option>
                    </select>
                  </div>

                  {/* Foto del Colaborador */}
                  <div>
                    <label className="block text-3xs font-extrabold text-[#2F5D73] uppercase tracking-wider">Foto del Colaborador (Opcional)</label>
                    <div className="mt-1 flex items-center gap-3">
                      {avatar ? (
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#2F5D73] bg-slate-100 shrink-0 shadow-xs">
                          <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                          <button
                            type="button"
                            onClick={() => setAvatar('')}
                            className="absolute inset-0 bg-rose-950/85 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white text-[9px] font-bold"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0 text-xs font-bold font-sans">
                          S/F
                        </div>
                      )}
                      <div className="flex-grow">
                        <input
                          type="file"
                          id="avatar-file-upload"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatar(reader.result as string);
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-file-upload"
                          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F5D73] hover:bg-[#1F2A33] text-white text-3xs font-bold rounded-lg border border-transparent shadow-2xs transition hover:scale-[1.01] active:scale-95"
                        >
                          Cargar Foto...
                        </label>
                        <span className="text-[10px] text-slate-400 block mt-1">Sube foto de la persona</span>
                      </div>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Empresa / Sede *</label>
                    <select
                      required
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-semibold"
                    >
                      <option value="">Seleccione una empresa...</option>
                      <option value="Zura Group">Zura Group</option>
                      <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
                    </select>
                  </div>

                  {/* Jefe Inmediato */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Jefe Inmediato Directo *</label>
                    <input
                      type="text"
                      required
                      value={boss}
                      onChange={e => setBoss(e.target.value)}
                      placeholder="Ej: Ricardo Alzate (Director TI)"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Fecha de ingreso */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Fecha de Ingreso de Trabajador *</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        required
                        value={entryDate}
                        onChange={e => handleEntryDateChange(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 pl-9 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono"
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-wider">Teléfono de contacto (Opcional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Ej: 3004561234"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                    />
                  </div>

                  {/* Padrino / Sponsor Asignado */}
                  <div className="sm:col-span-2 bg-[#2F5D73]/5 p-3.5 rounded-xl border border-[#2F5D73]/20">
                    <label className="block text-3xs font-extrabold text-[#2F5D73] uppercase tracking-wider mb-1">
                      Padrino / Mentor de Seguimiento *
                    </label>
                    <select
                      value={selectedPadrinoId}
                      onChange={e => setSelectedPadrinoId(e.target.value)}
                      className="block w-full rounded-lg border border-[#2F5D73]/30 bg-white p-2 text-xs focus:ring-[#2F5D73] focus:border-[#2F5D73] font-bold text-slate-800"
                    >
                      <option value="">-- Seleccionar un Padrino / Mentor para el colaborador --</option>
                      {padrinosList && padrinosList.filter(p => p.isActive).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role} - {p.company})
                        </option>
                      ))}
                    </select>
                    {padrinosList && padrinosList.filter(p => p.isActive).length === 0 && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        ⚠️ No hay padrinos activos registrados en el sistema. Vaya a la pestaña de "Padrinos / Mentores" para crear uno primero.
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* Sección 2: Configuración de fechas de seguimiento (Onboarding 7, 30 y 90 días) */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <h4 className="text-3xs font-extrabold text-blue-900 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    Plazos de Onboarding (7, 30 y 90 Días)
                  </h4>
                  {!isDatesOverridden ? (
                    <button
                      type="button"
                      onClick={overrideDates}
                      className="text-3xs font-extrabold text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-1 bg-white p-1 px-2 border border-slate-200 rounded-md"
                    >
                      <Unlock className="h-3 w-3 text-blue-700" />
                      Editar plazos manualmente
                    </button>
                  ) : (
                    <span className="text-3xs font-bold text-amber-600 bg-amber-50 border border-amber-200 p-1 px-2 rounded-md flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Manual Overriding Activo
                    </span>
                  )}
                </div>

                {!isDatesOverridden && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-3xs font-semibold mb-4 leading-relaxed flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 font-extrabold shrink-0" />
                    <span>Las fechas se proyectan de forma automática: Día 7 (+7 días de ingreso), Día 30 (+30 días de ingreso) y Día 90 (+90 días de ingreso).</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Dia 7 */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Día 7 Seguimiento</label>
                    <input
                      type="date"
                      required
                      value={date7}
                      disabled={!isDatesOverridden}
                      onChange={e => setDate7(e.target.value)}
                      className={`block w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono font-bold ${
                        !isDatesOverridden ? 'text-slate-400 bg-slate-100/50 cursor-not-allowed' : 'text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Dia 30 */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Día 30 Seguimiento</label>
                    <input
                      type="date"
                      required
                      value={date30}
                      disabled={!isDatesOverridden}
                      onChange={e => setDate30(e.target.value)}
                      className={`block w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono font-bold ${
                        !isDatesOverridden ? 'text-slate-400 bg-slate-100/50 cursor-not-allowed' : 'text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Dia 90 */}
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Día 90 Seguimiento</label>
                    <input
                      type="date"
                      required
                      value={date90}
                      disabled={!isDatesOverridden}
                      onChange={e => setDate90(e.target.value)}
                      className={`block w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono font-bold ${
                        !isDatesOverridden ? 'text-slate-400 bg-slate-100/50 cursor-not-allowed' : 'text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Botonera de Envio */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition active:scale-95"
                >
                  Cancelar registro
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition active:scale-95 shadow-md"
                >
                  Agregar colaborador nuevo
                </button>
              </div>

            </form>

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
                <UserIcon className="h-4 w-4 text-[#2F5D73]" />
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
