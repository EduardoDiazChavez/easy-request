"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/src/components/ui";
import {
  SolicitudCard,
  SolicitudDetalleModal,
} from "@/src/components/historial";
import { api } from "@/src/lib/api/axios";
import type { Solicitud } from "@/src/lib/types/solicitud";
import { useAuth } from "@/src/contexts/AuthContext";
import { exportSolicitudesToExcel } from "@/src/lib/types/exportSolicitudesToExcel";

export default function HistorialPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);
  const [exporting, setExporting] = useState(false);

  const puedeVerTodas =
    user?.role === "admin" || user?.role === "supervisor";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    api
      .get<Solicitud[]>("/api/solicitudes")
      .then((res) => {
        if (!cancelled) {
          setSolicitudes(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ??
            err.message ??
            "Error al cargar las solicitudes";
          setError(msg);
          setSolicitudes([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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

  async function handleExportExcel() {
    if (solicitudes.length === 0) return;
    setExporting(true);
    try {
      await exportSolicitudesToExcel(solicitudes);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Historial de solicitudes
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {puedeVerTodas
              ? "Todas las solicitudes realizadas en el sistema, ordenadas por fecha (más recientes primero)."
              : "Tus solicitudes realizadas, ordenadas por fecha (más recientes primero)."}
          </p>
        </div>
        {!loading && !error && solicitudes.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting}
            isLoading={exporting}
            className="shrink-0"
          >
            {exporting ? "Exportando…" : "Exportar a Excel"}
          </Button>
        )}
      </div>

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              Cargando solicitudes…
            </p>
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="py-6">
            <p className="text-amber-800 dark:text-amber-200">{error}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Comprueba que el backend esté en marcha y que{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">
                NEXT_PUBLIC_API_URL
              </code>{" "}
              apunte a la URL correcta (ej. http://localhost:3000).
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && solicitudes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                No hay solicitudes registradas todavía.
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                Crea tu primera solicitud desde la página{" "}
                <Link
                  href="/solicitudes"
                  className="font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-100"
                >
                  Crear solicitud
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && solicitudes.length > 0 && (
        <ul className="space-y-5" role="list">
          {solicitudes.map((s) => (
            <li key={s._id}>
              <SolicitudCard
                solicitud={s}
                onClick={() => setSolicitudSeleccionada(s)}
                showCreator
              />
            </li>
          ))}
        </ul>
      )}

      {solicitudSeleccionada && (
        <SolicitudDetalleModal
          solicitud={solicitudSeleccionada}
          onClose={() => setSolicitudSeleccionada(null)}
          showCreator
          canEditEstatus={puedeVerTodas}
          onEstatusUpdated={(updated) => {
            setSolicitudSeleccionada(updated);
            setSolicitudes((prev) =>
              prev.map((s) => (s._id === updated._id ? updated : s))
            );
          }}
        />
      )}
    </div>
  );
}
