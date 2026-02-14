"use client";

export function AdminUsuariosPageHeader() {
  return (
    <div className="mb-6 shrink-0">
      <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Administración de usuarios
      </h1>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        Gestiona los usuarios de la plataforma. Solo visible para administradores.
      </p>
    </div>
  );
}
