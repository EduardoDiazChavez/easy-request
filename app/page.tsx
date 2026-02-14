"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              Comprobando sesión…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-zinc-950 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Gestiona solicitudes y su historial
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Easy Request es una aplicación para crear solicitudes, enviarlas y
            hacer seguimiento de todo su historial en un solo lugar.
          </p>
        </div>

        <section className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            ¿Qué puedes hacer?
          </h2>
          <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-3">
              <span className="text-zinc-400 dark:text-zinc-500">•</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  Crear solicitudes
                </strong>{" "}
                — Envía y registra tus solicitudes de forma sencilla.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 dark:text-zinc-500">•</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  Seguimiento
                </strong>{" "}
                — Consulta el estado y el historial de cada solicitud.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 dark:text-zinc-500">•</span>
              <span>
                <strong className="text-zinc-800 dark:text-zinc-200">
                  Historial centralizado
                </strong>{" "}
                — Todo queda registrado para que no pierdas el rastro.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
