"use client";

import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InputSimpananTunaiPayload } from "@/lib/api";
import { showAlert } from "@/lib/alert";

type FormValues = {
  IDTransaksi: string;
  Tanggal: string;
  NoAnggota: string;
  JenisSimpanan: string;
  Jumlah: string;
  JumlahBulan: string;
};

interface InputSimpananTunaiFormProps {
  initialValues?: Partial<InputSimpananTunaiPayload>;
  submitting?: boolean;
  onSubmit: (values: InputSimpananTunaiPayload) => void | Promise<void>;
  onSaveAndNew?: (
    values: InputSimpananTunaiPayload,
  ) => boolean | Promise<boolean>;
  onCancel?: () => void;
}

const schema = z.object({
  IDTransaksi: z.string().trim().min(1, "ID transaksi wajib diisi"),
  Tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "Tanggal tidak valid"),
  NoAnggota: z.string().trim().min(1, "No. anggota wajib diisi"),
  JenisSimpanan: z.string().trim().min(1, "Jenis simpanan wajib diisi"),
  Jumlah: z.string().min(1, "Jumlah wajib diisi").regex(/^\d+$/, "Jumlah wajib berupa angka"),
  JumlahBulan: z
    .string()
    .min(1, "Jumlah bulan wajib diisi")
    .regex(/^\d+$/, "Jumlah bulan wajib berupa angka"),
});

const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

const getDateInputValue = (value: Date | string | undefined) => {
  if (!value) return getLocalDate();
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const defaultValues = (): FormValues => ({
  IDTransaksi: "0",
  Tanggal: getLocalDate(),
  NoAnggota: "",
  JenisSimpanan: "",
  Jumlah: "",
  JumlahBulan: "",
});

const fromInitialValues = (
  initialValues?: Partial<InputSimpananTunaiPayload>,
): FormValues => ({
  IDTransaksi: initialValues?.IDTransaksi ?? "0",
  Tanggal: getDateInputValue(initialValues?.Tanggal),
  NoAnggota: initialValues?.NoAnggota ?? "",
  JenisSimpanan: initialValues?.JenisSimpanan ?? "",
  Jumlah:
    initialValues?.Jumlah === undefined ? "" : String(initialValues.Jumlah),
  JumlahBulan:
    initialValues?.JumlahBulan === undefined
      ? ""
      : String(initialValues.JumlahBulan),
});

const formatRupiahInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits
    ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
        Number(digits),
      )
    : "";
};

export function InputSimpananTunaiForm({
  initialValues,
  submitting = false,
  onSubmit,
  onSaveAndNew,
  onCancel,
}: InputSimpananTunaiFormProps) {
  const [form, setForm] = React.useState<FormValues>(() =>
    initialValues ? fromInitialValues(initialValues) : defaultValues(),
  );
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [savingAndNew, setSavingAndNew] = React.useState(false);

  React.useEffect(() => {
    setForm(initialValues ? fromInitialValues(initialValues) : defaultValues());
    setErrors({});
  }, [initialValues]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormValues;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }

    const jumlah = Number(result.data.Jumlah);
    const jumlahBulan = Number(result.data.JumlahBulan);
    if (
      !Number.isSafeInteger(jumlah) ||
      !Number.isSafeInteger(jumlahBulan) ||
      jumlah < 0 ||
      jumlahBulan < 0
    ) {
      setErrors({
        Jumlah: "Jumlah harus berupa angka bulat non-negatif.",
        JumlahBulan: "Jumlah bulan harus berupa angka bulat non-negatif.",
      });
      return null;
    }

    setErrors({});
    return {
      IDTransaksi: result.data.IDTransaksi,
      Tanggal: new Date(`${result.data.Tanggal}T00:00:00`),
      NoAnggota: result.data.NoAnggota,
      JenisSimpanan: result.data.JenisSimpanan,
      Jumlah: jumlah,
      JumlahBulan: jumlahBulan,
    } satisfies InputSimpananTunaiPayload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = validateForm();
    if (payload) await onSubmit(payload);
  };

  const handleSaveAndNew = async () => {
    const payload = validateForm();
    if (!payload || !onSaveAndNew || savingAndNew) return;

    setSavingAndNew(true);
    try {
      const saved = await onSaveAndNew(payload);
      if (saved) {
        setForm(defaultValues());
        setErrors({});
        await showAlert("success", "Simpanan tunai berhasil disimpan.");
      }
    } finally {
      setSavingAndNew(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="ml-4 py-4 text-base">
          Data Simpanan Tunai
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <input
            type="hidden"
            name="IDTransaksi"
            value={form.IDTransaksi || "0"}
          />
          <FormField label="Tanggal" error={errors.Tanggal}>
            <input
              required
              type="date"
              max={getLocalDate()}
              value={form.Tanggal}
              onChange={(event) => handleChange("Tanggal", event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Jenis Simpanan" error={errors.JenisSimpanan}>
            <select
              required
              value={form.JenisSimpanan}
              onChange={(event) =>
                handleChange("JenisSimpanan", event.target.value)
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="" disabled>
                Pilih jenis simpanan
              </option>
              <option value="SIMPANAN WAJIB">SIMPANAN WAJIB</option>
              <option value="SIMPANAN SUKARELA">SIMPANAN SUKARELA</option>
            </select>
          </FormField>

          <FormField label="No. Anggota" error={errors.NoAnggota}>
            <input
              required
              type="text"
              value={form.NoAnggota}
              onChange={(event) => handleChange("NoAnggota", event.target.value)}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Jumlah" error={errors.Jumlah}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <input
                required
                type="text"
                inputMode="numeric"
                value={formatRupiahInput(form.Jumlah)}
                onChange={(event) =>
                  handleChange("Jumlah", event.target.value.replace(/\D/g, ""))
                }
                className={`${inputClassName} pl-10`}
              />
            </div>
          </FormField>

          <FormField label="Jumlah Bulan" error={errors.JumlahBulan}>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.JumlahBulan}
              onChange={(event) =>
                handleChange("JumlahBulan", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <div className="flex justify-end gap-3 md:col-span-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting || savingAndNew}
              >
                Batal
              </Button>
            ) : null}
            {onSaveAndNew ? (
              <Button
                type="button"
                onClick={handleSaveAndNew}
                disabled={savingAndNew || submitting}
              >
                {savingAndNew || submitting ? "Menyimpan..." : "Save & New"}
              </Button>
            ) : null}
            <Button type="submit" disabled={savingAndNew || submitting}>
              {submitting ? "Menyimpan..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
