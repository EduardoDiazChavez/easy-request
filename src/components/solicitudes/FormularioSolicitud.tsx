"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  solicitudFormSchema,
  type SolicitudFormValues,
} from "@/src/lib/validations";
import { api } from "@/src/lib/api/axios";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
} from "@/src/components/ui";

const TIPOS_ACCION = [
  { value: "creacion" as const, label: "Creación" },
  {
    value: "revision_actualizacion" as const,
    label: "Revisión y/o actualización",
  },
  { value: "eliminacion" as const, label: "Eliminación" },
];

const TIPOS_DOCUMENTO = [
  { value: "formulario" as const, label: "Formulario" },
  { value: "procedimiento" as const, label: "Procedimiento" },
  { value: "instruccion_trabajo" as const, label: "Instrucción de trabajo" },
  { value: "otro" as const, label: "Otro (especifique)" },
];

const defaultDocumento = {
  codigo: "",
  tituloDocumento: "",
  descripcionCambio: "",
  justificacion: "",
};

export function FormularioSolicitud() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudFormSchema),
    defaultValues: {
      tipoAccion: "",
      tipoDocumento: "",
      otroEspecifique: "",
      documentos: [defaultDocumento],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documentos",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const tipoAccion = watch("tipoAccion") ?? "";
  const tipoDocumento = watch("tipoDocumento") ?? "";
  const showOtroEspecifique = tipoDocumento === "otro";

  function selectTipoAccion(
    value: Exclude<SolicitudFormValues["tipoAccion"], "">
  ) {
    setValue("tipoAccion", value, { shouldValidate: true });
  }

  function selectTipoDocumento(
    value: Exclude<SolicitudFormValues["tipoDocumento"], "">
  ) {
    setValue("tipoDocumento", value, { shouldValidate: true });
  }

  async function onSubmit(data: SolicitudFormValues) {
    setErrorApi(null);
    try {
      await api.post("/api/solicitudes", data);
      reset({
        tipoAccion: "",
        tipoDocumento: "",
        otroEspecifique: "",
        documentos: [defaultDocumento],
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setErrorApi(
        message ?? "No se pudo enviar la solicitud. Intenta de nuevo."
      );
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg dark:shadow-none sm:border">
      <CardHeader className="bg-gradient-to-b from-zinc-50/80 to-white dark:from-zinc-900/80 dark:to-zinc-900">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Solicitud de cambios en documentos
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Indica el tipo de acción, el tipo de documento y detalla cada
          documento en la tabla. Los documentos deben entregarse en formato
          editable.
        </p>
      </CardHeader>
      <CardContent className="space-y-10 pb-8 pt-6">
        {showSuccess && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30"
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
              aria-hidden
            >
              ✓
            </span>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              La solicitud se ha registrado exitosamente.
            </p>
          </div>
        )}
        {errorApi && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-900/50 dark:bg-red-950/30"
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
              aria-hidden
            >
              !
            </span>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {errorApi}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Sección 1: Tipo de acción */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                1
              </span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Tipo de acción
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Elige una opción: creación, revisión/actualización o eliminación.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pl-0 sm:pl-11">
              {TIPOS_ACCION.map((opt) => {
                const isSelected = tipoAccion === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectTipoAccion(opt.value)}
                    className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:ring-zinc-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {errors.tipoAccion?.message && (
              <p className="text-center text-sm text-red-600 dark:text-red-400 sm:pl-11 sm:text-left">
                {errors.tipoAccion.message}
              </p>
            )}
          </section>

          {/* Sección 2: Tipo de documento */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                2
              </span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Tipo de documento
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Elige un tipo; si eliges «Otro», especifica en el campo de texto.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pl-0 sm:pl-11">
              {TIPOS_DOCUMENTO.map((opt) => {
                const isSelected = tipoDocumento === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectTipoDocumento(opt.value)}
                    className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:ring-zinc-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {showOtroEspecifique && (
              <div className="mx-auto max-w-md pl-0 sm:pl-11">
                <Input
                  placeholder="Especifica el tipo de documento"
                  error={errors.otroEspecifique?.message}
                  className="mt-2"
                  {...register("otroEspecifique")}
                />
              </div>
            )}
            {errors.tipoDocumento?.message && (
              <p className="text-center text-sm text-red-600 dark:text-red-400 sm:pl-11 sm:text-left">
                {errors.tipoDocumento.message}
              </p>
            )}
          </section>

          {/* Sección 3: Detalle de documentos (cards) */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                3
              </span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Detalle de documentos
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Añade al menos un documento con código, título, descripción del
                  cambio y justificación.
                </p>
              </div>
            </div>
            <div className="space-y-4 pl-0 sm:pl-11">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:shadow-none"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Documento {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        onClick={() => remove(index)}
                        title="Quitar documento"
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 sm:max-w-xs">
                      <Input
                        id={`doc-${index}-codigo`}
                        label="Código"
                        placeholder="Ej. DOC-001"
                        error={errors.documentos?.[index]?.codigo?.message}
                        {...register(`documentos.${index}.codigo`)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        id={`doc-${index}-titulo`}
                        label="Título del documento"
                        placeholder="Nombre o título del documento"
                        error={
                          errors.documentos?.[index]?.tituloDocumento?.message
                        }
                        {...register(`documentos.${index}.tituloDocumento`)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea
                        id={`doc-${index}-descripcion`}
                        label="Descripción del cambio a realizar"
                        placeholder="Qué cambios o modificaciones se solicitan..."
                        rows={3}
                        error={
                          errors.documentos?.[index]?.descripcionCambio
                            ?.message
                        }
                        {...register(
                          `documentos.${index}.descripcionCambio`
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea
                        id={`doc-${index}-justificacion`}
                        label="Justificación"
                        placeholder="Por qué se solicita este cambio..."
                        rows={3}
                        error={
                          errors.documentos?.[index]?.justificacion?.message
                        }
                        {...register(`documentos.${index}.justificacion`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed py-3 sm:w-auto"
                onClick={() => append(defaultDocumento)}
              >
                + Añadir otro documento
              </Button>
              {errors.documentos?.message &&
                typeof errors.documentos.message === "string" && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.documentos.message}
                  </p>
                )}
            </div>
          </section>

          {/* Acciones del formulario */}
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({
                  tipoAccion: "",
                  tipoDocumento: "",
                  otroEspecifique: "",
                  documentos: [defaultDocumento],
                });
                setShowSuccess(false);
                setErrorApi(null);
              }}
              disabled={isSubmitting}
              className="order-2 sm:order-1"
            >
              Limpiar formulario
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="order-1 min-w-40 sm:order-2"
            >
              Enviar solicitud
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
