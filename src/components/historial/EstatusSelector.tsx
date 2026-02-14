"use client";

import type { EstatusSolicitud } from "@/src/lib/types/solicitud";
import { ESTATUS_OPTIONS } from "./constants";

interface EstatusSelectorProps {
  value: EstatusSolicitud | undefined | null;
  onChange: (estatus: EstatusSolicitud) => void;
  disabled?: boolean;
  isLoading?: boolean;
  id?: string;
  className?: string;
}

export function EstatusSelector({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  id = "estatus-solicitud",
  className = "",
}: EstatusSelectorProps) {
  const current = value ?? "en_espera";

  return (
    <select
      id={id}
      value={current}
      onChange={(e) => onChange(e.target.value as EstatusSolicitud)}
      disabled={disabled || isLoading}
      className={`h-8 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-sm text-zinc-800 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 ${className}`}
      aria-label="Cambiar estatus de la solicitud"
    >
      {ESTATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
