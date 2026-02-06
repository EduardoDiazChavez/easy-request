import type { Solicitud } from "@/src/lib/types/solicitud";

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
