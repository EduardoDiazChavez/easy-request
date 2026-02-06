"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

/**
 * Rutas en las que NO se muestra el header.
 * Añade paths exactos ('/login') o prefijos ('/auth' oculta /auth, /auth/login, etc.)
 */
const ROUTES_WITHOUT_HEADER = ["/login", "/registro"];

function shouldHideHeader(pathname: string): boolean {
  return ROUTES_WITHOUT_HEADER.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function HeaderVisibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = shouldHideHeader(pathname ?? "");

  if (hideHeader) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </>
  );
}
