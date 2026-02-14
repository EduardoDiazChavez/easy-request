/**
 * Exporta el listado de solicitudes a un archivo Excel (.xlsx) con dos hojas:
 * - Solicitudes: resumen por solicitud (correlativo, tipo, fecha, creador, nº docs).
 * - Documentos: detalle de cada documento (una fila por documento).
 */
import type { Solicitud } from "./solicitud";
import {
  LABELS_TIPO_ACCION,
  LABELS_TIPO_DOCUMENTO,
  LABELS_ESTATUS,
} from "@/src/components/historial/constants";

function formatFechaExcel(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getCreadorNombre(creadoPor: Solicitud["creadoPor"]): string {
  if (!creadoPor || typeof creadoPor !== "object") return "";
  const c = creadoPor as { name?: string; email?: string };
  return c.name?.trim() || "";
}

function getCreadorEmail(creadoPor: Solicitud["creadoPor"]): string {
  if (!creadoPor || typeof creadoPor !== "object") return "";
  const c = creadoPor as { name?: string; email?: string };
  return c.email?.trim() || "";
}

export async function exportSolicitudesToExcel(solicitudes: Solicitud[]): Promise<void> {
  const XLSX = await import("xlsx");

  // ——— Hoja 1: Solicitudes (resumen) ———
  const headersSolicitudes = [
    "Correlativo",
    "Tipo de acción",
    "Tipo de documento",
    "Otro (especifique)",
    "Fecha de creación",
    "Estatus",
    "Creado por (nombre)",
    "Creado por (email)",
    "Nº documentos",
  ];
  const rowsSolicitudes = solicitudes.map((s) => [
    s.correlativo ?? s._id,
    LABELS_TIPO_ACCION[s.tipoAccion],
    LABELS_TIPO_DOCUMENTO[s.tipoDocumento],
    s.otroEspecifique ?? "",
    formatFechaExcel(s.fechaCreacion),
    LABELS_ESTATUS[s.estatus ?? "en_espera"],
    getCreadorNombre(s.creadoPor),
    getCreadorEmail(s.creadoPor),
    s.documentos?.length ?? 0,
  ]);
  const dataSolicitudes = [headersSolicitudes, ...rowsSolicitudes];
  const wsSolicitudes = XLSX.utils.aoa_to_sheet(dataSolicitudes);

  // Anchos de columna (hoja Solicitudes)
  wsSolicitudes["!cols"] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 24 },
    { wch: 28 },
    { wch: 12 },
  ];

  // ——— Hoja 2: Documentos (detalle) ———
  const headersDocumentos = [
    "Correlativo",
    "Nº doc",
    "Código",
    "Título del documento",
    "Descripción del cambio",
    "Justificación",
  ];
  const rowsDocumentos: (string | number)[][] = [];
  for (const s of solicitudes) {
    const correlativo = s.correlativo ?? s._id;
    (s.documentos ?? []).forEach((doc, idx) => {
      rowsDocumentos.push([
        correlativo,
        idx + 1,
        doc.codigo ?? "",
        doc.tituloDocumento ?? "",
        doc.descripcionCambio ?? "",
        doc.justificacion ?? "",
      ]);
    });
  }
  const dataDocumentos = [headersDocumentos, ...rowsDocumentos];
  const wsDocumentos = XLSX.utils.aoa_to_sheet(dataDocumentos);

  wsDocumentos["!cols"] = [
    { wch: 12 },
    { wch: 8 },
    { wch: 18 },
    { wch: 32 },
    { wch: 40 },
    { wch: 40 },
  ];

  // ——— Libro con dos hojas ———
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSolicitudes, "Solicitudes");
  XLSX.utils.book_append_sheet(wb, wsDocumentos, "Documentos");

  const nombreArchivo = `historial-solicitudes-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
}
