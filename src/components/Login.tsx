import React, { useState } from 'react';
import { LogIn, Key, User as UserIcon, ShieldAlert } from 'lucide-react';
import { DEFAULT_USERS } from '../demoData';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa el usuario y la contraseña.');
      return;
    }

    // Authenticate with default users
    // For demo purposes:
    // admin / admin
    // consulta / consulta
    // Or we also lookup standard passwords
    const user = DEFAULT_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (user && (password === 'admin' || password === 'consulta' || password === 'admin123' || password === 'consulta123')) {
      // Direct pass based on usernames: admin has role Administrador, consulta has role Consulta
      if (user.username === 'admin' && (password === 'admin' || password === 'admin123')) {
        onLoginSuccess(user);
      } else if (user.username === 'consulta' && (password === 'consulta' || password === 'consulta123')) {
        onLoginSuccess(user);
      } else {
        setError('Contraseña incorrecta para el rol seleccionado.');
      }
    } else if ((username === 'admin' && password === 'admin') || (username === 'admin' && password === 'admin123')) {
      onLoginSuccess(DEFAULT_USERS[0]);
    } else if ((username === 'consulta' && password === 'consulta') || (username === 'consulta' && password === 'consulta123')) {
      onLoginSuccess(DEFAULT_USERS[1]);
    } else {
      setError('Usuario o contraseña incorrectos. Intenta con "admin" o "consulta".');
    }
  };

  return (
    <div id="login_container" className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_45%)]" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-950 opacity-45 blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Logo/Badge */}
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-blue-700 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl border border-blue-600/30">
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white font-sans">
          Gestión de Padrinamiento
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          U. de Talento Humano — Onboarding 7, 30 y 90 Días
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-950 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                Usuario administrativo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: admin o consulta"
                  className="bg-slate-900 border border-slate-800 text-white rounded-xl focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 pr-3 py-3 text-sm placeholder-slate-500 transition duration-150"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Contraseña de acceso
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-900 border border-slate-800 text-white rounded-xl focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 pr-3 py-3 text-sm placeholder-slate-500 transition duration-150"
                />
              </div>
            </div>

            {error && (
              <div id="error_message" className="bg-rose-950/45 border border-rose-800/50 text-rose-300 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                id="btn_login"
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 active:scale-[0.982]"
              >
                Ingresar al Panel
              </button>
            </div>
          </form>

          {/* Guide with credentials to facilitate system evaluations */}
          <div className="mt-6 pt-5 border-t border-slate-900 text-center">
            <span className="text-xs text-slate-500 block font-semibold mb-2">Credenciales de Acceso Rápidas:</span>
            <div className="grid grid-cols-2 gap-2 text-3xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
              <div>
                <span className="font-semibold text-amber-500 block text-2xs mb-0.5">Rol Administrador</span>
                <span>Usuario: <strong className="text-slate-200">admin</strong></span><br/>
                <span>Contraseña: <strong className="text-slate-200">admin</strong></span>
              </div>
              <div>
                <span className="font-semibold text-blue-400 block text-2xs mb-0.5">Rol Consulta</span>
                <span>Usuario: <strong className="text-slate-200">consulta</strong></span><br/>
                <span>Contraseña: <strong className="text-slate-200">consulta</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
