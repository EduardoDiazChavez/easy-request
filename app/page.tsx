"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/src/components/ui";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              Comprobando sesión…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-zinc-950 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Gestiona solicitudes y su historial
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Easy Request es una aplicación para crear solicitudes, enviarlas y
            hacer seguimiento de todo su historial en un solo lugar.
          </p>
        </div>

        <section className="space-y-8">
          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Módulo Solicitudes
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Desde aquí puedes <strong className="text-zinc-800 dark:text-zinc-200">crear nuevas solicitudes</strong> de
              documentos. Indica el tipo de acción (creación, revisión/actualización o eliminación), el tipo de documento
              (formulario, procedimiento, instrucción de trabajo u otro) y, por cada documento, el código, título,
              descripción del cambio y justificación. Puedes añadir varios documentos en una misma solicitud. Al enviar,
              la solicitud queda registrada y podrás verla en el historial.
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• Definir tipo de acción y tipo de documento.</li>
              <li>• Añadir uno o más documentos con sus datos.</li>
              <li>• Enviar la solicitud para su registro y seguimiento.</li>
            </ul>
            <Link
              href="/solicitudes"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Ir a Crear solicitud
            </Link>
          </section>

          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Módulo Historial
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              En el historial puedes <strong className="text-zinc-800 dark:text-zinc-200">consultar todas tus solicitudes</strong> y,
              si tienes rol de admin o supervisor, las de todos los usuarios. Puedes filtrar por tipo de acción, tipo de
              documento, estatus, rango de fechas y (admin/supervisor) por usuario creador. Cada solicitud se puede abrir
              en detalle para ver su información completa, añadir comentarios de seguimiento y, si tienes permisos,
              actualizar el estatus. Además puedes exportar el listado filtrado a Excel.
            </p>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• Ver listado de solicitudes con filtros avanzados.</li>
              <li>• Abrir el detalle de una solicitud y ver su estado.</li>
              <li>• Añadir seguimiento (comentarios) y, si aplica, cambiar estatus.</li>
              <li>• Exportar a Excel el listado según los filtros aplicados.</li>
            </ul>
            <Link
              href="/historial"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Ir a Historial de solicitudes
            </Link>
          </section>
        </section>
      </div>
    </div>
  );
}
