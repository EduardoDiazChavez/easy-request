"use client";

import { ROLE_LABELS, type UserRole } from "@/src/lib/types/auth";
import {
  type UsersFilterValues,
  USERS_FILTER_DEFAULT,
  STATE_FILTER_OPTIONS,
} from "./usersFilters";

const inputHeightClass = "h-8";
const selectClass =
  "h-8 rounded-lg border border-zinc-300 bg-white pl-3 pr-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-500";

export interface UsersTableFiltersProps {
  value: UsersFilterValues;
  onChange: (value: UsersFilterValues) => void;
}

function hasActiveFilters(f: UsersFilterValues): boolean {
  return f.search.trim() !== "" || f.role !== "" || f.state !== "";
}

export function UsersTableFilters({ value, onChange }: UsersTableFiltersProps) {
  const active = hasActiveFilters(value);

  const handleSearchChange = (v: string) => onChange({ ...value, search: v });
  const handleRoleChange = (v: "" | UserRole) => onChange({ ...value, role: v });
  const handleStateChange = (v: UsersFilterValues["state"]) =>
    onChange({ ...value, state: v });
  const handleClear = () => onChange(USERS_FILTER_DEFAULT);

  return (
    <div className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-64 min-w-[160px]">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            value={value.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className={`${inputHeightClass} ${selectClass} w-full pl-8`}
            aria-label="Buscar usuarios"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={value.role}
            onChange={(e) => handleRoleChange((e.target.value || "") as "" | UserRole)}
            className={selectClass}
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>

          <select
            value={value.state}
            onChange={(e) =>
              handleStateChange(e.target.value as UsersFilterValues["state"])
            }
            className={selectClass}
            aria-label="Filtrar por estado"
          >
            {STATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {active && (
            <button
              type="button"
              onClick={handleClear}
              className={`${inputHeightClass} rounded-lg bg-amber-100 px-3 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-200 dark:bg-amber-500/25 dark:text-amber-100 dark:hover:bg-amber-500/35`}
              aria-label="Limpiar filtros"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
