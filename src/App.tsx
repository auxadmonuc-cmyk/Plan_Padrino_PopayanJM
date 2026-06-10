import React, { useState, useEffect, useMemo } from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  FileBarChart2, 
  History, 
  Settings, 
  User as UserIcon, 
  Bell, 
  ShieldCheck,
  Building,
  Menu,
  X
} from 'lucide-react';
import { User, Collaborator, AuditLog, UserRole, Alert } from './types';
import { 
  INITIAL_COLLABORATORS, 
  DEFAULT_USERS, 
  INITIAL_AUDIT_LOGS, 
  calculateAlerts 
} from './demoData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CollaboratorsList from './components/CollaboratorsList';
import CollaboratorCard from './components/CollaboratorCard';
import ReportGenerator from './components/ReportGenerator';
import AuditHistory from './components/AuditHistory';
import UsersConfig from './components/UsersConfig';

// Import Firestore client & utilities
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  
  // Storage keys
  const COLAB_KEY = 'padrinamiento_colabs';
  const LOG_KEY = 'padrinamiento_logs';
  const USERS_KEY = 'padrinamiento_users';
  const ACTIVE_USER_KEY = 'padrinamiento_active_user';

  // State elements
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Navigation and routing state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedColabId, setSelectedColabId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States for interactive real-time notifications & toasts
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }>>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync state helpers to persistent local storage
  const handleUpdateCollaborators = (updatedList: Collaborator[]) => {
    setCollaborators(updatedList);
    localStorage.setItem(COLAB_KEY, JSON.stringify(updatedList));
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsersList(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  };

  const handleUpdateLogs = (updatedLogs: AuditLog[]) => {
    setAuditLogs(updatedLogs);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
  };

  // Attempt to seed data into Firestore initially if collections are completely empty
  const seedFirestoreIfEmpty = async () => {
    try {
      const colSnap = await getDocs(collection(db, 'collaborators'));
      if (colSnap.empty) {
        console.log('Database empty. Seeding INITIAL_COLLABORATORS to Firestore...');
        for (const item of INITIAL_COLLABORATORS) {
          await setDoc(doc(db, 'collaborators', item.id), item);
        }
      }
      
      const userSnap = await getDocs(collection(db, 'users'));
      if (userSnap.empty) {
        console.log('Database empty. Seeding DEFAULT_USERS to Firestore...');
        for (const item of DEFAULT_USERS) {
          await setDoc(doc(db, 'users', item.id), item);
        }
      }

      const logSnap = await getDocs(collection(db, 'auditLogs'));
      if (logSnap.empty) {
        console.log('Database empty. Seeding INITIAL_AUDIT_LOGS to Firestore...');
        for (const item of INITIAL_AUDIT_LOGS) {
          await setDoc(doc(db, 'auditLogs', item.id), item);
        }
      }
    } catch (err) {
      console.warn("Seeding or initial Firestore lookup skipped (could be offline or pending authorization):", err);
    }
  };

  // Initialize data on load with live database synchronization
  useEffect(() => {
    // 1. Logged user check (local-only session token verification)
    const storedUser = localStorage.getItem(ACTIVE_USER_KEY);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }

    // Load initial local caches before database listeners connect
    const storedColabs = localStorage.getItem(COLAB_KEY);
    if (storedColabs) {
      try { setCollaborators(JSON.parse(storedColabs)); } catch (e) {}
    } else {
      setCollaborators(INITIAL_COLLABORATORS);
    }

    const storedLogs = localStorage.getItem(LOG_KEY);
    if (storedLogs) {
      try { setAuditLogs(JSON.parse(storedLogs)); } catch (e) {}
    } else {
      setAuditLogs(INITIAL_AUDIT_LOGS);
    }

    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      try { setUsersList(JSON.parse(storedUsers)); } catch (e) {}
    } else {
      setUsersList(DEFAULT_USERS);
    }

    // Trigger asynchronous firestore seed checks
    seedFirestoreIfEmpty();

    // 2. Set up live subscriptions from Firestore
    const unsubscribeColabs = onSnapshot(collection(db, 'collaborators'), (snapshot) => {
      const colabsData: Collaborator[] = [];
      snapshot.forEach((doc) => {
        colabsData.push(doc.data() as Collaborator);
      });
      if (colabsData.length > 0) {
        // Retain design system order if possible, or direct database map
        handleUpdateCollaborators(colabsData);
      }
    }, (error) => {
      console.warn('Readying offline Firestore; collaborator streaming paused: ', error);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push(doc.data() as User);
      });
      if (usersData.length > 0) {
        handleUpdateUsers(usersData);
      }
    }, (error) => {
      console.warn('Readying offline Firestore; users streaming paused: ', error);
    });

    const unsubscribeLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      const logsData: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logsData.push(doc.data() as AuditLog);
      });
      if (logsData.length > 0) {
        // Sort audit entries by timestamp descending
        logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        handleUpdateLogs(logsData);
      }
    }, (error) => {
      console.warn('Readying offline Firestore; audits streaming paused: ', error);
    });

    return () => {
      unsubscribeColabs();
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  // Log in controller
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    appendAuditLog('Inicio de sesión', 'Autenticación', `Acceso exitoso al panel con rol: ${user.role}`, user);
  };

  // Sign out controller
  const handleLogout = () => {
    if (currentUser) {
      appendAuditLog('Cierre de sesión', 'Autenticación', `Salida segura realizada por el analista`, currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_KEY);
    setSelectedColabId(null);
    setActiveTab('dashboard');
  };

  // Add dynamic audit event log
  const appendAuditLog = async (
    action: string, 
    target: string, 
    details: string, 
    operator = currentUser
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: operator?.id || 'u-unknown',
      userFullName: operator?.fullName || 'Operador Invitado',
      action,
      targetName: target,
      details
    };

    const updated = [newLog, ...auditLogs];
    handleUpdateLogs(updated);

    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `auditLogs/${newLog.id}`);
    }
  };

  // Operations: Add collaborator
  const handleAddCollaborator = async (newColab: Collaborator) => {
    const updated = [newColab, ...collaborators];
    handleUpdateCollaborators(updated);
    addToast(`¡Colaborador ${newColab.fullName} registrado correctamente!`, 'success');
    try {
      await setDoc(doc(db, 'collaborators', newColab.id), newColab);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `collaborators/${newColab.id}`);
    }
  };

  // Operations: Modify collaborator
  const handleUpdateSingleCollaborator = async (updatedColab: Collaborator) => {
    const updated = collaborators.map(c => c.id === updatedColab.id ? updatedColab : c);
    handleUpdateCollaborators(updated);
    addToast(`¡Cambios de ${updatedColab.fullName} guardados con éxito!`, 'success');
    try {
      await setDoc(doc(db, 'collaborators', updatedColab.id), updatedColab);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `collaborators/${updatedColab.id}`);
    }
  };

  // Operations: Users
  const handleAddUser = async (newUser: User) => {
    const updated = [...usersList, newUser];
    handleUpdateUsers(updated);
    addToast(`¡Usuario administrativo ${newUser.fullName} creado!`, 'success');
    appendAuditLog('Creación de usuario', newUser.fullName, `Creación de operador de accesos. Rol: ${newUser.role}`);
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${newUser.id}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    const updated = usersList.filter(u => u.id !== userId);
    handleUpdateUsers(updated);
    if (user) {
      addToast(`¡Usuario ${user.fullName} revocado del sistema!`, 'info');
      appendAuditLog('Eliminación de usuario', user.fullName, `Baja del operador del sistema administrativo.`);
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  // Auto-calculated fields
  const activeAlertsCount = useMemo(() => {
    return calculateAlerts(collaborators, '2026-06-06').length;
  }, [collaborators]);

  const activeColabObject = useMemo(() => {
    if (!selectedColabId) return null;
    return collaborators.find(c => c.id === selectedColabId) || null;
  }, [selectedColabId, collaborators]);

  // Navigate to coworker detail fiche
  const handleSelectCollaborator = (id: string) => {
    setSelectedColabId(id);
    setActiveTab('detail');
  };

  const handleNavigateFromDashboard = (section: string) => {
    setSelectedColabId(null);
    setActiveTab(section);
  };

  // Logged Out gate
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      {/* Top Professional Header Bar */}
      <header className="bg-slate-950 text-white shadow-md border-b border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16.5 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-gradient-to-tr from-blue-700 to-amber-500 rounded-lg flex items-center justify-center font-black text-white shadow-xs border border-blue-800">
                TH
              </div>
              <div>
                <h1 className="text-xs font-black tracking-wide uppercase font-sans text-white">
                  Padrinamiento
                </h1>
                <p className="text-[10px] text-amber-400 font-extrabold tracking-widest leading-none">
                  ONBOARDING U.
                </p>
              </div>
            </div>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex gap-1">
              <button
                id="tab_dashboard"
                onClick={() => { setSelectedColabId(null); setActiveTab('dashboard'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-900 text-amber-400 font-extrabold border border-blue-800/40 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              <button
                id="tab_colaboradores"
                onClick={() => { setSelectedColabId(null); setActiveTab('colaboradores'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  activeTab === 'colaboradores' || activeTab === 'detail'
                    ? 'bg-blue-900 text-amber-400 font-extrabold border border-blue-800/40 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Users className="h-4 w-4" />
                Colaboradores
              </button>

              <button
                id="tab_reportes"
                onClick={() => { setSelectedColabId(null); setActiveTab('reportes'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  activeTab === 'reportes'
                    ? 'bg-blue-900 text-amber-400 font-extrabold border border-blue-800/40 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <FileBarChart2 className="h-4 w-4" />
                Reportes
              </button>

              <button
                id="tab_auditoria"
                onClick={() => { setSelectedColabId(null); setActiveTab('auditoria'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  activeTab === 'auditoria'
                    ? 'bg-blue-900 text-amber-400 font-extrabold border border-blue-800/40 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <History className="h-4 w-4" />
                Historial Cambios
              </button>

              <button
                id="tab_usuarios"
                onClick={() => { setSelectedColabId(null); setActiveTab('usuarios'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  activeTab === 'usuarios'
                    ? 'bg-blue-900 text-amber-400 font-extrabold border border-blue-800/40 shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Settings className="h-4 w-4" />
                Usuarios
              </button>
            </nav>

            {/* Operator Account details and Sign Out */}
            <div className="flex items-center gap-4">
              
              {/* Dynamic Alerts Quick indicator & Interactive Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotifOpen(!isNotifOpen);
                  }}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition active:scale-95 flex items-center justify-center relative"
                  title={`${activeAlertsCount} Alertas de Seguimiento Activa(s)`}
                >
                  <Bell className="h-4.5 w-4.5 text-slate-100" />
                  {activeAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none bg-rose-500 text-white rounded-full">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    {/* Backdrop to close click */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    
                    {/* Notification Dropdown Drawer */}
                    <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4.5 z-50 text-slate-800 space-y-3 shrink-0">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-sans font-black text-xs text-slate-900 uppercase">Alertas Activas ({activeAlertsCount})</span>
                        <button 
                          onClick={() => setIsNotifOpen(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {calculateAlerts(collaborators, '2026-06-06').length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                          <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Sin Alertas de Seguimiento</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Todos los plazos están al día.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 overflow-y-auto max-h-[285px] -mx-1 px-1 scrollbar-thin">
                          {calculateAlerts(collaborators, '2026-06-06').map(alert => {
                            const isOverdue = alert.type === 'overdue';
                            return (
                              <div
                                key={alert.id}
                                onClick={() => {
                                  handleSelectCollaborator(alert.collaboratorId);
                                  setIsNotifOpen(false);
                                  addToast(`Visualizando plazos de ${alert.collaboratorName}`, 'info');
                                }}
                                className="p-2.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition cursor-pointer flex flex-col"
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                                    {alert.collaboratorName}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                                    isOverdue ? 'bg-rose-100 text-rose-850' : 'bg-amber-100 text-amber-850'
                                  }`}>
                                    {isOverdue ? 'Vencido' : 'Próximo'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                  Hito: <strong className="text-slate-700 font-bold">{alert.milestoneName}</strong>
                                </span>
                                <span className="text-3xs text-slate-400 mt-1 font-semibold">
                                  {isOverdue 
                                    ? `Plazo vencido hace ${Math.abs(alert.daysRemaining)} días` 
                                    : `Faltan ${alert.daysRemaining} días`
                                  } • Plazo: {alert.scheduledDate}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedColabId(null);
                          setActiveTab('dashboard');
                          setIsNotifOpen(false);
                        }}
                        className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100/85 rounded-xl text-3xs font-black text-blue-900 uppercase tracking-wide transition"
                      >
                        Ver Panel Completo de Alertas
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Operator details */}
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-100 max-w-[170px] truncate leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-4xs text-amber-400 font-extrabold uppercase mt-0.5 tracking-widest flex items-center justify-end gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  {currentUser.role}
                </span>
              </div>

              {/* Log out */}
              <button
                id="btn_logout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-extrabold transition active:scale-95"
                title="Cerrar Sesión Segura"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1 text-slate-200 hover:text-white md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile slide-down menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2">
            <button
              onClick={() => { setSelectedColabId(null); setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2 px-3 rounded-lg text-xs font-bold block ${
                activeTab === 'dashboard' ? 'bg-blue-900 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setSelectedColabId(null); setActiveTab('colaboradores'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2 px-3 rounded-lg text-xs font-bold block ${
                activeTab === 'colaboradores' || activeTab === 'detail' ? 'bg-blue-900 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Colaboradores
            </button>
            <button
              onClick={() => { setSelectedColabId(null); setActiveTab('reportes'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2 px-3 rounded-lg text-xs font-bold block ${
                activeTab === 'reportes' ? 'bg-blue-900 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Reportes
            </button>
            <button
              onClick={() => { setSelectedColabId(null); setActiveTab('auditoria'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2 px-3 rounded-lg text-xs font-bold block ${
                activeTab === 'auditoria' ? 'bg-blue-900 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Historial Cambios
            </button>
            <button
              onClick={() => { setSelectedColabId(null); setActiveTab('usuarios'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2 px-3 rounded-lg text-xs font-bold block ${
                activeTab === 'usuarios' ? 'bg-blue-900 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Usuarios
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Router content selector */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            collaborators={collaborators} 
            onSelectCollaborator={handleSelectCollaborator}
            onNavigateToSection={handleNavigateFromDashboard}
          />
        )}

        {activeTab === 'colaboradores' && (
          <CollaboratorsList 
            collaborators={collaborators}
            userRole={currentUser.role}
            onAddCollaborator={handleAddCollaborator}
            onSelectCollaborator={handleSelectCollaborator}
            onLogAudit={(act, tar, det) => appendAuditLog(act, tar, det)}
          />
        )}

        {activeTab === 'detail' && activeColabObject && (
          <CollaboratorCard 
            collaborator={activeColabObject}
            userRole={currentUser.role}
            onBack={() => { setSelectedColabId(null); setActiveTab('colaboradores'); }}
            onUpdateCollaborator={handleUpdateSingleCollaborator}
            onLogAudit={(act, tar, det) => appendAuditLog(act, tar, det)}
          />
        )}

        {activeTab === 'reportes' && (
          <ReportGenerator 
            collaborators={collaborators}
            userRole={currentUser.role}
            onLogAudit={(act, tar, det) => appendAuditLog(act, tar, det)}
          />
        )}

        {activeTab === 'auditoria' && (
          <AuditHistory 
            logs={auditLogs}
          />
        )}

        {activeTab === 'usuarios' && (
          <UsersConfig 
            usersList={usersList}
            loggedInUser={currentUser}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

      </main>

      {/* Corporate bottom credit footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-850 mt-auto text-xs text-center font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span>
            © 2026 Gestión de Padrinamiento Onboarding • Sistema Integral de Talento Humano
          </span>
        </div>
      </footer>

      {/* Toast Alert Feedback Overlay */}
      <div className="fixed bottom-5 right-5 space-y-2.5 z-50 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl text-xs font-bold text-white shadow-xl translate-y-0 transition duration-300 ${
              t.type === 'success' ? 'bg-emerald-600 border border-emerald-500' :
              t.type === 'info' ? 'bg-[#2F5D73] border border-[#3f7c9a]' :
              t.type === 'warning' ? 'bg-amber-600 border border-amber-500' :
              'bg-rose-600 border border-rose-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="ml-auto font-bold opacity-75 hover:opacity-100 transition duration-100 hover:scale-105"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
