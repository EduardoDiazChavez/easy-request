import { z } from "zod";

/**
 * Esquema de validación para el formulario de registro.
 * Solo usuarios normales; admin/supervisor se crean en la BDD.
 */
export const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede superar 100 caracteres"),
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Introduce un email válido"),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
