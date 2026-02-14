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

/** Obtiene el usuario actual (requiere token) */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>(`${AUTH_BASE}/me`);
  return data;
}

/** Actualiza nombre y/o email del usuario actual */
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch<User>(`${AUTH_BASE}/profile`, payload);
  return data;
}

/** Cambia la contraseña del usuario actual */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>(`${AUTH_BASE}/change-password`, payload);
  return data;
}
