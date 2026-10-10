"use client";

import * as React from "react";
import { Save, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { InputSimpananTunaiPayload } from "@/lib/api";
import { showAlert } from "@/lib/alert";

interface InputSimpananTunaiFormProps {
  initialValues?: Partial<InputSimpananTunaiPayload>;
  onSubmit: (values: InputSimpananTunaiPayload) => void;
  onSaveAndNew?: (
    values: InputSimpananTunaiPayload,
  ) => boolean | Promise<boolean>;
  onCancel?: () => void;
}

const inputSimpananTunaiSchema = z.object({
  TanggalSetor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal setor tidak valid"),
  NoEmployee: z.string().trim().min(1, "No employee wajib diisi"),
  JenisSimpanan: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  Nama: z
    .string()
    .trim()
    .min(5, "Alamat wajib diisi")
    .max(500, "Alamat maksimal 500 karakter"),
  JumlahSimpanan: z
    .number()
    .nonnegative("Simpanan pokok tidak boleh negatif"),
  JumlahBulan: z
    .number()
    .nonnegative("Simpanan wajib tidak boleh negatif"),
});

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const defaultValues: InputSimpananTunaiPayload = {
  TanggalSetor: getLocalDate(),
  NoEmployee: "",
  JenisSimpanan: "",
  Nama: "",
  JumlahSimpanan: 0,
  JumlahBulan: 0,
};

export function InputSimpananTunaiForm({
  initialValues,
  onSubmit,
  onSaveAndNew,
  onCancel,
}: InputSimpananTunaiFormProps) {
  const [form, setForm] = React.useState<InputSimpananTunaiPayload>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof InputSimpananTunaiPayload, string>>
  >({});
  const [savingAndNew, setSavingAndNew] = React.useState(false);

  React.useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
    setErrors({});
  }, [initialValues]);

  const handleChange = <K extends keyof InputSimpananTunaiPayload>(
    field: K,
    value: InputSimpananTunaiPayload[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const result = inputSimpananTunaiSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof InputSimpananTunaiPayload, string>
      > = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof InputSimpananTunaiPayload;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }

      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return result.data;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = validateForm();
    if (values) onSubmit(values);
  };

  const handleSaveAndNew = async () => {
    const values = validateForm();
    if (!values || !onSaveAndNew || savingAndNew) return;

    setSavingAndNew(true);
    try {
      const saved = await onSaveAndNew(values);
      if (saved) {
        setForm({ ...defaultValues, TanggalSetor: getLocalDate() });
        setErrors({});
        await showAlert(
          "success",
          `Simpanan tunai untuk "${values.Nama}" berhasil disimpan.`,
        );
      }
    } finally {
      setSavingAndNew(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-lg">Form input simpanan tunai</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tanggal Setor" error={errors.TanggalSetor}>
              <Input
                type="date"
                value={form.TanggalSetor}
                onChange={(event) =>
                  handleChange("TanggalSetor", event.target.value)
                }
              />
            </Field>

            <Field label="No Employee" error={errors.NoEmployee}>
              <Input
                value={form.NoEmployee}
                onChange={(event) =>
                  handleChange("NoEmployee", event.target.value)
                }
                placeholder="Contoh: EMP-001"
              />
            </Field>

            <Field label="Jenis Simpanan" error={errors.JenisSimpanan}>
              <Input
                value={form.JenisSimpanan}
                onChange={(event) =>
                  handleChange("JenisSimpanan", event.target.value)
                }
                placeholder="Masukkan jenis simpanan"
              />
            </Field>

            <Field label="Nama" error={errors.Nama}>
              <Input
                value={form.Nama}
                onChange={(event) => handleChange("Nama", event.target.value)}
                placeholder="Masukkan nama anggota"
              />
            </Field>

            <Field label="Jumlah Simpanan" error={errors.JumlahSimpanan}>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.JumlahSimpanan}
                onChange={(event) =>
                  handleChange("JumlahSimpanan", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Jumlah Bulan" error={errors.JumlahBulan}>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.JumlahBulan}
                onChange={(event) =>
                  handleChange("JumlahBulan", Number(event.target.value))
                }
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="gap-2"
              >
                <X className="size-4" />
                Batal
              </Button>
            ) : null}

            {onSaveAndNew ? (
              <Button
                type="button"
                onClick={handleSaveAndNew}
                disabled={savingAndNew}
                className="gap-2"
              >
                <Save className="size-4" />
                Save and New
              </Button>
            ) : null}

            <Button type="submit" className="gap-2">
              <Save className="size-4" />
              Save and Close
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
