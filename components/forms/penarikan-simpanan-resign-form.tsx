"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubmitTransaksiPenarikanResignDto } from "@/lib/api";

export type PenarikanSimpananResignFormValues = {
  IDPengambilan: string;
  Tanggal: string;
  NoAnggota: string;
  SimpananPokok: string;
  SimpananWajib: string;
  SimpananSukarela: string;
};

type PenarikanSimpananResignFormProps = {
  initialValues: PenarikanSimpananResignFormValues;
  submitting: boolean;
  onSubmit: (payload: SubmitTransaksiPenarikanResignDto) => Promise<void>;
  onCancel: () => void;
};

export function PenarikanSimpananResignForm({
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: PenarikanSimpananResignFormProps) {
  const [values, setValues] = useState(initialValues);

  const updateValue = (
    name: keyof PenarikanSimpananResignFormValues,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const idPengambilan = Number(values.IDPengambilan);

    const tanggal = new Date(`${values.Tanggal}T00:00:00`);
    const simpanan = [
      values.SimpananPokok,
      values.SimpananWajib,
      values.SimpananSukarela,
    ].map(Number);

    if (
      !Number.isSafeInteger(idPengambilan) ||
      idPengambilan < 0 ||
      !values.Tanggal ||
      !Number.isFinite(tanggal.getTime()) ||
      !values.NoAnggota.trim()
    ) {
      return;
    }

    if (
      simpanan.some(
        (value) =>
          !Number.isSafeInteger(value) ||
          value < 0,
      )
    ) {
      return;
    }

    await onSubmit({
      IDPengambilan: idPengambilan,
      Tanggal: tanggal,
      NoAnggota: values.NoAnggota.trim(),
      SimpananPokok: simpanan[0],
      SimpananWajib: simpanan[1],
      SimpananSukarela: simpanan[2],
    });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base">
          Penarikan Simpanan Anggota Resign
        </CardTitle>
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
              min="0"
              step="1"
              value={values.IDPengambilan}
              onChange={(event) =>
                updateValue("IDPengambilan", event.target.value)
              }
              className={inputClassName}
            />
            <span className="text-xs font-normal text-muted-foreground">
              Isi 0 untuk pengajuan baru.
            </span>
          </FormField>

          <FormField label="Tanggal">
            <input
              required
              type="date"
              value={values.Tanggal}
              onChange={(event) =>
                updateValue("Tanggal", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField label="No. Anggota">
            <input
              required
              type="text"
              maxLength={10}
              value={values.NoAnggota}
              onChange={(event) =>
                updateValue("NoAnggota", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField label="Simpanan Pokok">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananPokok}
              onChange={(event) =>
                updateValue("SimpananPokok", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField label="Simpanan Wajib">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananWajib}
              onChange={(event) =>
                updateValue("SimpananWajib", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField label="Simpanan Sukarela">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananSukarela}
              onChange={(event) =>
                updateValue("SimpananSukarela", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
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
