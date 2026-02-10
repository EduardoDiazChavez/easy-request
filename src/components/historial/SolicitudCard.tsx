"use client";

import { Card, CardContent, CardHeader } from "@/src/components/ui";
import { LABELS_TIPO_ACCION, LABELS_TIPO_DOCUMENTO } from "./constants";
import { formatFecha } from "@/src/lib/utils";
import type { Solicitud } from "@/src/lib/types/solicitud";

const BADGE_TIPO_ACCION: Record<
  Solicitud["tipoAccion"],
  { label: string; className: string }
> = {
  creacion: {
    label: "Creación",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  revision_actualizacion: {
    label: "Revisión / Actualización",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  eliminacion: {
    label: "Eliminación",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
};

interface SolicitudCardProps {
  solicitud: Solicitud;
  onClick: () => void;
}

export function SolicitudCard({ solicitud, onClick }: SolicitudCardProps) {
  const badge = BADGE_TIPO_ACCION[solicitud.tipoAccion];
  const tipoDoc =
    solicitud.tipoDocumento === "otro" && solicitud.otroEspecifique
      ? solicitud.otroEspecifique
      : LABELS_TIPO_DOCUMENTO[solicitud.tipoDocumento];
  const previewDoc = solicitud.documentos[0];
  const correlativo = solicitud.correlativo ?? `#${solicitud._id.slice(-6)}`;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {correlativo}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {tipoDoc}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {formatFecha(solicitud.fechaCreacion)} · {solicitud.documentos.length}{" "}
            {solicitud.documentos.length === 1 ? "documento" : "documentos"}
          </p>
        </div>
        <span
          className="shrink-0 text-zinc-400 dark:text-zinc-500"
          aria-hidden
        >
          →
        </span>
      </CardHeader>
      <CardContent className="border-t-0 pt-3">
        {previewDoc ? (
          <div className="rounded-lg bg-zinc-50 py-2.5 px-3 dark:bg-zinc-800/50">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {previewDoc.codigo}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {" "}
              — {previewDoc.tituloDocumento}
            </span>
            {solicitud.documentos.length > 1 && (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                +{solicitud.documentos.length - 1} más
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sin documentos en esta solicitud
          </p>
        )}
      </CardContent>
    </Card>
  );
}
