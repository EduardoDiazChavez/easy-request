"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LABELS_TIPO_DOCUMENTO } from "./constants";
import { formatFecha } from "@/src/lib/utils";
import type {
  EstatusSolicitud,
  SeguimientoSolicitud,
  Solicitud,
} from "@/src/lib/types/solicitud";
import { EstatusBadge } from "./EstatusBadge";
import { EstatusSelector } from "./EstatusSelector";
import { updateEstatusSolicitud } from "@/src/lib/api/solicitudes";
import { getSeguimiento, crearSeguimiento } from "@/src/lib/api/seguimiento";
import { useAuth } from "@/src/contexts/AuthContext";

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

type VistaModal = "detalle" | "seguimiento";

interface SolicitudDetalleModalProps {
  solicitud: Solicitud | null;
  onClose: () => void;
  /** Si true, se muestra "Creada por". */
  showCreator?: boolean;
  /** Si true, se muestra selector para cambiar estatus (solo admin/supervisor). */
  canEditEstatus?: boolean;
  /** Se llama tras actualizar el estatus para que el padre actualice la solicitud en estado. */
  onEstatusUpdated?: (solicitud: Solicitud) => void;
  /** Se llama cuando se añade un comentario de seguimiento (para actualizar seguimientoCount en lista). */
  onSeguimientoCreado?: () => void;
}

