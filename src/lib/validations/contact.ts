import { z } from 'zod';

/**
 * Esquema de validación Zod para el formulario de contacto.
 * Compatible con react-hook-form + @hookform/resolvers (zodResolver).
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
  subject: z
    .string()
    .min(3, 'El asunto debe tener al menos 3 caracteres')
    .max(200, 'El asunto no puede superar 200 caracteres'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede superar 2000 caracteres'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
