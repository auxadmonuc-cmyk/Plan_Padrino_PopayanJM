import React, { useState, useMemo } from 'react';
import { Users, Plus, ShieldCheck, Mail, Lock, UserPlus, Trash2, Shield, Search, Phone, Briefcase, Award, Edit2, Check, X } from 'lucide-react';
import { Padrino, User } from '../types';

interface PadrinosConfigProps {
  padrinosList: Padrino[];
  loggedInUser: User;
  onAddPadrino: (p: Padrino) => void;
  onUpdatePadrino: (p: Padrino) => void;
  onDeletePadrino: (padrinoId: string) => void;
}

export default function PadrinosConfig({
  padrinosList,
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

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('Todas');

  const isAdmin = loggedInUser.role === 'Administrador';

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
      isActive: true
    };

    onAddPadrino(newPadrino);

    // reset fields
    setNewDocId('');
    setNewFullName('');
    setNewRole('');
    setNewEmail('');
    setNewPhone('');

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
      isActive: editIsActive
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
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
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
                          <td className="px-4 py-3 text-xs" colSpan={4}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Nombre Completo</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editFullName}
                                  onChange={e => setEditFullName(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Cargo</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editRole}
                                  onChange={e => setEditRole(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Área</label>
                                <select
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editArea}
                                  onChange={e => setEditArea(e.target.value)}
                                >
                                  <option value="Administrativo">Administrativo</option>
                                  <option value="Operaciones">Operativo / Operaciones</option>
                                  <option value="Tecnología">Tecnología & Sistemas</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Sede / Empresa</label>
                                <select
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editCompany}
                                  onChange={e => setEditCompany(e.target.value)}
                                >
                                  <option value="Zura Group">Zura Group</option>
                                  <option value="Soivalle Soluciones Inteligentes del Valle">Soivalle Soluciones Inteligentes del Valle</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Correo</label>
                                <input
                                  type="email"
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editEmail}
                                  onChange={e => setEditEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Teléfono</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editPhone}
                                  onChange={e => setEditPhone(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wide text-slate-400 mb-0.5">Estado</label>
                                <select
                                  className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white text-slate-900"
                                  value={editIsActive ? 'Activo' : 'Inactivo'}
                                  onChange={e => setEditIsActive(e.target.value === 'Activo')}
                                >
                                  <option value="Activo">Activo</option>
                                  <option value="Inactivo">Inactivo / Pasivo</option>
                                </select>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5 mt-2">
                              <button
                                onClick={() => handleSaveEdit(p.id)}
                                className="p-1 px-2 bg-emerald-600 text-white rounded text-3xs font-extrabold flex items-center gap-0.5 shadow-sm"
                              >
                                <Check className="h-3 w-3" />
                                Guardar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 px-2 bg-slate-200 text-slate-700 rounded text-3xs font-bold flex items-center gap-0.5"
                              >
                                <X className="h-3 w-3" />
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="px-4 py-3 text-xs text-slate-900">
                          <div>
                            <span className="font-bold block text-slate-900">{p.fullName}</span>
                            <span className="text-3xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              ID: <strong className="text-slate-600">{p.documentId}</strong>
                            </span>
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
                                className="p-1 px-2.5 text-blue-900 bg-blue-50 border border-blue-100/50 hover:bg-blue-900 hover:text-white rounded-lg text-3xs transition duration-150 flex items-center gap-0.5"
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
                                className="p-1 px-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-3xs transition duration-150 flex items-center gap-0.5"
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

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-2.5 text-3xs font-semibold text-slate-500 leading-normal mt-auto">
            <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Al dar de alta a los Padrinos, estos aparecerán de forma automática en los selectores del formulario de creación y edición de colaboradores. De esta manera podrá centralizar el control de los binomios Padrino-Colaborador.</span>
          </div>

        </div>
      </div>

    </div>
  );
}
