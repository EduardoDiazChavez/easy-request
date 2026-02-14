"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS_TIPO_DOCUMENTO } from "./constants";
import { formatFecha } from "@/src/lib/utils";
import type { EstatusSolicitud, Solicitud } from "@/src/lib/types/solicitud";
import { EstatusBadge } from "./EstatusBadge";
import { EstatusSelector } from "./EstatusSelector";
import { updateEstatusSolicitud } from "@/src/lib/api/solicitudes";

const BADGE_TIPO_ACCION: Record<
  Solicitud["tipoAccion"],
  { label: string; className: string }
> = {
  creacion: {
    label: "Creación",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  revision_actualizacion: {
    label: "Revisión / Actualización",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  eliminacion: {
    label: "Eliminación",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
  },
};

interface SolicitudDetalleModalProps {
  solicitud: Solicitud | null;
  onClose: () => void;
  /** Si true, se muestra "Creada por". */
  showCreator?: boolean;
  /** Si true, se muestra selector para cambiar estatus (solo admin/supervisor). */
  canEditEstatus?: boolean;
  /** Se llama tras actualizar el estatus para que el padre actualice la solicitud en estado. */
  onEstatusUpdated?: (solicitud: Solicitud) => void;
}

export function SolicitudDetalleModal({
  solicitud,
  onClose,
  showCreator,
  canEditEstatus = false,
  onEstatusUpdated,
}: SolicitudDetalleModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [estatusError, setEstatusError] = useState<string | null>(null);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);

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

  async function handleEstatusChange(newEstatus: EstatusSolicitud) {
    const id = solicitud?._id;
    if (!id) return;
    setEstatusError(null);
    setUpdatingEstatus(true);
    try {
      const updated = await updateEstatusSolicitud(id, newEstatus);
      onEstatusUpdated?.(updated);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setEstatusError(msg ?? "No se pudo actualizar el estatus.");
    } finally {
      setUpdatingEstatus(false);
    }
  }

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-solicitud-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Cabecera */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h2
            id="detalle-solicitud-title"
            className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100"
          >
            {correlativo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Cerrar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Resumen: tipo acción, tipo documento, fecha */}
          <section className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-700">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Tipo de acción
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-sm font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Tipo de documento
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {tipoDoc}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Fecha de creación
                </dt>
                <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {formatFecha(solicitud.fechaCreacion)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Estatus
                </dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  {canEditEstatus ? (
                    <>
                      <EstatusSelector
                        value={solicitud.estatus}
                        onChange={handleEstatusChange}
                        isLoading={updatingEstatus}
                      />
                      {estatusError && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {estatusError}
                        </p>
                      )}
                    </>
                  ) : (
                    <EstatusBadge estatus={solicitud.estatus} size="md" />
                  )}
                </dd>
              </div>
              {showCreator &&
                solicitud.creadoPor &&
                typeof solicitud.creadoPor === "object" &&
                "name" in solicitud.creadoPor && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Creada por
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {solicitud.creadoPor.name}{" "}
                      <span className="text-zinc-500 dark:text-zinc-400">
                        ({solicitud.creadoPor.email})
                      </span>
                    </dd>
                  </div>
                )}
            </dl>
          </section>

          {/* Documentos */}
          <section className="px-6 py-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Documentos ({solicitud.documentos.length})
            </h3>
            <div
              className={
                solicitud.documentos.length > 2
                  ? "max-h-[min(55vh,420px)] overflow-y-auto pr-1"
                  : undefined
              }
            >
              <ul className="space-y-6">
                {solicitud.documentos.map((doc, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30"
                >
                  {/* Cabecera del documento: número + código + título */}
                  <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                        {i + 1}
                      </span>
                      <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {doc.codigo}
                      </span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        —
                      </span>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {doc.tituloDocumento}
                      </span>
                    </div>
                  </div>
                  {/* Cuerpo: descripción y justificación */}
                  <div className="space-y-4 px-4 py-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Descripción del cambio
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {doc.descripcionCambio || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Justificación
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {doc.justificacion || "—"}
                      </p>
                    </div>
                  </div>
                </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
