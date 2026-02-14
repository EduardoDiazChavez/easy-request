"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/src/components/ui";
import { ROLE_LABELS, type UserAdmin } from "@/src/lib/types/auth";
import { UserActionsMenu } from "./UserActionsMenu";
import { UsersTableFilters } from "./UsersTableFilters";
import { formatUserDate } from "./utils";
import type { UsersFilterValues } from "./usersFilters";

export interface UsersTableActions {
  onEdit: (user: UserAdmin) => void;
  onDisable: (user: UserAdmin) => void;
  onEnable: (user: UserAdmin) => void;
  onResetPassword: (user: UserAdmin) => void;
  onDelete: (user: UserAdmin) => void;
}

export interface UsersTableProps {
  users: UserAdmin[];
  openActionsId: string | null;
  onOpenActionsChange: (id: string | null) => void;
  actionLoadingId: string | null;
  actions: UsersTableActions;
  /** Filtros: si se pasan, se muestra la barra de filtros. */
  filterValues?: UsersFilterValues;
  onFilterChange?: (value: UsersFilterValues) => void;
}

export function UsersTable({
  users,
  openActionsId,
  onOpenActionsChange,
  actionLoadingId,
  actions,
  filterValues,
  onFilterChange,
}: UsersTableProps) {
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const hasFilters = filterValues && onFilterChange;

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      {hasFilters && (
        <UsersTableFilters value={filterValues} onChange={onFilterChange} />
      )}
      <CardContent className="min-h-0 flex-1 overflow-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-zinc-200 bg-zinc-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Nombre
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Rol
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Estado
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Fecha alta
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 ${
                  u.disabled ? "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-80" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {u.name}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.disabled ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Deshabilitado
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Activo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {formatUserDate(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <UserActionsMenu
                    user={u}
                    isOpen={openActionsId === u.id}
                    onToggle={() =>
                      onOpenActionsChange(openActionsId === u.id ? null : u.id)
                    }
                    onClose={() => onOpenActionsChange(null)}
                    actionLoading={!!actionLoadingId}
                    menuRef={actionsMenuRef}
                    {...actions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
