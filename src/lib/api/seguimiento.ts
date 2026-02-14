/**
 * API de seguimiento (comentarios/chat) por solicitud.
 */
import { api } from "@/src/lib/api/axios";
import type {
  AdjuntoSeguimiento,
  SeguimientoSolicitud,
} from "@/src/lib/types/solicitud";

export async function getSeguimiento(
  solicitudId: string
): Promise<SeguimientoSolicitud[]> {
  const { data } = await api.get<SeguimientoSolicitud[]>(
    `/api/solicitudes/${solicitudId}/seguimiento`
  );
  return Array.isArray(data) ? data : [];
}

export interface CrearSeguimientoPayload {
  texto: string;
  adjuntos?: AdjuntoSeguimiento[];
}

export async function crearSeguimiento(
  solicitudId: string,
  payload: CrearSeguimientoPayload
): Promise<SeguimientoSolicitud> {
  const { data } = await api.post<SeguimientoSolicitud>(
    `/api/solicitudes/${solicitudId}/seguimiento`,
    payload
  );
  return data;
}
