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

export const TIPO_ACCION_OPTIONS: { value: Solicitud["tipoAccion"]; label: string }[] = [
  { value: "creacion", label: "Creación" },
  { value: "revision_actualizacion", label: "Revisión / Actualización" },
  { value: "eliminacion", label: "Eliminación" },
];

export const TIPO_DOCUMENTO_OPTIONS: { value: Solicitud["tipoDocumento"]; label: string }[] = [
  { value: "formulario", label: "Formulario" },
  { value: "procedimiento", label: "Procedimiento" },
  { value: "instruccion_trabajo", label: "Instrucción de trabajo" },
  { value: "otro", label: "Otro" },
];
