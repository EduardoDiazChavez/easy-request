/**
 * Punto de entrada para todos los esquemas de validación.
 * Añade aquí las exportaciones cuando crees nuevos formularios.
 */
export { contactFormSchema, type ContactFormValues } from "./contact";
export { loginFormSchema, type LoginFormValues } from "./login";
export { registerFormSchema, type RegisterFormValues } from "./register";
export {
  solicitudFormSchema,
  type SolicitudFormValues,
  type DocumentoRow,
} from "./solicitud";
