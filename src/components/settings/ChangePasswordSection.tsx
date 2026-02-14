"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, Button } from "@/src/components/ui";
import { Input } from "@/src/components/ui/Input";
import { changePassword } from "@/src/lib/api/auth";

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Error al cambiar la contraseña";
      setError(typeof msg === "string" ? msg : "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Cambiar contraseña
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Usa una contraseña segura de al menos 6 caracteres.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Contraseña actualizada correctamente.
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Cambiando…" : "Cambiar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
