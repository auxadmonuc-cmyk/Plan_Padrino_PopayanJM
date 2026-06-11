import React, { useState } from 'react';
import { ShieldAlert, Users, Plus, ShieldCheck, Mail, Lock, UserPlus, Trash, Shield } from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersConfigProps {
  usersList: User[];
  loggedInUser: User;
  onAddUser: (u: User) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UsersConfig({
  usersList,
  loggedInUser,
  onAddUser,
  onDeleteUser
}: UsersConfigProps) {
  
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Consulta');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const isAdmin = loggedInUser.role === 'Administrador';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!newUsername.trim() || !newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert('Por favor complete todos los datos incluyendo la contraseña.');
      return;
    }

    if (newPassword.trim().length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (usersList.some(u => u.username.toLowerCase() === newUsername.toLowerCase().trim())) {
      alert(`El usuario "${newUsername}" ya existe en el sistema.`);
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim(),
      role: newRole,
      isActive: true,
      email: newEmail.trim(),
      password: newPassword.trim()
    };

    onAddUser(newUser);

    // reset fields
    setNewUsername('');
    setNewFullName('');
    setNewRole('Consulta');
    setNewEmail('');
    setNewPassword('');

    alert(`Usuario administrativo "${newUser.fullName}" creado con éxito.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Create User Form Section (Left pane) */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 h-full">
          <div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
              <UserPlus className="h-5 w-5 text-blue-900" />
              Creación de Usuarios
            </h2>
            <p className="text-2xs text-slate-400 mt-0.5">Asigne privilegios de consulta o administración a analistas de talento humano.</p>
          </div>

          {isAdmin ? (
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
              {/* Username input */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Nombre de Usuario (Log In) *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="ej: laura.gomez"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Nombre Completo Operador *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="ej: Laura Camila Gómez"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="ejemplo@correo-corporativo.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Contraseña de Acceso *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="ej: miContrasegna123"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-mono"
                />
              </div>

              {/* Role select */}
              <div>
                <label className="block text-3xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Rol y Permisos del Sistema *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 text-xs focus:ring-blue-800 focus:border-blue-800 font-medium"
                >
                  <option value="Consulta">Consulta (Únicamente lectura de fichas e informes)</option>
                  <option value="Administrador">Administrador (Control total y subida de evidencias)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition duration-150 active:scale-98 shadow-md"
              >
                Crear Usuario Nuevo
              </button>

            </form>
          ) : (
            <div className="bg-slate-50 p-6 border border-slate-200/50 rounded-2xl text-center py-12 space-y-3">
              <Lock className="h-8 w-8 text-slate-350 mx-auto" />
              <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-500">Módulo Bloqueado</div>
              <p className="text-3xs leading-relaxed text-slate-400">
                Tu rol administrativo actual es <strong className="text-slate-600">Consulta</strong>. Solamente los usuarios administradores del área de Talento Humano tienen autorización para crear nuevos operadores.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Users List Table Section (Right 2 columns) */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col h-full">
          <div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="h-5 w-5 text-blue-900" />
              Operadores y Roles Autorizados
            </h2>
            <p className="text-2xs text-slate-400 mt-0.5">Lista de analistas aprobados para acceder al padrinamiento de colaboradores.</p>
          </div>

          <div className="flex-grow overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-600 font-sans">
              <thead className="bg-slate-50 text-slate-400 text-3xs font-black uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Nombre Completo</th>
                  <th className="px-5 py-3">Usuario Log In</th>
                  <th className="px-5 py-3">Contraseña</th>
                  <th className="px-5 py-3">Rol del Sistema</th>
                  <th className="px-5 py-3">Estado</th>
                  {isAdmin && <th className="px-5 py-3 text-right">Operaciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {usersList.map(u => {
                  const isCurrent = u.username === loggedInUser.username;
                  
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/50 transition duration-150 ${isCurrent ? 'bg-amber-50/15' : ''}`}>
                      <td className="px-5 py-3.5 text-xs text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            u.role === 'Administrador' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></span>
                          <div>
                            <span className="font-bold block text-slate-900">{u.fullName}</span>
                            <span className="text-3xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 shrink-0" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-blue-900">
                        {u.username}
                        {isCurrent && (
                          <span className="inline-block bg-slate-100 text-slate-600 text-3xs px-1.5 py-0.2 rounded ml-1 font-sans">
                            Actual
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                        {u.password || <span className="text-slate-300 italic">Por defecto</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-3xs font-extrabold uppercase ${
                          u.role === 'Administrador'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-3xs text-emerald-600 uppercase font-black tracking-wide">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block"></span>
                          Activo
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          {isCurrent || u.id === 'u1' || u.id === 'u2' ? (
                            <span className="text-3xs font-semibold text-slate-400 italic">Inmune</span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de que deseas eliminar el operador "${u.fullName}"? Ya no podrá acceder al sistema.`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="p-1 px-2.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-3xs transition duration-150"
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-2.5 text-3xs font-semibold text-slate-500 leading-normal mt-auto">
            <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Los usuarios creados se guardarán estructuradamente y podrán acceder al instante ingresando como usuarios válidos y las contraseñas correspondientes en el login principal.</span>
          </div>

        </div>
      </div>

    </div>
  );
}
