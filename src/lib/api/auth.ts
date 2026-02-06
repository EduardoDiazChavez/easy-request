import type { User } from "@/src/lib/types/auth";
import { api } from "./axios";

const AUTH_BASE = "/api/auth";

/** Respuesta de login y register desde el backend */
export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** Registro: solo crea usuarios con role "normal" en el backend */
export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(`${AUTH_BASE}/register`, payload);
  return data;
}

/** Login: email + password, backend devuelve user + token */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(`${AUTH_BASE}/login`, {
    email,
    password,
  });
  return data;
}
