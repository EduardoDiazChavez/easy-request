"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/src/components/AdminGuard";
import { Card, CardContent, Button } from "@/src/components/ui";
import {
  AdminUsuariosPageHeader,
  UsersTable,
  EditUserModal,
  ConfirmUserActionModal,
  applyUsersFilters,
  USERS_FILTER_DEFAULT,
  type ConfirmUserActionType,
  type UsersFilterValues,
} from "@/src/components/admin";
import type { UserAdmin } from "@/src/lib/types/auth";
import {
  fetchUsers,
  disableUser,
  enableUser,
  deleteUser,
  resetUserPassword,
} from "@/src/lib/api/users";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [filters, setFilters] = useState<UsersFilterValues>(USERS_FILTER_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserAdmin | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: ConfirmUserActionType;
    user: UserAdmin;
  } | null>(null);

  const filteredUsers = useMemo(
    () => applyUsersFilters(users, filters),
    [users, filters]
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDisable = useCallback(async (u: UserAdmin) => {
    if (u.disabled) return;
    setActionLoadingId(u.id);
    try {
      const updated = await disableUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const handleEnable = useCallback(async (u: UserAdmin) => {
    if (!u.disabled) return;
    setActionLoadingId(u.id);
    try {
      const updated = await enableUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== "delete") return;
    const { user } = confirmAction;
    setActionLoadingId(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((x) => x.id !== user.id));
      setConfirmAction(null);
    } finally {
      setActionLoadingId(null);
    }
  }, [confirmAction]);

  const handleResetPassword = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== "resetPassword") return;
    const { user } = confirmAction;
    setActionLoadingId(user.id);
    try {
      await resetUserPassword(user.id);
      setConfirmAction(null);
    } finally {
      setActionLoadingId(null);
    }
  }, [confirmAction]);

  const tableActions = {
    onEdit: setEditUser,
    onDisable: handleDisable,
    onEnable: handleEnable,
    onResetPassword: (user: UserAdmin) =>
      setConfirmAction({ type: "resetPassword", user }),
    onDelete: (user: UserAdmin) => setConfirmAction({ type: "delete", user }),
  };

  return (
    <AdminGuard>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col px-4 py-8 sm:px-6">
        <AdminUsuariosPageHeader />

        {loading ? (
          <div className="flex flex-1 justify-center py-12">
            <span className="inline-block size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
          </div>
        ) : error ? (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardContent className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              {error}
              <Button className="mt-4" variant="outline" onClick={loadUsers}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <UsersTable
            users={filteredUsers}
            openActionsId={openActionsId}
            onOpenActionsChange={setOpenActionsId}
            actionLoadingId={actionLoadingId}
            actions={tableActions}
            filterValues={filters}
            onFilterChange={setFilters}
          />
        )}

        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={(updated) => {
              setUsers((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x))
              );
            }}
          />
        )}

        {confirmAction && (
          <ConfirmUserActionModal
            type={confirmAction.type}
            user={confirmAction.user}
            loading={!!actionLoadingId}
            onConfirm={
              confirmAction.type === "delete" ? handleDelete : handleResetPassword
            }
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </div>
    </AdminGuard>
  );
}
