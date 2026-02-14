import type { UserAdmin, UserRole } from "@/src/lib/types/auth";

/** Valores del formulario de filtros de la tabla de usuarios */
export interface UsersFilterValues {
  search: string;
  role: "" | UserRole;
  state: "" | "activo" | "deshabilitado";
}

export const USERS_FILTER_DEFAULT: UsersFilterValues = {
  search: "",
  role: "",
  state: "",
};

export const STATE_FILTER_OPTIONS: { value: UsersFilterValues["state"]; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "deshabilitado", label: "Deshabilitado" },
];

/** Aplica los filtros a la lista de usuarios (búsqueda por nombre/email, rol y estado). */
export function applyUsersFilters(
  users: UserAdmin[],
  filters: UsersFilterValues
): UserAdmin[] {
  const search = filters.search.trim().toLowerCase();
  return users.filter((u) => {
    if (search) {
      const matchName = u.name.toLowerCase().includes(search);
      const matchEmail = u.email.toLowerCase().includes(search);
      if (!matchName && !matchEmail) return false;
    }
    if (filters.role && u.role !== filters.role) return false;
    if (filters.state === "activo" && u.disabled) return false;
    if (filters.state === "deshabilitado" && !u.disabled) return false;
    return true;
  });
}
