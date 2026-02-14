"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UserAdmin } from "@/src/lib/types/auth";

const MENU_APPROX_HEIGHT = 220;

export interface UserActionsMenuProps {
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

/** Menú desplegable de acciones por fila (estilo kebab). Se renderiza en un Portal con posición fija. */
export function UserActionsMenu({
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
}: UserActionsMenuProps) {
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
          disabled={actionLoading}
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
