"use client";

import Link from "next/link";
import { AuthGuard } from "@/src/components/AuthGuard";
import {
  ProfileSection,
  ChangePasswordSection,
  PreferencesSection,
  AccountSection,
} from "@/src/components/settings";
import { useAuth } from "@/src/contexts/AuthContext";

export default function ConfiguracionPage() {
  const { user, updateUser, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Configuración de la cuenta
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gestiona tu perfil, contraseña y preferencias.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {user && (
            <ProfileSection user={user} onUpdated={updateUser} />
          )}
          <ChangePasswordSection />
          <PreferencesSection />
          <AccountSection onLogout={logout} />
        </div>
      </div>
    </AuthGuard>
  );
}
