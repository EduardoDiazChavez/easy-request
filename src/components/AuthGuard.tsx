"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/registro";

const PUBLIC_PATHS = [LOGIN_PATH, REGISTER_PATH];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Protege las rutas: redirige a /login si no hay sesión;
 * en /login o /registro con sesión, redirige a /.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = isPublicPath(pathname ?? null);

    if (isPublic && user) {
      router.replace("/");
      return;
    }

    if (!isPublic && !user) {
      router.replace(LOGIN_PATH);
    }
  }, [pathname, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
      </div>
    );
  }

  const isPublic = isPublicPath(pathname ?? null);
  if (!isPublic && !user) {
    return null;
  }

  return <>{children}</>;
}
