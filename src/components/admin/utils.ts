/** Formatea una fecha ISO o string para mostrar en listados (ej. tabla de usuarios). */
export function formatUserDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
