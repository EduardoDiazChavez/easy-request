"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, type RegisterFormValues } from "@/src/lib/validations";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardContent } from "@/src/components/ui";

export default function RegistroPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setRegisterError(null);
    const result = await registerUser({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    if (result.ok) {
      router.replace("/");
    } else {
      setRegisterError(result.error ?? "Error al registrarse");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Regístrate como usuario (solo nivel normal)
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register("name")}
                type="text"
                label="Nombre"
                placeholder="Tu nombre"
                autoComplete="name"
                error={errors.name?.message}
              />
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
                autoComplete="new-password"
                error={errors.password?.message}
              />
              <Input
                {...register("confirmPassword")}
                type="password"
                label="Confirmar contraseña"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
              />
              {registerError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  {registerError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Registrarme
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-100"
              >
                Iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
