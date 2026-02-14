"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/src/components/ui";
import {
  SolicitudCard,
  SolicitudDetalleModal,
} from "@/src/components/historial";
import {
  TIPO_ACCION_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  ESTATUS_OPTIONS,
} from "@/src/components/historial/constants";
import { api } from "@/src/lib/api/axios";
import type { Solicitud, EstatusSolicitud } from "@/src/lib/types/solicitud";
import { useAuth } from "@/src/contexts/AuthContext";
import { exportSolicitudesToExcel } from "@/src/lib/types/exportSolicitudesToExcel";

/** Obtiene el ID del usuario creador para filtrar (string o objeto con _id). */
function getCreadorId(creadoPor: Solicitud["creadoPor"]): string | null {
  if (!creadoPor) return null;
  if (typeof creadoPor === "string") return creadoPor;
  return (creadoPor as { _id: string })._id ?? null;
}

/** Obtiene etiqueta del creador para el selector (name o email). */
function getCreadorLabel(creadoPor: Solicitud["creadoPor"]): string {
  if (!creadoPor || typeof creadoPor !== "object") return "Sin asignar";
  const c = creadoPor as { name?: string; email?: string };
  const nombre = c.name?.trim() || "";
  const email = c.email?.trim() || "";
  if (nombre) return email ? `${nombre} (${email})` : nombre;
  return email || "Sin nombre";
}

export interface FiltrosHistorial {
  tipoAccion: Solicitud["tipoAccion"] | "";
  tipoDocumento: Solicitud["tipoDocumento"] | "";
  creadoPorId: string;
  estatus: EstatusSolicitud | "";
  fechaDesde: string;
  fechaHasta: string;
}

const FILTROS_DEFAULT: FiltrosHistorial = {
  tipoAccion: "",
  tipoDocumento: "",
  creadoPorId: "",
  estatus: "",
  fechaDesde: "",
  fechaHasta: "",
};

const selectClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";
const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";

