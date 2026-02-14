/**
 * Tipos para la respuesta del API de solicitudes (mi-proyecto-backend).
 */

export interface DocumentoSolicitud {
  codigo: string;
  tituloDocumento: string;
  descripcionCambio: string;
  justificacion: string;
}

/** Estatus de ejecución de la solicitud. Solo admin/supervisor pueden cambiarlo en el backend. */
export type EstatusSolicitud = "en_espera" | "en_proceso" | "ejecutado";

export interface Solicitud {
  _id: string;
  /** Número de solicitud generado por el backend (ej. SL-1, SL-2). Puede no existir en datos antiguos. */
  correlativo?: string;
  tipoAccion: "creacion" | "revision_actualizacion" | "eliminacion";
  tipoDocumento: "formulario" | "procedimiento" | "instruccion_trabajo" | "otro";
  otroEspecifique?: string | null;
  documentos: DocumentoSolicitud[];
  fechaCreacion: string;
  /**
   * Usuario que creó la solicitud.
   * - Si el backend hace populate: { _id, name, email } (solo visible para admin/supervisor en UI).
   * - Si no: puede ser el ID en string o null.
   */
  creadoPor?: string | { _id: string; name: string; email: string } | null;
  /** Estatus de ejecución. Por defecto en_espera. */
  estatus?: EstatusSolicitud;
}
