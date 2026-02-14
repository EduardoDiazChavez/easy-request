"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Button } from "@/src/components/ui";
import { Input } from "@/src/components/ui/Input";
import type { User } from "@/src/lib/types/auth";
import { updateProfile, type UpdateProfilePayload } from "@/src/lib/api/auth";

export interface ProfileSectionProps {
  user: User;
  onUpdated: (user: User) => void;
}

export function ProfileSection({ user, onUpdated }: ProfileSectionProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };
      const updated = await updateProfile(payload);
      onUpdated(updated);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Error al guardar";
      setError(typeof msg === "string" ? msg : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = name.trim() !== user.name || email.trim().toLowerCase() !== user.email;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Perfil
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Tu nombre y correo. Estos datos se usan para identificarte en la plataforma.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Perfil actualizado correctamente.
            </p>
          )}
          <Button type="submit" disabled={saving || !hasChanges}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
