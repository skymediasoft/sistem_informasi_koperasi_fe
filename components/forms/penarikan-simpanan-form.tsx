"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmitTransaksiPenarikanDto } from "@/lib/api";

export type PenarikanSimpananFormValues = {
  IDPengambilan: string;
  IDTransaksiSimpanan: string;
  Tanggal: string;
  NoAnggota: string;
  JenisSimpanan: string;
  Jumlah: string;
};

type PenarikanSimpananFormProps = {
  initialValues: PenarikanSimpananFormValues;
  submitting: boolean;
  onSubmit: (payload: SubmitTransaksiPenarikanDto) => Promise<void>;
  onCancel: () => void;
};

export function PenarikanSimpananForm({
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: PenarikanSimpananFormProps) {
  const [values, setValues] = useState(initialValues);

  const updateValue = (name: keyof PenarikanSimpananFormValues, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericValues = [
      values.IDPengambilan,
      values.IDTransaksiSimpanan,
      values.Jumlah,
    ].map(Number);

    if (numericValues.some((value) => !Number.isFinite(value))) return;

    await onSubmit({
      IDPengambilan: numericValues[0],
      IDTransaksiSimpanan: numericValues[1],
      Tanggal: new Date(`${values.Tanggal}T00:00:00`),
      NoAnggota: values.NoAnggota.trim(),
      JenisSimpanan: values.JenisSimpanan.trim(),
      Jumlah: numericValues[2],
    });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base">Data Penarikan Simpanan</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField label="ID Pengambilan">
            <input
              required
              type="number"
              step="1"
              value={values.IDPengambilan}
              onChange={(event) => updateValue("IDPengambilan", event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="ID Transaksi Simpanan">
            <input
              required
              type="number"
              step="1"
              value={values.IDTransaksiSimpanan}
              onChange={(event) =>
                updateValue("IDTransaksiSimpanan", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>
          <FormField label="Tanggal">
            <input
              required
              type="date"
              value={values.Tanggal}
              onChange={(event) => updateValue("Tanggal", event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="No. Anggota">
            <input
              required
              type="text"
              value={values.NoAnggota}
              onChange={(event) => updateValue("NoAnggota", event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Jenis Simpanan">
            <input
              required
              type="text"
              value={values.JenisSimpanan}
              onChange={(event) =>
                updateValue("JenisSimpanan", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>
          <FormField label="Jumlah">
            <input
              required
              type="number"
              min="0"
              step="any"
              value={values.Jumlah}
              onChange={(event) => updateValue("Jumlah", event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Submit Penarikan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
