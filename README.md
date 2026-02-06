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

Crea un archivo `.env.local` en la raíz del proyecto (o configura en tu entorno):

| Variable               | Descripción                          | Ejemplo                    |
|------------------------|--------------------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL`  | URL base del backend (API)           | `http://localhost:3000`    |

Si no la defines, el frontend usa por defecto `http://localhost:3000`.

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

- **Frontend:** se puede desplegar en Vercel, Netlify o similar. Configura `NEXT_PUBLIC_API_URL` con la URL del backend en producción.
- **Backend:** despliega en tu proveedor (Railway, Render, etc.) con `MONGO_URI` y `JWT_SECRET` de producción.

---

## Más información

- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
