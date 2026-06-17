Instrucciones para añadir secrets de Firebase al repositorio (GitHub Actions)

Hola mantenedor/a,

El proyecto necesita las credenciales de Firebase como Secrets para que la Action de build pueda generar la app correctamente en GitHub Pages. He preparado las instrucciones y los valores que puedes copiar y pegar.

---
Qué añadir (Secrets de Actions)

Nombres exactos de secrets (añadir cada uno en Settings → Secrets and variables → Actions → New repository secret):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

Valores (copiar desde Firebase Console → Project settings → Your apps → Firebase SDK snippet):

- VITE_FIREBASE_API_KEY: AIzaSyAE61LTE5b1XWNxQ9t0uH6P_8Jali-uScE
- VITE_FIREBASE_AUTH_DOMAIN: bd-plan-padrino-popayanj.firebaseapp.com
- VITE_FIREBASE_PROJECT_ID: bd-plan-padrino-popayanj
- VITE_FIREBASE_STORAGE_BUCKET: bd-plan-padrino-popayanj.firebasestorage.app
- VITE_FIREBASE_MESSAGING_SENDER_ID: 249665576203
- VITE_FIREBASE_APP_ID: 1:249665576203:web:ab221faa7d2a435771560e
- VITE_FIREBASE_MEASUREMENT_ID: G-FVJNHYP4V9

(Estos valores están en `.env.local` del repo; aquí se listan para facilitar su copia.)

---
Cómo añadir los secrets (pasos rápidos)

1. En GitHub, ve al repositorio → `Settings` → `Secrets and variables` → `Actions`.
2. Pulsa `New repository secret`.
3. Pega el nombre (por ejemplo `VITE_FIREBASE_API_KEY`) y su valor correspondiente.
4. Repite para cada secret de la lista.

---
Forzar un nuevo deploy (después de añadir secrets)

Desde tu máquina o desde GitHub Cloud Shell:

```bash
# Crear commit vacío para disparar workflow
git commit --allow-empty -m "Trigger CI with Firebase secrets"
git push origin main
```

Luego revisa GitHub → Actions → Build and Deploy job.

---
Notas de seguridad y recomendaciones

- Las claves de Firebase para frontend (`apiKey`) no son verdaderos secretos para autenticación, son identificadores públicos; aun así, usa `Secrets` para la build.
- En Google Cloud Console → APIs & Services → Credentials puedes restringir la API Key por HTTP referrers. Añade `https://auxadmonuc-cmyk.github.io` y/o tu dominio custom para mayor seguridad.
- Si prefieres no exponer la API key en el HTML, elimina la inyección runtime `index.html` que añadimos y usa la solución con `Secrets` (recomendada).

---
Si quieres, puedo crear un Pull Request con este archivo y las instrucciones traducidas para el equipo, o puedo dejarlo así para que lo copies y pegues en el Issue o en un mensaje al maintainer.
