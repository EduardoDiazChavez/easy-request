"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AdminGuard } from "@/src/components/AdminGuard";
import { Card, CardContent, CardHeader, Button } from "@/src/components/ui";
import { Input } from "@/src/components/ui/Input";
import { ROLE_LABELS, type UserAdmin, type UserRole } from "@/src/lib/types/auth";
import {
  fetchUsers,
  updateUser,
  disableUser,
  enableUser,
  deleteUser,
  resetUserPassword,
  type UpdateUserPayload,
} from "@/src/lib/api/users";

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const MENU_APPROX_HEIGHT = 220;

/** Menú desplegable de acciones por fila (estilo kebab). Se renderiza en un Portal con posición fija para no quedar cortado ni detrás de filas. */
interface ActionsMenuProps {
  user: UserAdmin;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  actionLoading: boolean;
  onEdit: (u: UserAdmin) => void;
  onDisable: (u: UserAdmin) => void;
  onEnable: (u: UserAdmin) => void;
  onResetPassword: (u: UserAdmin) => void;
  onDelete: (u: UserAdmin) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

function ActionsMenu({
  user,
  isOpen,
  onToggle,
  onClose,
  actionLoading,
  onEdit,
  onDisable,
  onEnable,
  onResetPassword,
  onDelete,
  menuRef,
}: ActionsMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      queueMicrotask(() => setMenuPosition(null));
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < MENU_APPROX_HEIGHT && spaceAbove > spaceBelow;
    const right = window.innerWidth - rect.right;
    const nextPosition = openUpward
      ? { bottom: window.innerHeight - rect.top + 4, right } as const
      : { top: rect.bottom + 4, right } as const;

    queueMicrotask(() => setMenuPosition(nextPosition));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !portalRef.current?.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const disabled = actionLoading;

  const menuContent =
    isOpen && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={portalRef}
            className="fixed z-9999 min-w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            style={{
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              right: menuPosition.right,
              left: "auto",
            }}
            role="menu"
            aria-orientation="vertical"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Editar
            </button>
            {user.disabled ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onEnable(user);
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Habilitar
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onDisable(user);
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Deshabilitar
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onResetPassword(user);
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Reiniciar clave
            </button>
            <div className="my-1 border-t border-zinc-200 dark:border-zinc-600" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDelete(user);
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Eliminar
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={menuRef} className="relative inline-block text-left">
        <button
          ref={triggerRef}
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Abrir acciones"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      {menuContent}
    </>
  );
}

interface EditUserModalProps {
  user: UserAdmin | null;
  onClose: () => void;
  onSaved: (user: UserAdmin) => void;
}

function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("normal");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setError(null);
    }
  }, [user]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const payload: UpdateUserPayload = { name: name.trim(), email: email.trim().toLowerCase(), role };
      const updated = await updateUser(user.id, payload);
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Error al guardar";
      setError(typeof msg === "string" ? msg : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 id="edit-user-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Editar usuario
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-500"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserAdmin | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "resetPassword";
    user: UserAdmin;
  } | null>(null);

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

  const handleDisable = async (u: UserAdmin) => {
    if (u.disabled) return;
    setActionLoading(u.id);
    try {
      const updated = await disableUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnable = async (u: UserAdmin) => {
    if (!u.disabled) return;
    setActionLoading(u.id);
    try {
      const updated = await enableUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmAction || confirmAction.type !== "delete") return;
    const { user } = confirmAction;
    setActionLoading(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((x) => x.id !== user.id));
      setConfirmAction(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!confirmAction || confirmAction.type !== "resetPassword") return;
    const { user } = confirmAction;
    setActionLoading(user.id);
    try {
      await resetUserPassword(user.id);
      setConfirmAction(null);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminGuard>
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 min-h-[calc(100vh-6rem)]">
        <div className="mb-6 shrink-0">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Administración de usuarios
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Gestiona los usuarios de la plataforma. Solo visible para administradores.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 justify-center py-12">
            <span className="inline-block size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
          </div>
        ) : error ? (
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="py-8 text-center text-zinc-600 dark:text-zinc-400">
              {error}
              <Button className="mt-4" variant="outline" onClick={loadUsers}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-1 flex-col min-h-0">
            <CardHeader className="shrink-0">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Listado de usuarios ({users.length})
              </h2>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
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
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ActionsMenu
                          user={u}
                          isOpen={openActionsId === u.id}
                          onToggle={() =>
                            setOpenActionsId((id) => (id === u.id ? null : u.id))
                          }
                          onClose={() => setOpenActionsId(null)}
                          actionLoading={!!actionLoading}
                          onEdit={setEditUser}
                          onDisable={handleDisable}
                          onEnable={handleEnable}
                          onResetPassword={(user) =>
                            setConfirmAction({ type: "resetPassword", user })
                          }
                          onDelete={(user) =>
                            setConfirmAction({ type: "delete", user })
                          }
                          menuRef={actionsMenuRef}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setConfirmAction(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {confirmAction.type === "delete"
                  ? "¿Eliminar usuario?"
                  : "¿Reiniciar contraseña?"}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {confirmAction.type === "delete"
                  ? `Se eliminará permanentemente a ${confirmAction.user.name} (${confirmAction.user.email}). Esta acción no se puede deshacer.`
                  : `La contraseña de ${confirmAction.user.name} se cambiará a "clave123". El usuario deberá usarla para iniciar sesión.`}
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setConfirmAction(null)}>
                  Cancelar
                </Button>
                {confirmAction.type === "delete" ? (
                  <Button
                    variant="primary"
                    className="bg-red-600! hover:bg-red-700!"
                    onClick={handleDelete}
                    disabled={!!actionLoading}
                  >
                    {actionLoading ? "Eliminando…" : "Eliminar"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleResetPassword}
                    disabled={!!actionLoading}
                  >
                    {actionLoading ? "Reiniciando…" : "Reiniciar clave"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
