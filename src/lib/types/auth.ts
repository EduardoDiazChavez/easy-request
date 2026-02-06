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

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  normal: "Usuario",
};
