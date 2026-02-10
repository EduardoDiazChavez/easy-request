"use client";

import { useEffect, useRef } from "react";
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

interface SolicitudDetalleModalProps {
  solicitud: Solicitud | null;
  onClose: () => void;
}

export function SolicitudDetalleModal({
  solicitud,
  onClose,
}: SolicitudDetalleModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!solicitud) return null;

  const badge = BADGE_TIPO_ACCION[solicitud.tipoAccion];
  const tipoDoc =
    solicitud.tipoDocumento === "otro" && solicitud.otroEspecifique
      ? solicitud.otroEspecifique
      : LABELS_TIPO_DOCUMENTO[solicitud.tipoDocumento];
  const correlativo =
    solicitud.correlativo ?? `#${solicitud._id.slice(-6)}`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-solicitud-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2
            id="detalle-solicitud-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Solicitud {correlativo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Cerrar"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {correlativo}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">{tipoDoc}</span>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Fecha de creación: {formatFecha(solicitud.fechaCreacion)}
          </p>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Documentos ({solicitud.documentos.length})
            </h3>
            <ul className="space-y-4">
              {solicitud.documentos.map((doc, i) => (
                <li key={i}>
                  <Card className="overflow-hidden border-zinc-200 dark:border-zinc-700">
                    <CardHeader className="border-b border-zinc-200 bg-zinc-50/80 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {doc.codigo}
                        </span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          — {doc.tituloDocumento}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 py-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Descripción del cambio
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {doc.descripcionCambio || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Justificación
                        </p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {doc.justificacion || "—"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
