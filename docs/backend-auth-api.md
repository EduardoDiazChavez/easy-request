# API de autenticación (backend)

El frontend (Easy Request) usa estos endpoints del backend para registro e inicio de sesión seguros.

## Base URL

- Configurar en el frontend con `NEXT_PUBLIC_API_URL` (ej: `http://localhost:3000`).
- El backend debe estar en la misma URL que uses en esa variable (por defecto el backend corre en `http://localhost:3000`).

## Endpoints

### POST /api/auth/register

Registra un usuario nuevo. **Solo crea usuarios con rol `normal`.** Admin y supervisor se crean en la BDD.

- **Body:** `{ "name": string, "email": string, "password": string }`
- **Éxito (201):** `{ "user": { id, email, name, role }, "token": string }`
- **Errores:** 400 (datos inválidos), 409 (email ya existe), 500

### POST /api/auth/login

Inicio de sesión. Las contraseñas se validan con hash en el backend.

- **Body:** `{ "email": string, "password": string }`
- **Éxito (200):** `{ "user": { id, email, name, role }, "token": string }`
- **Errores:** 400 (faltan campos), 401 (credenciales incorrectas), 500

## Uso en el frontend

- Tras login o registro, se guardan `user` y `token` en localStorage.
- Las peticiones autenticadas llevan `Authorization: Bearer <token>`.
- En 401 la app limpia sesión y el usuario debe volver a iniciar sesión.
