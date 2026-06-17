# Plan Padrino Popayán 🎯

Sistema de gestión de onboarding y apadrinamiento corporativo con seguimiento de hitos y auditoría.

## 📋 Descripción

**Plan Padrino Popayán** es una aplicación web moderna para:
- ✅ Gestionar el onboarding de nuevos colaboradores
- ✅ Asignar mentores (padrinos) a nuevos empleados
- ✅ Rastrear hitos de integración (Inducción, Día 7, Día 30, Día 90)
- ✅ Subir evidencias y documentación
- ✅ Generar reportes y alertas de seguimiento
- ✅ Auditar todas las actividades del sistema

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Estilos** | TailwindCSS 4 + Lucide React (iconos) |
| **Gráficos** | Recharts |
| **Backend** | Firebase (Firestore + Authentication) |
| **Real-time** | Firestore Listeners (onSnapshot) |

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js >= 18.x
- npm >= 11.x

### 1️⃣ Instalación

```bash
git clone <repo-url>
cd Plan_Padrino_PopayanJM
npm install
```

### 2️⃣ Configuración Firebase

Se incluye `.env.local` con credenciales de Firebase ya configuradas:

```env
VITE_FIREBASE_API_KEY=AIzaSyAE61LTE5b1...
VITE_FIREBASE_AUTH_DOMAIN=bd-plan-padrino-popayanj.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bd-plan-padrino-popayanj
VITE_FIREBASE_STORAGE_BUCKET=bd-plan-padrino-popayanj.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=249665576203
VITE_FIREBASE_APP_ID=1:249665576203:web:ab221faa7d2a435771560e
VITE_FIREBASE_MEASUREMENT_ID=G-FVJNHYP4V9
```

**⚠️ Nota:** Reemplaza estos valores con tus credenciales reales si necesitas cambiar el proyecto Firebase.

### 3️⃣ Ejecutar Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### 4️⃣ Build Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── App.tsx                    # Componente raíz + lógica principal
│   ├── firebase.ts                # Configuración Firebase
│   ├── types.ts                   # Tipos TypeScript
│   ├── demoData.ts                # Datos de prueba + helpers
│   ├── userAccess.ts              # Lógica de permisos
│   ├── utils.ts                   # Funciones auxiliares
│   ├── index.css                  # Estilos globales
│   ├── main.tsx                   # Entry point
│   └── components/
│       ├── Login.tsx              # Panel de inicio de sesión
│       ├── Dashboard.tsx          # Panel principal
│       ├── CollaboratorsList.tsx  # Listado de colaboradores
│       ├── CollaboratorCard.tsx   # Detalle de colaborador
│       ├── ReportGenerator.tsx    # Generador de reportes
│       ├── UsersConfig.tsx        # Gestión de usuarios
│       ├── PadrinosConfig.tsx     # Gestión de padrinos
│       ├── AuditHistory.tsx       # Historial de auditoría
│       └── Logo.tsx               # Componente de logo
├── firestore.rules                # Reglas de seguridad Firestore
├── vite.config.ts                 # Config de Vite
├── tsconfig.json                  # Config TypeScript
├── package.json                   # Dependencias
└── .env.local                     # Variables de entorno (privadas)
```

## 🔐 Usuarios por Defecto

Para probar la aplicación sin Firebase Auth, usa estos usuarios (se sincronizarán con Firestore):

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin` | Administrador |
| `consulta` | `consulta` | Consulta (Solo lectura) |

## 🔄 Sincronización Firestore

La aplicación implementa sincronización **híbrida**:
- **Local**: localStorage como caché instantáneo
- **Cloud**: Firestore como fuente de verdad
- **Real-time**: onSnapshot listeners para cambios en tiempo real

```typescript
// Ejemplo: Escuchar cambios de colaboradores
onSnapshot(collection(db, 'collaborators'), (snapshot) => {
  // Actualizar estado cuando Firestore cambia
});
```

## 📊 Colecciones Firestore

### `collaborators`
```javascript
{
  id: "c001",
  documentId: "1234567890",
  fullName: "Juan Carlos Rodríguez",
  role: "Ingeniero de Sistemas",
  area: "Tecnología",
  entryDate: "2026-05-27",
  status: "Activo",
  induction: { status: "Completado", ... },
  day7: { status: "En proceso", ... },
  day30: { status: "Pendiente", ... },
  day90: { status: "Pendiente", ... }
}
```

### `users`
```javascript
{
  id: "u1",
  username: "admin",
  fullName: "Administrador de TH",
  role: "Administrador",
  email: "admin@empresa.com"
}
```

### `auditLogs`
```javascript
{
  id: "log001",
  timestamp: "2026-06-16 10:30:00",
  userId: "u1",
  action: "CREATE",
  entity: "Collaborator",
  entityId: "c001",
  details: "Nuevo colaborador registrado",
  changes: { ... }
}
```

### `padrinos`
```javascript
{
  id: "p001",
  fullName: "Carlos Alberto Pérez",
  role: "Mentor Senior",
  email: "carlos.perez@empresa.com",
  isActive: true
}
```

## 🛡️ Reglas de Seguridad Firestore

Las reglas están definidas en [firestore.rules](firestore.rules):

- ✅ Solo usuarios autenticados pueden leer/escribir
- ✅ Administradores: acceso total
- ✅ Consulta: solo lectura
- ✅ Máximo 850KB por evidencia

## 🔧 Scripts Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Preview de build producción
npm run lint       # Verificar tipos TypeScript
npm run clean      # Limpiar dist y archivos de build
```

## 📋 Próximos Pasos (Roadmap)

- [ ] Integrar Firebase Auth con email/password
- [ ] Subida de archivos a Cloud Storage
- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones por email
- [ ] Dashboard de estadísticas avanzadas
- [ ] Integración SSO (SAML/OAuth2)

## 🐛 Troubleshooting

### Error: "Cannot connect to Firestore"
- Verifica que `.env.local` tenga valores correctos
- Comprueba que las reglas de Firestore permiten el acceso
- Revisa la consola del navegador para detalles

### Error: "npm policy execution"
- En PowerShell: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Data no se sincroniza
- Abre DevTools (F12) y revisa Network/Console
- Verifica que Firestore listeners están activos
- Intenta refrescar la página (Ctrl+R)

## 📞 Soporte

Para reportar bugs o sugerencias, crea un issue en el repositorio.

---

**Última actualización:** Junio 2026  
**Versión:** 0.0.1