export default function HistorialPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<Solicitud | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosHistorial>(FILTROS_DEFAULT);
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState(false);
  const overlayFiltrosRef = useRef<HTMLDivElement>(null);

  const puedeVerTodas =
    user?.role === "admin" || user?.role === "supervisor";

  /** Lista única de creadores (solo cuando hay populate) para el filtro. */
  const creadoresUnicos = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of solicitudes) {
      const id = getCreadorId(s.creadoPor);
      if (id && typeof s.creadoPor === "object" && s.creadoPor !== null) {
        map.set(id, getCreadorLabel(s.creadoPor));
      }
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [solicitudes]);

  /** Solicitudes filtradas según estado actual de filtros. */
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((s) => {
      if (filtros.tipoAccion && s.tipoAccion !== filtros.tipoAccion) return false;
      if (filtros.tipoDocumento && s.tipoDocumento !== filtros.tipoDocumento) return false;
      if (filtros.creadoPorId) {
        const id = getCreadorId(s.creadoPor);
        if (id !== filtros.creadoPorId) return false;
      }
      if (filtros.estatus && (s.estatus ?? "en_espera") !== filtros.estatus) return false;
      if (filtros.fechaDesde) {
        const fecha = s.fechaCreacion.slice(0, 10);
        if (fecha < filtros.fechaDesde) return false;
      }
      if (filtros.fechaHasta) {
        const fecha = s.fechaCreacion.slice(0, 10);
        if (fecha > filtros.fechaHasta) return false;
      }
      return true;
    });
  }, [solicitudes, filtros]);

  const tieneFiltrosActivos = Boolean(
    filtros.tipoAccion || filtros.tipoDocumento || filtros.creadoPorId || filtros.estatus || filtros.fechaDesde || filtros.fechaHasta
  );

  useEffect(() => {
    if (!modalFiltrosAbierto) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalFiltrosAbierto(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === overlayFiltrosRef.current) setModalFiltrosAbierto(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [modalFiltrosAbierto]);

  const cargarSolicitudes = useCallback((): Promise<Solicitud[]> => {
    return api
      .get<Solicitud[]>("/api/solicitudes")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setSolicitudes(list);
        setError(null);
        return list;
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ??
          err.message ??
          "Error al cargar las solicitudes";
        setError(msg);
        setSolicitudes([]);
        return [];
      });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    setLoading(true);
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
    if (solicitudesFiltradas.length === 0) return;
    setExporting(true);
    try {
      await exportSolicitudesToExcel(solicitudesFiltradas);
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
        
        </div>
        {!loading && !error && solicitudesFiltradas.length > 0 && (
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

      {!loading && !error && solicitudes.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalFiltrosAbierto(true)}
            className="inline-flex h-8 items-center gap-1.5 px-3 text-sm"
            aria-label={tieneFiltrosActivos ? "Filtros activos. Abrir filtros" : "Abrir filtros"}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {tieneFiltrosActivos && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200 px-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                {solicitudesFiltradas.length}
              </span>
            )}
          </Button>
          
        </div>
      )}

      {modalFiltrosAbierto && (
        <div
          ref={overlayFiltrosRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-filtros-title"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <h2 id="modal-filtros-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Filtros del historial
              </h2>
              <button
                type="button"
                onClick={() => setModalFiltrosAbierto(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="filtro-tipo-accion" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Tipo de acción
                  </label>
                  <select
                    id="filtro-tipo-accion"
                    value={filtros.tipoAccion}
                    onChange={(e) => setFiltros((f) => ({ ...f, tipoAccion: e.target.value as FiltrosHistorial["tipoAccion"] }))}
                    className={selectClass}
                    aria-label="Filtrar por tipo de acción"
                  >
                    <option value="">Todos</option>
                    {TIPO_ACCION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filtro-tipo-documento" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Tipo de documento
                  </label>
                  <select
                    id="filtro-tipo-documento"
                    value={filtros.tipoDocumento}
                    onChange={(e) => setFiltros((f) => ({ ...f, tipoDocumento: e.target.value as FiltrosHistorial["tipoDocumento"] }))}
                    className={selectClass}
                    aria-label="Filtrar por tipo de documento"
                  >
                    <option value="">Todos</option>
                    {TIPO_DOCUMENTO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {puedeVerTodas && (
                  <div className="sm:col-span-2">
                    <label htmlFor="filtro-creador" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Creado por
                    </label>
                    <select
                      id="filtro-creador"
                      value={filtros.creadoPorId}
                      onChange={(e) => setFiltros((f) => ({ ...f, creadoPorId: e.target.value }))}
                      className={selectClass}
                      aria-label="Filtrar por usuario creador"
                    >
                      <option value="">Todos</option>
                      {creadoresUnicos.map(({ id, label }) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="filtro-estatus" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Estatus
                  </label>
                  <select
                    id="filtro-estatus"
                    value={filtros.estatus}
                    onChange={(e) => setFiltros((f) => ({ ...f, estatus: e.target.value as FiltrosHistorial["estatus"] }))}
                    className={selectClass}
                    aria-label="Filtrar por estatus"
                  >
                    <option value="">Todos</option>
                    {ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filtro-fecha-desde" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Fecha desde
                  </label>
                  <input
                    id="filtro-fecha-desde"
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros((f) => ({ ...f, fechaDesde: e.target.value }))}
                    className={inputClass}
                    aria-label="Filtrar desde fecha"
                  />
                </div>
                <div>
                  <label htmlFor="filtro-fecha-hasta" className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Fecha hasta
                  </label>
                  <input
                    id="filtro-fecha-hasta"
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros((f) => ({ ...f, fechaHasta: e.target.value }))}
                    className={inputClass}
                    aria-label="Filtrar hasta fecha"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Resultados: {solicitudesFiltradas.length} de {solicitudes.length} solicitudes
              </p>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
              {tieneFiltrosActivos && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFiltros(FILTROS_DEFAULT);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
              <Button type="button" onClick={() => setModalFiltrosAbierto(false)}>
                Listo
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {!loading && !error && solicitudes.length > 0 && solicitudesFiltradas.length === 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-amber-800 dark:text-amber-200">
              No hay solicitudes que coincidan con los filtros aplicados.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setFiltros(FILTROS_DEFAULT)}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && solicitudesFiltradas.length > 0 && (
        <ul className="space-y-5" role="list">
          {solicitudesFiltradas.map((s) => (
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
          onSeguimientoCreado={async () => {
            const list = await cargarSolicitudes();
            setSolicitudSeleccionada((prev) => {
              if (!prev) return null;
              const updated = list.find((s) => s._id === prev._id);
              return updated ?? { ...prev, seguimientoCount: (prev.seguimientoCount ?? 0) + 1 };
            });
          }}
        />
      )}
    </div>
  );
}
