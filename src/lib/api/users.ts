import type { UserAdmin, UserRole } from "@/src/lib/types/auth";
import { api } from "./axios";

const USERS_BASE = "/api/users";

export async function fetchUsers(): Promise<UserAdmin[]> {
  const { data } = await api.get<UserAdmin[]>(USERS_BASE);
  return data;
}

export async function fetchUser(id: string): Promise<UserAdmin> {
  const { data } = await api.get<UserAdmin>(`${USERS_BASE}/${id}`);
  return data;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<UserAdmin> {
  const { data } = await api.patch<UserAdmin>(`${USERS_BASE}/${id}`, payload);
  return data;
}

export async function disableUser(id: string): Promise<UserAdmin> {
  const { data } = await api.patch<UserAdmin>(`${USERS_BASE}/${id}/disable`);
  return data;
}

export async function enableUser(id: string): Promise<UserAdmin> {
  const { data } = await api.patch<UserAdmin>(`${USERS_BASE}/${id}/enable`);
  return data;
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${USERS_BASE}/${id}`);
  return data;
}

export async function resetUserPassword(id: string): Promise<{
  message: string;
  user: UserAdmin;
}> {
  const { data } = await api.patch<{ message: string; user: UserAdmin }>(
    `${USERS_BASE}/${id}/reset-password`
  );
  return data;
}
