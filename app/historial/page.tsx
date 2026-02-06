"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/src/components/ui";
import { LABELS_TIPO_ACCION, LABELS_TIPO_DOCUMENTO } from "@/src/components/historial";
import { api } from "@/src/lib/api/axios";
import { formatFecha } from "@/src/lib/utils";
import type { Solicitud } from "@/src/lib/types/solicitud";

export default function HistorialPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Historial de solicitudes
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Todas las solicitudes realizadas, ordenadas por fecha (más recientes primero).
        </p>
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
        <ul className="space-y-4">
          {solicitudes.map((s) => (
            <li key={s._id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {LABELS_TIPO_ACCION[s.tipoAccion]} —{" "}
                      {LABELS_TIPO_DOCUMENTO[s.tipoDocumento]}
                      {s.tipoDocumento === "otro" && s.otroEspecifique
                        ? ` (${s.otroEspecifique})`
                        : ""}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatFecha(s.fechaCreacion)} · {s.documentos.length}{" "}
                      {s.documentos.length === 1 ? "documento" : "documentos"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <ul className="space-y-2">
                    {s.documentos.map((doc, i) => (
                      <li
                        key={i}
                        className="rounded-lg bg-zinc-50 py-2 px-3 text-sm dark:bg-zinc-800/50"
                      >
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {doc.codigo}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {" "}
                          — {doc.tituloDocumento}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
