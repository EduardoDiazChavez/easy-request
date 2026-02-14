"use client";

import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { UserMenu } from "@/src/components/UserMenu";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-backdrop-filter:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          Easy Request
        </Link>

        <nav className="flex items-center gap-6" aria-label="Navegación principal">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Inicio
          </Link>
          <Link
            href="/solicitudes"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Solicitudes
          </Link>
          <Link
            href="/historial"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Historial
          </Link>
          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
