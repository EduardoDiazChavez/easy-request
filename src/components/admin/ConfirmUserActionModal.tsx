"use client";

import { Button } from "@/src/components/ui";
import type { UserAdmin } from "@/src/lib/types/auth";

export type ConfirmUserActionType = "delete" | "resetPassword";

export interface ConfirmUserActionModalProps {
  type: ConfirmUserActionType;
  user: UserAdmin;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmUserActionModal({
  type,
  user,
  loading,
  onConfirm,
  onCancel,
}: ConfirmUserActionModalProps) {
  const isDelete = type === "delete";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {isDelete ? "¿Eliminar usuario?" : "¿Reiniciar contraseña?"}
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isDelete
            ? `Se eliminará permanentemente a ${user.name} (${user.email}). Esta acción no se puede deshacer.`
            : `La contraseña de ${user.name} se cambiará a "clave123". El usuario deberá usarla para iniciar sesión.`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          {isDelete ? (
            <Button
              variant="primary"
              className="bg-red-600! hover:bg-red-700!"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Eliminando…" : "Eliminar"}
            </Button>
          ) : (
            <Button onClick={onConfirm} disabled={loading}>
              {loading ? "Reiniciando…" : "Reiniciar clave"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
