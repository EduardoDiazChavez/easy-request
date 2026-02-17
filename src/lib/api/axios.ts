import axios from "axios";

/**
 * Instancia de Axios configurada para mi-proyecto-backend.
 * La URL se elige por entorno:
 * - Desarrollo (next dev): .env.development → http://localhost:3000
 * - Producción (next build/start): .env.production → https://easy-request-backend.onrender.com
 * Se puede sobreescribir con NEXT_PUBLIC_API_URL en .env.local
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_STORAGE_KEY = "easy-request-token";

/** Añade el token a las peticiones si existe (solo en cliente) */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Errores globales; 401 limpia sesión en cliente */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error && typeof error === "object" && "response" in error) {
      const res = (error as { response?: { status?: number } }).response;
      if (res?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem("easy-request-user");
      }
    }
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Error en la petición";
    console.error("Error en la petición:", message);
    return Promise.reject(error);
  }
);

/** Exportar clave para que AuthContext pueda guardar/borrar el token */
export { TOKEN_STORAGE_KEY };
