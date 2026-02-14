import type { EstatusSolicitud, Solicitud } from "@/src/lib/types/solicitud";

export const LABELS_TIPO_ACCION: Record<Solicitud["tipoAccion"], string> = {
  creacion: "Creación",
  revision_actualizacion: "Revisión / Actualización",
  eliminacion: "Eliminación",
};

export const LABELS_TIPO_DOCUMENTO: Record<Solicitud["tipoDocumento"], string> = {
  formulario: "Formulario",
  procedimiento: "Procedimiento",
  instruccion_trabajo: "Instrucción de trabajo",
  otro: "Otro",
};

export const LABELS_ESTATUS: Record<EstatusSolicitud, string> = {
  en_espera: "En espera",
  en_proceso: "En proceso",
  ejecutado: "Ejecutado",
};

export const ESTATUS_OPTIONS: { value: EstatusSolicitud; label: string }[] = [
  { value: "en_espera", label: "En espera" },
  { value: "en_proceso", label: "En proceso" },
  { value: "ejecutado", label: "Ejecutado" },
];
