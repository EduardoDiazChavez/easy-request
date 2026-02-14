"use client";

import { Card, CardContent, CardHeader } from "@/src/components/ui";

export function PreferencesSection() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Preferencias
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Apariencia e idioma (próximamente).
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Tema:</span>{" "}
            Se respetará la preferencia de tu sistema. En una futura versión podrás elegir tema claro u oscuro.
          </p>
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Idioma:</span>{" "}
            La interfaz está en español. Soporte para más idiomas llegará más adelante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
