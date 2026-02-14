"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/src/components/ui";
import { FormularioSolicitud } from "@/src/components/solicitudes/FormularioSolicitud";
import { useAuth } from "@/src/contexts/AuthContext";

export default function SolicitudesPage() {
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
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Crear solicitud
        </h1>
      </div>

      <FormularioSolicitud />
    </div>
  );
}
