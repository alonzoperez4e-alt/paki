# Despliegue de Paki Landing Page (Vercel / Netlify)

Esta aplicación incluye el frontend completo en React + Tailwind CSS y la función serverless `api/register.js` con `nodemailer` para enviar invitaciones automáticas por correo electrónico usando Gmail SMTP.

## 1. Crear una Contraseña de Aplicación en Gmail (App Password)

1. Ingresa a [myaccount.google.com/security](https://myaccount.google.com/security) con la cuenta `pakibodegas@gmail.com`.
2. Activa la **Verificación en 2 pasos** (requisito de Google).
3. En el buscador superior de la cuenta, busca **Contraseñas de aplicaciones** (*App passwords*).
4. Crea una nueva clave con el nombre `Paki Landing` y copia los **16 caracteres** generados (sin espacios).

## 2. Variables de Entorno Requeridas

Configura estas variables en tu proveedor de hosting (nunca las escribas directamente en el código):

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `GMAIL_USER` | Correo Gmail remitente | `pakibodegas@gmail.com` |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de 16 caracteres de Gmail | `abcd efgh ijkl mnop` (sin espacios) |
| `ADMIN_PANEL_PASSCODE` | Clave secreta para abrir el "Panel de interesados" | `TuClaveSegura2026!` |
| `VITE_WHATSAPP_NUMBER` | Número WhatsApp Perú con código de país `51` | `51987654321` |

## 3. Desplegar en Vercel (Recomendado)

1. Sube este repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. Vercel detectará automáticamente `vercel.json`, el frontend Vite (`dist/`) y la función serverless `api/register.js`.
4. Ve a **Project Settings -> Environment Variables** y agrega `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_PANEL_PASSCODE` y `VITE_WHATSAPP_NUMBER`.
5. Haz clic en **Deploy**. El endpoint `POST /api/register` quedará activo automáticamente.

## 4. Desplegar en Netlify

1. Importa el repositorio en Netlify con:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. Agrega las mismas variables en **Site configuration -> Environment variables**.
3. Para Netlify Functions, expón `api/register.js` como función en `netlify/functions/register.js` o usa un `netlify.toml` con redirect `/api/*` -> `/.netlify/functions/:splat`.
