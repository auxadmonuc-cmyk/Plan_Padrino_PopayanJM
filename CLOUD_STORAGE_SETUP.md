# ☁️ Integración Cloud Storage (Fotos/Archivos)

## ¿Por Qué Cloud Storage?

Actualmente, los archivos se guardan como **Base64 en Firestore**:
- ✅ Funciona sin configuración extra
- ❌ Límite de 1MB por documento
- ❌ Ineficiente para archivos grandes
- ❌ Lentitud en red

Con **Cloud Storage**:
- ✅ Archivos reales (fotos, PDFs, etc.)
- ✅ Límite de 5GB por archivo
- ✅ Mejor rendimiento
- ✅ Control fino de permisos

---

## 🚀 Configuración Paso a Paso

### 1. Habilitar Cloud Storage en Firebase

Entra a: https://console.firebase.google.com/project/bd-plan-padrino-popayanj/storage

Haz clic en **"Comenzar"** / **"Start"**

Acepta el plan gratuito y **"Listo"**

### 2. Copiar Credenciales

En Firebase Console → Storage → Reglas

Verás tu bucket name. Probablemente sea:
```
bd-plan-padrino-popayanj.firebasestorage.app
```

### 3. Actualizar Código

En [firebase.ts](firebase.ts), agrega:

```typescript
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ← AGREGADO

// Resto del código igual...
```

### 4. Actualizar Reglas de Storage

Ve a: https://console.firebase.google.com/project/bd-plan-padrino-popayanj/storage/rules

Reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /collaborators/{allPaths=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.size < 50 * 1024 * 1024 && // 50MB max
                       request.resource.contentType.matches('image/.*|application/pdf|.*word.*|.*excel.*');
      allow update, delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Haz clic en **"Publicar"**

---

## 💾 Actualizar [CollaboratorCard.tsx](src/components/CollaboratorCard.tsx)

Reemplaza la parte de carga de archivos Base64 con Cloud Storage:

```typescript
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// En el componente:
const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validar tamaño
  if (file.size > 50 * 1024 * 1024) { // 50MB
    addToast('❌ Archivo muy grande (máx 50MB)', 'error');
    return;
  }

  try {
    console.log('📤 Subiendo archivo a Cloud Storage:', file.name);
    
    // Crear ruta única
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `collaborators/${selectedColabId}/${fileName}`);
    
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ Archivo subido exitosamente');
    
    // Obtener URL de descarga
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('🔗 URL de descarga:', downloadUrl);
    
    // Guardar referencia en Firestore
    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      fileName: file.name,
      fileType: file.type.includes('pdf') ? 'pdf' : 
                file.type.includes('word') ? 'word' : 
                file.type.includes('excel') ? 'excel' : 
                file.type.includes('image') ? 'image' : 'video',
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.fullName || 'Unknown',
      url: downloadUrl // ← URL real de Cloud Storage
    };
    
    // Agregar a la lista de evidencias
    setEvidences([...evidences, newEvidence]);
    addToast('✅ Archivo guardado correctamente', 'success');
    
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    addToast(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
  }
};
```

---

## 🖼️ Mostrar Imágenes del Storage

En el componente, cuando muestres evidencias:

```typescript
{evidence.url && (
  <a href={evidence.url} target="_blank" rel="noopener noreferrer">
    {evidence.fileType === 'image' ? (
      <img src={evidence.url} alt={evidence.fileName} className="w-full h-auto" />
    ) : (
      <span>📄 {evidence.fileName}</span>
    )}
  </a>
)}
```

---

## 📋 package.json (Ya Incluido)

Tu proyecto ya tiene `firebase` con Storage incluido. No necesitas instalar nada más.

```json
{
  "dependencies": {
    "firebase": "^12.14.0"
  }
}
```

---

## ✅ Checklist de Integración Cloud Storage

- [ ] Cloud Storage habilitado en Firebase Console
- [ ] [firebase.ts](firebase.ts) importa `getStorage` y exporta `storage`
- [ ] Reglas de Storage configuradas (50MB, validación de tipo)
- [ ] [CollaboratorCard.tsx](src/components/CollaboratorCard.tsx) usa `uploadBytes` y `getDownloadURL`
- [ ] Prueba: sube una foto desde la app
- [ ] Verifica que aparece en Firebase Console → Storage
- [ ] Verifica que URL funciona (abrible en navegador)

---

## 🎯 Versión Simplificada (Recomendado para Empezar)

Si solo quieres **probar sin cambiar código**:

1. Mantén Base64 por ahora (funciona con Firestore)
2. Sigue los pasos de [DEBUGGING_FIREBASE.md](DEBUGGING_FIREBASE.md)
3. Cuando necesites archivos grandes, vuelve aquí e integra Storage

---

## Troubleshooting Cloud Storage

### Error: "cors_error"
→ Las reglas de Storage son demasiado restrictivas

### Error: "storage/unauthorized"
→ El usuario no está autenticado

### Error: "storage/object-not-found"
→ El archivo no existe o fue eliminado

### Archivo sube pero URL no funciona
→ Las reglas permiten write pero no read

---

## Costos

**Plan Gratuito (Firebase Spark):**
- ✅ 5GB almacenamiento
- ✅ 1GB descarga/mes
- ✅ Suficiente para desarrollo

**Plan Pago (Blaze):**
- Costo por uso (barato)
- Para aplicaciones en producción

---

**Recomendación:** Empieza sin Cloud Storage (usa Base64 de momento).

Cuando necesites fotos reales y archivos grandes, vuelve aquí e integra paso a paso.
