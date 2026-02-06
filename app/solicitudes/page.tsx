import Link from "next/link";
import { FormularioSolicitud } from "@/src/components/solicitudes/FormularioSolicitud";

export default function SolicitudesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Crear solicitud
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Rellena el formulario para registrar una nueva solicitud. Podrás
          consultar su estado en el{" "}
          <Link
            href="/historial"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-100"
          >
            historial
          </Link>
          .
        </p>
      </div>

      <FormularioSolicitud />
    </div>
  );
}
