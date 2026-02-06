import { z } from "zod";

/**
 * Esquema de validación para el formulario de login.
 * Compatible con react-hook-form + @hookform/resolvers (zodResolver).
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Introduce un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
