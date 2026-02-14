"use client";

import { Card, CardContent, CardHeader, Button } from "@/src/components/ui";

export interface AccountSectionProps {
  onLogout: () => void;
}

export function AccountSection({ onLogout }: AccountSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Cuenta
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Cerrar sesión o eliminar tu cuenta.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Zona de peligro
          </p>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Eliminar tu cuenta borrará todos tus datos de forma permanente. Esta acción no se puede deshacer.
          </p>
          <Button
            variant="outline"
            disabled
            className="cursor-not-allowed text-zinc-400 dark:text-zinc-500"
            title="Próximamente"
          >
            Eliminar cuenta (próximamente)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
