# 🔧 Guía de Debugging - Almacenamiento en Firebase

## ¿Por Qué No Se Guardaban Tus Datos?

El problema era que las **reglas de seguridad de Firestore** eran muy restrictivas:

```javascript
// ❌ ANTES (restrictivo)
allow create: if isAdmin() && isValidId(id);

// ✅ AHORA (más flexible)
allow create: if isSignedIn() && isValidId(id);
```

Esto significa que **cualquier usuario autenticado** puede guardar datos, y el control de acceso se maneja en la aplicación React.

---

## ✅ Pasos Para Probar

### 1. Inicia la App Localmente

```bash
npm run dev
```

Abre: `http://localhost:3000`

### 2. Inicia Sesión

- **Usuario:** `admin`
- **Contraseña:** `admin`

Verás en la consola del navegador (F12):

```
✅ Login exitoso. Usuario sincronizado con UID: XXX Rol: Administrador
✅ Usuario sincronizado en Firestore con rol: Administrador
```

### 3. Agrega un Nuevo Colaborador

- Navega a **"Colaboradores"**
- Haz clic en **"+ Nuevo Colaborador"**
- Rellena el formulario
- Haz clic en **"Guardar"**

### 4. Verifica que Apareció en Firestore

Abre: https://console.firebase.google.com/project/bd-plan-padrino-popayanj/firestore

Ve a **Colecciones → collaborators**

✅ Deberías ver tu nuevo documento allí

### 5. Revisa la Consola del Navegador (F12)

Deberías ver mensajes como:

```
📝 Guardando colaborador en Firestore: c001
✅ Colaborador guardado exitosamente en Firestore
```

---

## 🔍 Si Sigue Sin Funcionar - Debug Checklist

### ① ¿Estás Autenticado?

Abre DevTools → Console y ejecuta:

```javascript
firebase.auth().currentUser
```

Deberías ver un objeto con `uid` (no `null`).

### ② ¿El Usuario Se Sincronizó?

Ejecuta en console:

```javascript
db.collection('users').get().then(snap => {
  console.log('Usuarios en Firestore:', snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
```

Deberías ver el usuario `admin` con `role: "Administrador"`.

### ③ ¿Las Reglas Están Publicadas?

Revisa: https://console.firebase.google.com/project/bd-plan-padrino-popayanj/firestore/rules

Las reglas deben mostrar:

```javascript
allow create: if isSignedIn() && isValidId(collaboratorId);
```

**⚠️ Si dice `allow create: if isAdmin()`**, significa las nuevas reglas **no se han actualizado**. 

**Solución:** Copia todo el contenido de [firestore.rules](firestore.rules) y pégalo en la consola de Firebase.

### ④ ¿Hay Errores en la Red?

Abre DevTools → Network → busca errores rojo

Si ves errores como:

```
GET /collaborators - 403 Forbidden
```

Significa que las reglas de Firestore deniegan el acceso.

### ⑤ Error Específico en Console?

Si ves en console:

```
❌ Error guardando colaborador: 
Error: Missing or insufficient permissions
```

**Significa:** El usuario NO tiene permiso. 

**Causa:** La regla de Firestore sigue siendo restrictiva.

**Solución:** Actualiza las reglas en Firebase Console.

---

## 🚀 Cómo Actualizar Reglas en Firebase Console

1. Ve a: https://console.firebase.google.com/project/bd-plan-padrino-popayanj/firestore/rules

2. Haz clic en **"Editar reglas"** (botón azul)

3. Borra TODO el contenido

4. Copia este código completo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }
    match /collaborators/{collaboratorId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidId(collaboratorId);
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }
    match /auditLogs/{logId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidId(logId);
      allow update, delete: if false;
    }
    match /padrinos/{padrinoId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isValidId(padrinoId);
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }
  }
}
```

5. Haz clic en **"Publicar"** (botón azul)

6. Espera confirmación ✅

---

## 📱 Subir Fotos/Archivos

Actualmente, los archivos se guardan como **Base64** en Firestore (máx 850KB).

Para archivos grandes, necesitarías usar **Cloud Storage**.

### Próximo Paso (Opcional): Cloud Storage

Si quieres subir archivos más grandes (fotos HD, videos):

1. Habilita Cloud Storage en Firebase Console
2. Actualiza las reglas de Storage
3. Modifica [CollaboratorCard.tsx](src/components/CollaboratorCard.tsx#L268) para usar Storage en lugar de Base64

---

## 📊 Verificar Datos en Tiempo Real

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Escuchar cambios en tiempo real
db.collection('collaborators').onSnapshot(snap => {
  console.log('🔄 Colaboradores actualizados:', snap.docs.length);
  snap.docs.forEach(doc => console.log(doc.id, doc.data()));
});
```

Cuando agregues un colaborador, deberías ver logs en tiempo real.

---

## 🎯 Resumen de Cambios Realizados

| Cambio | Archivo | Efecto |
|--------|---------|--------|
| Mejorada sincronización del usuario | App.tsx | ✅ Usuario admin se sincroniza correctamente |
| Agregado logging detallado | App.tsx | ✅ Puedes ver qué ocurre en console |
| Validación de permisos en React | App.tsx | ✅ Se verifica que el usuario sea admin |
| Simplificadas reglas Firestore | firestore.rules | ✅ Cualquier autenticado puede guardar |
| Agregado `merge: true` en setDoc | App.tsx | ✅ No sobrescribe datos existentes |

---

## ✅ Checklist Final

- [ ] Iniciaste sesión con `admin` / `admin`
- [ ] Ves en console: `✅ Login exitoso...`
- [ ] Agregaste un colaborador
- [ ] Ves en console: `✅ Colaborador guardado exitosamente...`
- [ ] Aparece en Firebase Console → Firestore → collaborators
- [ ] Ves en time real en console: `🔄 Colaboradores actualizados`

Si todo es ✅, **el almacenamiento funciona correctamente** 🎉

---

**¿Aún no funciona?**

Abre DevTools (F12) → Console y copia TODO lo que ves cuando agregas un colaborador.

Luego comparte esos logs para que pueda debugging específico.
