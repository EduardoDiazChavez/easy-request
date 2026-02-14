/**
 * API de solicitudes (mi-proyecto-backend).
 */
import { api } from "@/src/lib/api/axios";
import type { EstatusSolicitud, Solicitud } from "@/src/lib/types/solicitud";

/** Actualiza el estatus de una solicitud. Solo admin/supervisor (backend devuelve 403 a rol normal). */
export async function updateEstatusSolicitud(
  id: string,
  estatus: EstatusSolicitud
): Promise<Solicitud> {
  const { data } = await api.patch<Solicitud>(
    `/api/solicitudes/${id}/estatus`,
    { estatus }
  );
  return data;
}
