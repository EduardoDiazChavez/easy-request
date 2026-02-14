"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormValues } from "@/src/lib/validations";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardContent } from "@/src/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoginError(null);
    const result = await login(data.email, data.password);
    if (result.ok) {
      router.replace("/");
    } else {
      setLoginError(result.error ?? "Error al iniciar sesión");
    }
  }

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Comprobando sesión…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Introduce tu email y contraseña
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register("email")}
                type="email"
                label="Email"
                placeholder="tu@email.com"
                autoComplete="email"
                error={errors.email?.message}
              />
              <Input
                {...register("password")}
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
              />
              {loginError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                {loginError}
              </p>
            )}
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Entrar
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              ¿No tienes cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-100"
              >
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
