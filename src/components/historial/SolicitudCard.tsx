"use client";

import { LABELS_TIPO_DOCUMENTO } from "./constants";
import { formatFecha } from "@/src/lib/utils";
import type { Solicitud } from "@/src/lib/types/solicitud";
import { EstatusBadge } from "./EstatusBadge";

const BADGE_TIPO_ACCION: Record<
  Solicitud["tipoAccion"],
  { label: string; accent: string; badge: string }
> = {
  creacion: {
    label: "Creación",
    accent: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  revision_actualizacion: {
    label: "Revisión / Actualización",
    accent: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  eliminacion: {
    label: "Eliminación",
    accent: "bg-rose-500",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
  },
};

interface SolicitudCardProps {
  solicitud: Solicitud;
  onClick: () => void;
  /** Si true, se muestra "Creada por" (solo para admin/supervisor). */
  showCreator?: boolean;
}

function getCreadorLabel(creadoPor: Solicitud["creadoPor"]): string | null {
  if (!creadoPor || typeof creadoPor !== "object" || !("name" in creadoPor || "email" in creadoPor))
    return null;
  const c = creadoPor as { name?: string; email?: string };
  const nombre = c.name?.trim() || "";
  const email = c.email?.trim() || "";
  if (nombre) return email ? `${nombre} (${email})` : nombre;
  return email || null;
}

export function SolicitudCard({ solicitud, onClick, showCreator }: SolicitudCardProps) {
  const config = BADGE_TIPO_ACCION[solicitud.tipoAccion];
  const tipoDoc =
    solicitud.tipoDocumento === "otro" && solicitud.otroEspecifique
      ? solicitud.otroEspecifique
      : LABELS_TIPO_DOCUMENTO[solicitud.tipoDocumento];
  const previewDoc = solicitud.documentos[0];
  const correlativo = solicitud.correlativo ?? `#${solicitud._id.slice(-6)}`;
  const hasMore = solicitud.documentos.length > 1;
  const numDocs = solicitud.documentos.length;
  const creadorLabel = getCreadorLabel(solicitud.creadoPor);
  const mostrarNotificacion =
    solicitud.estatus !== "ejecutado" && solicitud.estatus != null;
  const count = solicitud.seguimientoCount ?? 0;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:shadow-lg cursor-pointer"
    >
      {/* Barra de acento por tipo de acción */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 shrink-0 ${config.accent}`}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col pl-5 pr-4 pt-0">
        {/* Zona 1: Cabecera — tipo de acción + tipo documento (izq), correlativo + botón (der) */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-4 dark:border-zinc-800">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
              {tipoDoc}
            </p>
            <div className="mt-[1px]">
              <span
                className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium ${config.badge}`}
              >
                {config.label}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {mostrarNotificacion && (
              <span
                className="flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
                title="Seguimiento / notificaciones"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {count > 0 && <span>{count}</span>}
              </span>
            )}
            <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {correlativo}
            </span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-600 dark:bg-zinc-800 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-300"
              aria-hidden
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Zona 2: Metadatos — fecha, documentos y (solo admin/supervisor) creador */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 py-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Fecha
            </span>
            {formatFecha(solicitud.fechaCreacion)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Documentos
            </span>
            {numDocs} {numDocs === 1 ? "documento" : "documentos"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Estatus
            </span>
            <EstatusBadge estatus={solicitud.estatus} size="sm" />
          </span>
          {showCreator && creadorLabel && (
              <span className="flex items-center gap-1.5">
                <span className="font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Creada por
                </span>
                {creadorLabel}
              </span>
            )}
        </div>

        {/* Zona 3: Vista previa del contenido */}
        <div className="pb-4">
          {previewDoc ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Primer documento
              </p>
              <p className="mt-1.5 text-sm">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {previewDoc.codigo}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {" "}
                  — {previewDoc.tituloDocumento}
                </span>
              </p>
              {hasMore && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  +{numDocs - 1} documento{numDocs > 2 ? "s" : ""} más en esta solicitud
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-200 py-3 px-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Sin documentos
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
