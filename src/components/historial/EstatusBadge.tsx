"use client";

import type { EstatusSolicitud } from "@/src/lib/types/solicitud";
import { LABELS_ESTATUS } from "./constants";

const BADGE_CLASSES: Record<EstatusSolicitud, string> = {
  en_espera:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  en_proceso:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  ejecutado:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
};

interface EstatusBadgeProps {
  estatus: EstatusSolicitud | undefined | null;
  /** Tamaño visual: "sm" para tarjetas, "md" por defecto para modal. */
  size?: "sm" | "md";
  className?: string;
}

export function EstatusBadge({
  estatus,
  size = "md",
  className = "",
}: EstatusBadgeProps) {
  const value = estatus ?? "en_espera";
  const label = LABELS_ESTATUS[value];
  const badgeClass = BADGE_CLASSES[value];
  const sizeClass =
    size === "sm"
      ? "px-1.5 py-0.5 text-[11px]"
      : "px-2 py-0.5 text-sm";

  return (
    <span
      className={`inline-flex rounded-md font-medium ${sizeClass} ${badgeClass} ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}