export function SolicitudDetalleModal({
  solicitud,
  onClose,
  showCreator,
  canEditEstatus = false,
  onEstatusUpdated,
  onSeguimientoCreado,
}: SolicitudDetalleModalProps) {
  const { user: currentUser } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vistaModal, setVistaModal] = useState<VistaModal>("detalle");
  const [estatusError, setEstatusError] = useState<string | null>(null);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);

  /** Lista de mensajes; puede incluir uno optimista con _pending: true al enviar. */
  const [seguimientoList, setSeguimientoList] = useState<(SeguimientoSolicitud & { _pending?: boolean })[]>([]);
  const [seguimientoLoading, setSeguimientoLoading] = useState(false);
  const [seguimientoError, setSeguimientoError] = useState<string | null>(null);
  const [textoComentario, setTextoComentario] = useState("");
  const [adjuntosPendientes, setAdjuntosPendientes] = useState<{ nombreArchivo: string; url: string }[]>([]);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setVistaModal("detalle");
    setTextoComentario("");
    setAdjuntosPendientes([]);
    setSeguimientoError(null);
  }, [solicitud?._id]);

  const cargarSeguimiento = useCallback(async () => {
    if (!solicitud?._id) return;
    setSeguimientoLoading(true);
    setSeguimientoError(null);
    try {
      const lista = await getSeguimiento(solicitud._id);
      setSeguimientoList(lista);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setSeguimientoError(msg ?? "Error al cargar el seguimiento");
      setSeguimientoList([]);
    } finally {
      setSeguimientoLoading(false);
    }
  }, [solicitud?._id]);

  /** Hace scroll al final del contenedor de mensajes (solo ese div, sin re-render brusco). */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (vistaModal === "seguimiento" && solicitud?._id) {
      cargarSeguimiento();
    }
  }, [vistaModal, solicitud?._id, cargarSeguimiento]);

  useEffect(() => {
    if (vistaModal === "seguimiento") scrollToBottom();
  }, [vistaModal, seguimientoList.length, scrollToBottom]);

  async function handleEnviarComentario() {
    const texto = textoComentario.trim();
    if (!solicitud?._id || !texto || !currentUser) return;
    const adjuntos = [...adjuntosPendientes];
    const optimisticId = `pending-${Date.now()}`;
    const optimisticMsg: SeguimientoSolicitud & { _pending?: boolean } = {
      _id: optimisticId,
      solicitud: solicitud._id,
      texto,
      adjuntos,
      fecha: new Date().toISOString(),
      autor: { _id: currentUser.id, name: currentUser.name, email: currentUser.email },
      _pending: true,
    };
    setSeguimientoList((prev) => [...prev, optimisticMsg]);
    setTextoComentario("");
    setAdjuntosPendientes([]);
    setEnviandoComentario(true);
    setSeguimientoError(null);
    scrollToBottom();
    try {
      const creado = await crearSeguimiento(solicitud._id, {
        texto,
        adjuntos: adjuntos.length > 0 ? adjuntos : undefined,
      });
      setSeguimientoList((prev) =>
        prev.map((item) =>
          (item as { _pending?: boolean })._pending && item._id === optimisticId ? creado : item
        )
      );
      onSeguimientoCreado?.();
      scrollToBottom();
    } catch (err: unknown) {
      setSeguimientoList((prev) => prev.filter((item) => item._id !== optimisticId));
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setSeguimientoError(msg ?? "Error al enviar el comentario");
    } finally {
      setEnviandoComentario(false);
    }
  }

  function handleSeleccionarArchivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const nuevos: { nombreArchivo: string; url: string }[] = [];
    const pendientes: Promise<void>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      pendientes.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              nuevos.push({ nombreArchivo: file.name, url: reader.result });
            }
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(pendientes).then(() => {
      setAdjuntosPendientes((prev) => [...prev, ...nuevos]);
    });
    e.target.value = "";
  }

  function quitarAdjunto(index: number) {
    setAdjuntosPendientes((prev) => prev.filter((_, i) => i !== index));
  }

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
  const mostrarSeguimiento = solicitud.estatus !== "ejecutado" && solicitud.estatus != null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-solicitud-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Cabecera con pestañas */}
        <header className="flex shrink-0 flex-col border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
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
          </div>
          {mostrarSeguimiento && (
            <nav className="flex gap-1 px-6 pb-2" aria-label="Vista del modal">
              <button
                type="button"
                onClick={() => setVistaModal("detalle")}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  vistaModal === "detalle"
                    ? "bg-white text-zinc-900 shadow dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-700/80"
                }`}
              >
                Detalle
              </button>
              <button
                type="button"
                onClick={() => setVistaModal("seguimiento")}
                className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                  vistaModal === "seguimiento"
                    ? "bg-white text-zinc-900 shadow dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-700/80"
                }`}
              >
                Seguimiento
                {(solicitud.seguimientoCount ?? 0) > 0 && (
                  <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                    {solicitud.seguimientoCount}
                  </span>
                )}
              </button>
            </nav>
          )}
        </header>

        {/* Contenido: misma altura en ambas pestañas (scroll interno en cada una) */}
        <div className="flex h-[55vh] min-h-0 min-w-0 flex-col overflow-hidden">
          {vistaModal === "seguimiento" ? (
            /* Vista chat: ocupa todo el bloque, mensajes con scroll */
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {seguimientoError && (
                <p className="shrink-0 mx-6 mt-3 text-sm text-red-600 dark:text-red-400">
                  {seguimientoError}
                </p>
              )}
              <div
                ref={scrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto px-6 py-4"
                role="log"
                aria-label="Mensajes del seguimiento"
              >
                {seguimientoLoading ? (
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Cargando seguimiento…
                  </p>
                ) : seguimientoList.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Aún no hay comentarios. Escribe uno abajo y adjunta archivos si lo necesitas.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {seguimientoList.map((item) => {
                      const autorObj =
                        typeof item.autor === "object" && item.autor !== null && "name" in item.autor
                          ? item.autor
                          : null;
                      const autorNombre = autorObj ? autorObj.name : "Usuario";
                      const autorId = autorObj && "_id" in autorObj ? String(autorObj._id) : null;
                      const isMio = Boolean(currentUser?.id && autorId && currentUser.id === autorId);

                      return (
                        <li
                          key={item._id}
                          className={`flex ${isMio ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                              isMio
                                ? "rounded-br-md bg-emerald-500 text-white dark:bg-emerald-600"
                                : "rounded-bl-md bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                            }`}
                          >
                            {!isMio && (
                              <div className="mb-1 text-xs font-medium opacity-90">
                                {autorNombre}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {item.texto}
                            </p>
                            {item.adjuntos && item.adjuntos.length > 0 && (
                              <ul className="mt-2 flex flex-wrap gap-1.5">
                                {item.adjuntos.map((adj, idx) => (
                                  <li key={idx}>
                                    <a
                                      href={adj.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                                        isMio
                                          ? "bg-white/20 text-white hover:bg-white/30"
                                          : "bg-zinc-300/80 text-zinc-800 hover:bg-zinc-400/80 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500"
                                      }`}
                                    >
                                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      {adj.nombreArchivo}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div
                              className={`mt-1.5 text-[11px] ${isMio ? "text-emerald-100" : "text-zinc-500 dark:text-zinc-400"}`}
                            >
                              {formatFecha(item.fecha)}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    <li ref={chatEndRef} aria-hidden />
                  </ul>
                )}
              </div>
              <div className="shrink-0 border-t border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                {adjuntosPendientes.length > 0 && (
                  <ul className="mb-3 flex flex-wrap gap-2">
                    {adjuntosPendientes.map((adj, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                      >
                        <span className="truncate max-w-[120px]">{adj.nombreArchivo}</span>
                        <button
                          type="button"
                          onClick={() => quitarAdjunto(idx)}
                          className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:text-zinc-300"
                          aria-label="Quitar adjunto"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="*/*"
                    onChange={handleSeleccionarArchivos}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Adjuntar
                  </button>
                  <textarea
                    value={textoComentario}
                    onChange={(e) => setTextoComentario(e.target.value)}
                    placeholder="Escribe un comentario…"
                    rows={2}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:placeholder-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={handleEnviarComentario}
                    disabled={!textoComentario.trim() || enviandoComentario}
                    className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {enviandoComentario ? "Enviando…" : "Enviar"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vista detalle: sin scroll general; solo la lista de documentos hace scroll */
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Resumen: tipo acción, tipo documento, fecha — fijo, sin scroll */}
          <section className="shrink-0 border-b border-zinc-200 px-6 py-5 dark:border-zinc-700">
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

          {/* Documentos: solo esta sección tiene scroll */}
          <section className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <h3 className="mb-4 shrink-0 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Documentos ({solicitud.documentos.length})
            </h3>
            <div className="pr-1">
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
          )}
        </div>
      </div>
    </div>
  );
}
