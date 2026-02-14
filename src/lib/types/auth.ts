/**
 * Roles de usuario (de mayor a menor nivel).
 * - admin: nivel más alto, acceso total.
 * - supervisor: nivel medio.
 * - normal: nivel más bajo.
 */
export type UserRole = "admin" | "supervisor" | "normal";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Usuario tal como lo devuelve el listado de admin (incluye disabled y createdAt) */
export interface UserAdmin extends User {
  disabled: boolean;
  createdAt?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  normal: "Usuario",
};
