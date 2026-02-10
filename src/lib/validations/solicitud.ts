import { z } from "zod";

/**
 * Esquema para cada fila de la tabla de documentos.
 */
const documentoRowSchema = z.object({
  codigo: z.string().max(50, "Máximo 50 caracteres"),
  tituloDocumento: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "Máximo 200 caracteres"),
  descripcionCambio: z
    .string()
    .min(1, "La descripción del cambio es obligatoria")
    .max(2000, "Máximo 2000 caracteres"),
  justificacion: z
    .string()
    .min(1, "La justificación es obligatoria")
    .max(2000, "Máximo 2000 caracteres"),
});

/**
 * Esquema de validación Zod para el formulario de solicitudes de cambios en documentos.
 * Tipo de acción y tipo de documento son de selección única.
 */
export const solicitudFormSchema = z
  .object({
    tipoAccion: z
      .enum(["creacion", "revision_actualizacion", "eliminacion"])
      .or(z.literal("")),

    tipoDocumento: z
      .enum(["formulario", "procedimiento", "instruccion_trabajo", "otro"])
      .or(z.literal("")),

    otroEspecifique: z.string().max(100, "Máximo 100 caracteres").optional(),

    documentos: z
      .array(documentoRowSchema)
      .min(1, "Añade al menos un documento"),
  })
  .refine((data) => data.tipoAccion !== "", {
    message: "Selecciona un tipo de acción",
    path: ["tipoAccion"],
  })
  .refine((data) => data.tipoDocumento !== "", {
    message: "Selecciona un tipo de documento",
    path: ["tipoDocumento"],
  })
  .refine(
    (data) => {
      if (data.tipoDocumento === "otro") {
        return (
          data.otroEspecifique != null &&
          data.otroEspecifique.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Especifica el tipo de documento cuando eliges 'Otro'",
      path: ["otroEspecifique"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.tipoAccion === "creacion") return;
    data.documentos.forEach((doc, index) => {
      if (!doc.codigo?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El código es obligatorio",
          path: ["documentos", index, "codigo"],
        });
      }
    });
  });

export type SolicitudFormValues = z.infer<typeof solicitudFormSchema>;
export type DocumentoRow = z.infer<typeof documentoRowSchema>;
