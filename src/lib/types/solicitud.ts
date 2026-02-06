/**
 * Tipos para la respuesta del API de solicitudes (mi-proyecto-backend).
 */

export interface DocumentoSolicitud {
  codigo: string;
  tituloDocumento: string;
  descripcionCambio: string;
  justificacion: string;
}

export interface Solicitud {
  _id: string;
  tipoAccion: "creacion" | "revision_actualizacion" | "eliminacion";
  tipoDocumento: "formulario" | "procedimiento" | "instruccion_trabajo" | "otro";
  otroEspecifique?: string | null;
  documentos: DocumentoSolicitud[];
  fechaCreacion: string;
}
