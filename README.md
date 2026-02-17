# Easy Request

Aplicación para crear solicitudes de cambios en documentos, enviarlas al backend y consultar su historial. Incluye autenticación por roles (admin, supervisor, usuario normal) y registro de usuarios.

---

## Tecnologías

| Área           | Stack                                      |
|----------------|--------------------------------------------|
| Framework      | Next.js 16 (App Router)                    |
| UI             | React 19, Tailwind CSS 4                   |
| Formularios    | react-hook-form, Zod (@hookform/resolvers) |
| HTTP           | Axios (baseURL configurable)              |
| Auth           | JWT en localStorage + contexto React       |

---

## Requisitos

- **Node.js** 18+ (recomendado 20+)
- **Backend** en marcha y accesible (ver sección Backend)
- **MongoDB** (Atlas o local) para el backend

---

## Variables de entorno

La API se elige automáticamente según el entorno:

| Entorno      | Comando        | Archivo cargado      | API por defecto                              |
|--------------|----------------|----------------------|----------------------------------------------|
| Desarrollo   | `npm run dev`  | `.env.development`   | `http://localhost:3000` (backend local)      |
| Producción   | `npm run build` / `npm run start` | `.env.production` | `https://easy-request-backend.onrender.com`  |

| Variable               | Descripción                          | Ejemplo                                           |
|------------------------|--------------------------------------|---------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | URL base del backend (API)           | Desarrollo: `http://localhost:3000` / Producción: `https://easy-request-backend.onrender.com` |

- Los archivos `.env.development` y `.env.production` están en el repo con las URLs por defecto.
- Para sobreescribir en tu máquina (sin commitear), usa `.env.local` (desarrollo) o `.env.production.local` (producción).
- Copia `.env.example` como referencia si creas un `.env.local` nuevo.

---

## Cómo ejecutar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Arrancar el frontend

En este proyecto (easy-request):

```bash
npm run dev
```

Next.js usa el puerto **3000** por defecto. Si el backend ya está en 3000, arranca el frontend en otro puerto:

```bash
npm run dev -- -p 3001
```

Abre en el navegador la URL que indique el comando (por ejemplo `http://localhost:3000` o `http://localhost:3001`).



## Scripts

| Comando        | Descripción                |
|----------------|----------------------------|
| `npm run dev`  | Servidor de desarrollo     |
| `npm run build`| Build de producción        |
| `npm run start`| Servidor de producción     |
| `npm run lint` | Ejecutar ESLint           |

## Despliegue

- **Frontend:** despliega en Vercel, Netlify o similar. En el build de producción Next.js usará `.env.production`, así que la API ya apunta a `https://easy-request-backend.onrender.com`. Si usas otra URL de backend, define `NEXT_PUBLIC_API_URL` en las variables de entorno del servicio.
- **Backend:** ya desplegado en Render; el frontend en producción lo usa por defecto.

---

## Más información

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
