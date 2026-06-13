import React, { useState, useMemo } from 'react';
import { Users, Plus, ShieldCheck, Mail, Lock, UserPlus, Trash2, Shield, Search, Phone, Briefcase, Award, Edit2, Check, X, Star, Calendar } from 'lucide-react';
import { Padrino, User, Collaborator } from '../types';
import { compressImage } from '../utils';

interface PadrinosConfigProps {
  padrinosList: Padrino[];
  collaborators: Collaborator[];
  loggedInUser: User;
  onAddPadrino: (p: Padrino) => void;
  onUpdatePadrino: (p: Padrino) => void;
  onDeletePadrino: (padrinoId: string) => void;
}

export default function PadrinosConfig({
  padrinosList,
  collaborators,
  loggedInUser,
  onAddPadrino,
  onUpdatePadrino,
  onDeletePadrino
}: PadrinosConfigProps) {
  
  const [newDocId, setNewDocId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newArea, setNewArea] = useState('Administrativo');
  const [newCompany, setNewCompany] = useState('Zura Group');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDocId, setEditDocId] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editAvatar, setEditAvatar] = useState('');

  // Selected padrino in the ranking panel
  const [selectedRankingId, setSelectedRankingId] = useState<string | null>(null);

  // Selected image and name for full visualizer modal popup
  const [selectedImageModal, setSelectedImageModal] = useState<{ url: string; name: string } | null>(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('Todas');

  const isAdmin = loggedInUser.role === 'Administrador';

  // Group and list all padrinos sorted alphabetically by full name
  const padrinosRanking = useMemo(() => {
    return padrinosList.map(p => {
      const assignedApadrinados = collaborators.filter(c => c.padrinoId === p.id);
      return {
        padrino: p,
        apadrinados: assignedApadrinados,
        count: assignedApadrinados.length
      };
    }).sort((a, b) => a.padrino.fullName.localeCompare(b.padrino.fullName));
  }, [padrinosList, collaborators]);

  // Determine active selected ranking padrino
  const activeSelectedId = selectedRankingId || (padrinosRanking.length > 0 ? padrinosRanking[0].padrino.id : null);
  const selectedRankingItem = padrinosRanking.find(item => item.padrino.id === activeSelectedId);

  const handleCreatePadrino = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!newDocId.trim() || !newFullName.trim() || !newRole.trim() || !newEmail.trim()) {
      alert('Por favor complete todos los datos obligatorios del padrino.');
      return;
    }

    if (padrinosList.some(p => p.documentId.trim() === newDocId.trim())) {
      alert(`El padrino con documento de identidad "${newDocId}" ya existe.`);
      return;
    }

    const newPadrino: Padrino = {
      id: newDocId.trim(),
      documentId: newDocId.trim(),
      fullName: newFullName.trim(),
      role: newRole.trim(),
      area: newArea,
      company: newCompany,
      email: newEmail.trim(),
      phone: newPhone.trim() || 'No registrado',
      isActive: true,
      avatar: newAvatar || undefined
    };

    onAddPadrino(newPadrino);

    // reset fields
    setNewDocId('');
    setNewFullName('');
    setNewRole('');
    setNewEmail('');
    setNewPhone('');
    setNewAvatar('');

    alert(`Padrino "${newPadrino.fullName}" creado con éxito.`);
  };

  const startEdit = (p: Padrino) => {
    setEditingId(p.id);
    setEditDocId(p.documentId);
    setEditFullName(p.fullName);
    setEditRole(p.role);
    setEditArea(p.area);
    setEditCompany(p.company);
    setEditEmail(p.email);
    setEditPhone(p.phone);
    setEditIsActive(p.isActive);
    setEditAvatar(p.avatar || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (pId: string) => {
    if (!editFullName.trim() || !editRole.trim() || !editEmail.trim()) {
      alert('Por favor complete todos los campos obligatorios para guardar.');
      return;
    }

    const updated: Padrino = {
      id: pId,
      documentId: editDocId.trim(),
      fullName: editFullName.trim(),
      role: editRole.trim(),
      area: editArea,
      company: editCompany,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      isActive: editIsActive,
      avatar: editAvatar || undefined
    };

    onUpdatePadrino(updated);
    setEditingId(null);
    alert('Información del padrino actualizada correctamente.');
  };

  // Filter list
  const filteredPadrinos = useMemo(() => {
    return padrinosList.filter(p => {
      const matchesSearch = 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.documentId.includes(searchTerm) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = filterCompany === 'Todas' || p.company === filterCompany;
      return matchesSearch && matchesCompany;
    });
  }, [padrinosList, searchTerm, filterCompany]);

  return (
    <div id="padrinos_config_root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
      
      {/* Create Padrino Form Section (Left pane) */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 h-full">
          <div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-5 w-5 text-blue-900" />
              Creación de Padrinos / Mentores
            </h2>
            <p className="text-2xs text-slate-400 mt-0.5">Registre a los líderes y mentores aprobados para guiar el onboarding de nuevos integrantes.</p>
          </div>

          {isAdmin ? (
            <form onSubmit={handleCreatePadrino} className="space-y-4 text-xs">
              
              {/* Document ID */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Cédula / Documento de Identidad *</label>
                <input
                  type="text"
                  required
                  value={newDocId}
                  onChange={e => setNewDocId(e.target.value)}
                  placeholder="ej: 1017543210"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Nombre Completo del Padrino *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="ej: Carlos Mario Alzate"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Foto del Padrino */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Foto / Imagen del Padrino (Opcional)</label>
                <div className="mt-1 flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200">
                  {newAvatar ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#2F5D73] bg-white shrink-0 group cursor-pointer" title="Clic para ampliar" onClick={() => setSelectedImageModal({ url: newAvatar, name: newFullName || 'Previsualización de Foto' })}>
                      <img src={newAvatar} className="w-full h-full object-cover group-hover:scale-110 transition duration-150" alt="Avatar Preview" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewAvatar('');
                        }}
                        className="absolute inset-0 bg-rose-955/80 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white text-[9px] font-bold"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0">
                      S/F
                    </div>
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      id="padrino-avatar-file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            compressImage(reader.result as string, (compressedUrl) => {
                              setNewAvatar(compressedUrl);
                            }, 400, 0.7);
                          };
                          reader.readAsDataURL(f);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="padrino-avatar-file"
                      className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-[#2F5D73] hover:bg-[#1F2A33] text-white text-3xs font-extrabold rounded-lg shadow-2xs transition"
                    >
                      Seleccionar Foto...
                    </label>
                  </div>
                </div>
              </div>

              {/* Role / Position */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Cargo Técnico / Rol *</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  placeholder="ej: Líder Desarrollador Senior"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Área / Departamento *</label>
                <select
                  value={newArea}
                  onChange={e => setNewArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-bold"
                >
                  <option value="Administrativo">Administrativo</option>
                  <option value="Operaciones">Operativo / Operaciones</option>
                  <option value="Tecnología">Tecnología & Sistemas</option>
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Empresa / Sede *</label>
                <select
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-bold"
                >
                  <option value="Zura Group">Zura Group</option>
                  <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="ejemplo@tecnosoluciones.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="ej: 3156784532"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-[#2F5D73] hover:bg-[#1F2A33] text-white font-extrabold rounded-xl transition duration-150 active:scale-98 shadow-md"
              >
                Crear Padrino Nuevo
              </button>

            </form>
          ) : (
            <div className="bg-slate-50 p-6 border border-slate-200/50 rounded-2xl text-center py-12 space-y-3">
              <Lock className="h-8 w-8 text-slate-350 mx-auto" />
              <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-500">Módulo Bloqueado</div>
              <p className="text-3xs leading-relaxed text-slate-400">
                Tu rol administrativo actual es <strong className="text-slate-600">Consulta</strong>. Solamente los usuarios administradores pueden dar de alta a nuevos padrinos.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Padrinos List Table Section (Right 2 columns) */}
      <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col h-full flex-grow">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="h-5 w-5 text-blue-900" />
                Listado de Padrinos y Mentores Registrados
              </h2>
              <p className="text-2xs text-slate-400 mt-0.5">Asigne a estas personas durante la creación de fichas de seguimiento.</p>
            </div>
          </div>

          {/* Table Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, cargo, ID..."
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-3xs focus:ring-blue-800 focus:border-blue-800"
              />
            </div>
            <div>
              <select
                value={filterCompany}
                onChange={e => setFilterCompany(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-1.5 text-3xs focus:ring-blue-800 focus:border-blue-800 font-bold"
              >
                <option value="Todas">Todas las Sedes / Empresas</option>
                <option value="Zura Group">Zura Group</option>
                <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
              </select>
            </div>
          </div>

          <div className="flex-grow overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-600 font-sans">
              <thead className="bg-slate-50 text-slate-400 text-3xs font-black uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Padrino / Mentor</th>
                  <th className="px-4 py-3">Cargo y Área</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPadrinos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-450 italic text-2xs">
                      No hay padrinos registrados o que cumplan el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredPadrinos.map(p => {
                    const isEditing = editingId === p.id;
                    
                    if (isEditing) {
                      return (
                        <tr key={p.id} className="bg-amber-50/10">
                          <td className="px-4 py-3 text-xs" colSpan={5}>
                            <div className="space-y-4 p-4 bg-slate-55 p-3.5 rounded-2xl border border-slate-205 shadow-inner">
                              
                              {/* Foto del Padrino (edición) */}
                              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                                {editAvatar ? (
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#2F5D73] bg-slate-100 shrink-0 shadow-2xs group cursor-pointer" title="Clic para ampliar" onClick={() => setSelectedImageModal({ url: editAvatar, name: editFullName || 'Edición de Foto' })}>
                                    <img src={editAvatar} className="w-full h-full object-cover group-hover:scale-110 transition duration-150" alt="Avatar" referrerPolicy="no-referrer" />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditAvatar('');
                                      }}
                                      className="absolute inset-0 bg-rose-955/80 flex items-center justify-center opacity-0 hover:opacity-100 transition text-white text-[9px] font-bold"
                                    >
                                      Quitar
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">
                                    S/F
                                  </div>
                                )}
                                <div>
                                  <input
                                    type="file"
                                    id={`padrino-edit-file-${p.id}`}
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const f = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          compressImage(reader.result as string, (compressedUrl) => {
                                            setEditAvatar(compressedUrl);
                                          }, 400, 0.7);
                                        };
                                        reader.readAsDataURL(f);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`padrino-edit-file-${p.id}`}
                                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-[#2F5D73] hover:bg-[#1F2A33] text-white text-3xs font-extrabold rounded-lg shadow-2xs transition"
                                  >
                                    Cargar Nueva Foto...
                                  </label>
                                  <span className="text-[10px] text-slate-400 block mt-1">Sube foto comercial o corporativa</span>
                                </div>
                              </div>

                              {/* Form fields */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Nombre Completo</label>
                                  <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900 font-bold"
                                    value={editFullName}
                                    onChange={e => setEditFullName(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Cargo</label>
                                  <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900"
                                    value={editRole}
                                    onChange={e => setEditRole(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Área</label>
                                  <select
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900 font-bold"
                                    value={editArea}
                                    onChange={e => setEditArea(e.target.value)}
                                  >
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Operaciones">Operativo / Operaciones</option>
                                    <option value="Tecnología">Tecnología & Sistemas</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Sede / Sede</label>
                                  <select
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900 font-bold"
                                    value={editCompany}
                                    onChange={e => setEditCompany(e.target.value)}
                                  >
                                    <option value="Zura Group">Zura Group</option>
                                    <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Correo electrónico</label>
                                  <input
                                    type="email"
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Teléfono</label>
                                  <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5 font-bold">Estado</label>
                                  <select
                                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs bg-white text-slate-900 font-bold"
                                    value={editIsActive ? 'Activo' : 'Inactivo'}
                                    onChange={e => setEditIsActive(e.target.value === 'Activo')}
                                  >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(p.id)}
                                  className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-3xs font-extrabold flex items-center gap-0.5 transition shadow"
                                >
                                  <Check className="h-3 w-3" />
                                  Guardar cambios
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="p-1.5 px-3 bg-slate-200 text-slate-700 hover:bg-slate-350 rounded-lg text-3xs font-bold flex items-center gap-0.5 transition"
                                >
                                  <X className="h-3 w-3" />
                                  Cancelar
                                </button>
                              </div>

                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="px-4 py-3 text-xs text-slate-900">
                          <div className="flex items-center gap-3">
                            {p.avatar ? (
                              <img 
                                src={p.avatar} 
                                className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shrink-0 shadow-3xs cursor-pointer hover:scale-110 hover:border-blue-500 transition-all duration-150" 
                                alt={p.fullName} 
                                referrerPolicy="no-referrer" 
                                title="Haga clic para ampliar foto de perfil"
                                onClick={() => setSelectedImageModal({ url: p.avatar!, name: p.fullName })}
                              />
                            ) : (
                              <div className="w-8.5 h-8.5 rounded-full bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center text-xs font-black shrink-0">
                                {p.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold block text-slate-900">{p.fullName}</span>
                              <span className="text-3xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                ID: <strong className="text-slate-600">{p.documentId}</strong>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                            {p.role}
                          </div>
                          <div className="text-3xs text-slate-400 font-medium mt-0.5">{p.area} • {p.company}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{p.email}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-3xs text-slate-400">
                            <Phone className="h-2.5 w-2.5" />
                            <span>{p.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            p.isActive 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {p.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isAdmin ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEdit(p)}
                                className="p-1 px-2.5 text-blue-900 bg-blue-50 border border-blue-100/55 hover:bg-blue-900 hover:text-white rounded-lg text-3xs transition duration-150 flex items-center gap-0.5 font-bold"
                              >
                                <Edit2 className="h-3 w-3" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que deseas eliminar al padrino "${p.fullName}"?`)) {
                                    onDeletePadrino(p.id);
                                  }
                                }}
                                className="p-1 px-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-3xs transition duration-150 flex items-center gap-0.5 font-bold"
                              >
                                <Trash2 className="h-3 w-3" />
                                Eliminar
                              </button>
                            </div>
                          ) : (
                            <span className="text-3xs font-semibold text-slate-450 italic">Sin Permiso</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-2.5 text-3xs font-semibold text-slate-500 leading-normal mt-auto animate-fade-in">
            <Shield className="h-4 w-4 text-[#2F5D73] shrink-0 mt-0.5" />
            <span>Al registrar a los Padrinos, estos aparecerán de forma automática en los selectores del formulario de creación y edición de apadrinados. De esta manera se centraliza el control de los binomios Padrino-Apadrinado.</span>
          </div>

        </div>
      </div>

      {/* Interactive Directorio and Apadrinados Viewer */}
      <div id="padrino_ranking_section" className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6 animate-fade-in">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#2F5D73]" />
            Relación de Padrinos y su Impacto
          </h2>
          <p className="text-3xs text-slate-400 mt-0.5">
            Directorio completo de mentores. Selecciona a cualquier padrino para visualizar detalladamente todos sus apadrinados asignados y su respectivo avance en las etapas de onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Directory Board (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-3xs font-extrabold uppercase tracking-widest text-[#2F5D73] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Users className="h-4 w-4 text-[#2F5D73]" />
              Directorio de Padrinos
            </h3>
            
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {padrinosRanking.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-3xs italic text-slate-400">
                  No hay padrinos registrados actualmente.
                </div>
              ) : (
                padrinosRanking.map((item, index) => {
                  const p = item.padrino;
                  const isSelected = activeSelectedId === p.id;

                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedRankingId(p.id)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition duration-200 flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#2F5D73] shadow-sm ring-1 ring-[#2F5D73]/10'
                          : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Bullet number indicator */}
                        <span className="text-[10px] font-bold text-slate-45 w-5 shrink-0 text-center">
                          {index + 1}.
                        </span>

                        {/* Padrino Avatar */}
                        {p.avatar ? (
                          <img 
                            src={p.avatar} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-205 shrink-0 cursor-pointer hover:scale-110 hover:border-blue-500 transition-all duration-150" 
                            alt={p.fullName} 
                            referrerPolicy="no-referrer" 
                            title="Haga clic para ampliar foto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageModal({ url: p.avatar!, name: p.fullName });
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 border border-blue-100 font-extrabold flex items-center justify-center text-3xs shrink-0">
                            {p.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{p.fullName}</h4>
                          <p className="text-[9px] font-medium text-slate-500 truncate leading-snug">{p.role}</p>
                          <span className="text-[8px] font-semibold text-[#2F5D73] mt-0.5 block uppercase tracking-wider truncate">
                            {p.company}
                          </span>
                        </div>
                      </div>

                      {/* Count of Apadrinados compact badge */}
                      <div className="shrink-0 flex items-center gap-1.5 pl-1">
                        <span 
                          className={`w-5.5 h-5.5 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-2xs border ${
                            item.count > 0 
                              ? 'bg-[#2F5D73] text-white border-[#2F5D73]' 
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`} 
                          title={`${item.count} apadrinados asignados`}
                        >
                          {item.count}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Panel (Right Columns) */}
          <div className="lg:col-span-8 space-y-3">
            <h3 className="text-3xs font-extrabold uppercase tracking-widest text-[#2F5D73] flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Users className="h-4 w-4" />
              Integrantes Apadrinados
            </h3>

            {selectedRankingItem ? (
              <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-3xl space-y-4 h-full min-h-[300px]" id="padrino-impact-view-card">
                
                {/* Padrino Summary Header */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-205 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    {selectedRankingItem.padrino.avatar ? (
                      <img 
                        src={selectedRankingItem.padrino.avatar} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 cursor-pointer hover:scale-110 hover:border-blue-500 transition-all duration-150" 
                        alt="Padrino" 
                        referrerPolicy="no-referrer" 
                        title="Haga clic para ampliar foto"
                        onClick={() => setSelectedImageModal({ url: selectedRankingItem.padrino.avatar!, name: selectedRankingItem.padrino.fullName })}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-black">
                        {selectedRankingItem.padrino.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{selectedRankingItem.padrino.fullName}</h4>
                      <p className="text-3xs text-slate-500 font-bold">{selectedRankingItem.padrino.role} • <strong className="text-slate-600">{selectedRankingItem.padrino.company}</strong></p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-110 px-3 py-1.5 rounded-xl text-left">
                    <div className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Total a cargo</div>
                    <div className="text-sm font-black text-emerald-900 mt-0.5">{selectedRankingItem.count} {selectedRankingItem.count === 1 ? 'Apadrinado' : 'Apadrinados'}</div>
                  </div>
                </div>

                {/* Apadrinados List */}
                {selectedRankingItem.apadrinados.length === 0 ? (
                  <div className="bg-white p-10 text-center rounded-2xl border border-slate-200/40 text-slate-400 italic text-2xs space-y-2 py-12" id="empty-apadrinados-banner">
                    <Users className="h-6 w-6 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600 text-3xs">Este padrino aún no tiene integrantes apadrinados asignados.</p>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                      Asigna a este padrino desde el panel de "Colaboradores" editando la ficha técnica del integrante deseado.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="apadrinados_ranking_grid">
                    {selectedRankingItem.apadrinados.map(c => {
                      // Onboarding progress score: count status "Completado"
                      let completed = 0;
                      if (c.induction?.status === 'Completado') completed++;
                      if (c.day7?.status === 'Completado') completed++;
                      if (c.day30?.status === 'Completado') completed++;
                      if (c.day90?.status === 'Completado') completed++;
                      const percent = (completed / 4) * 100;

                      return (
                        <div key={c.id} className="bg-white p-3.5 rounded-2xl border border-slate-205 flex flex-col justify-between hover:shadow-xs transition duration-150 space-y-3" id={`ranking-colab-card-${c.id}`}>
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {c.avatar ? (
                                <img 
                                  src={c.avatar} 
                                  className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0 shadow-3xs cursor-pointer hover:scale-110 hover:border-blue-500 transition-all duration-150" 
                                  alt={c.fullName} 
                                  referrerPolicy="no-referrer" 
                                  title="Haga clic para ampliar foto"
                                  onClick={() => setSelectedImageModal({ url: c.avatar!, name: c.fullName })}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center text-3xs font-black shrink-0 border border-slate-200">
                                  {c.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{c.fullName}</h5>
                                <p className="text-[9px] text-slate-500 truncate leading-snug font-medium mt-0.5">{c.role}</p>
                                <p className="text-[8px] text-[#2F5D73] font-extrabold uppercase tracking-widest truncate">{c.area}</p>
                              </div>
                            </div>
                            
                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase shrink-0 ${
                              c.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`} id={`ranking-colab-status-${c.id}`}>
                              {c.status}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            {/* Meta progress indicator */}
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span>Ingreso: <strong className="text-slate-700 font-mono">{c.entryDate}</strong></span>
                              </span>
                              <span className="text-[#2F5D73] font-extrabold font-mono bg-[#2F5D73]/5 px-1 rounded">{completed}/4 Etapas</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>

                            {/* Micro Stages Matrix */}
                            <div className="grid grid-cols-4 gap-1 pt-1">
                              {[
                                { label: 'Ind.', val: c.induction?.status },
                                { label: 'D7', val: c.day7?.status },
                                { label: 'D30', val: c.day30?.status },
                                { label: 'D90', val: c.day90?.status },
                              ].map((st, sidx) => {
                                let badgeColor = 'bg-slate-50 text-slate-400 border border-slate-100';
                                if (st.val === 'Completado') badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold';
                                else if (st.val === 'En proceso') badgeColor = 'bg-amber-50 text-amber-700 border border-amber-100 font-bold';
                                
                                return (
                                  <div key={sidx} className={`rounded p-0.5 text-center text-[8px] tracking-tight truncate border ${badgeColor}`} title={`${st.label}: ${st.val || 'Sin programar'}`} id={`ranking-colab-stage-${c.id}-${sidx}`}>
                                    {st.label}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-105 text-3xs italic text-slate-400" id="ranking-no-selected-notification">
                Selecciona un padrino del directorio a la izquierda para visualizar sus apadrinados.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedImageModal && (
        <div 
          id="profile-photo-viewer-modal"
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
                <Award className="h-4 w-4 text-[#2F5D73]" />
                Visualizador de Perfil
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
              <p className="text-3xs text-[#2F5D73] font-bold uppercase tracking-widest mt-1">Integrante del Ecosistema de Apadrinamiento</p>
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
