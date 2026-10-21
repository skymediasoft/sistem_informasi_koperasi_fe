"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmitTransaksiPenarikanDto } from "@/lib/api";

export type PenarikanSimpananFormValues = {
  IDPengambilan?: string;
  IDTransaksiSimpanan?: string;
  Tanggal: string;
  NoAnggota: string;
  JenisSimpanan: string;
  Jumlah: string;
};

export type EmployeeSavings = {
  Nama: string;
  Total: number;
};

type PenarikanSimpananFormProps = {
  initialValues: PenarikanSimpananFormValues;
  submitting: boolean;
  onSubmit: (payload: SubmitTransaksiPenarikanDto) => Promise<void>;
  onSaveAndNew?: (
    payload: SubmitTransaksiPenarikanDto,
  ) => Promise<boolean>;
  onFindEmployee?: (noEmployee: string) => Promise<EmployeeSavings | null>;
  onCancel: () => void;
};

const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export function PenarikanSimpananForm({
  initialValues,
  submitting,
  onSubmit,
  onSaveAndNew,
  onFindEmployee,
  onCancel,
}: PenarikanSimpananFormProps) {
  const [values, setValues] = useState(initialValues);
  const formRef = useRef<HTMLFormElement>(null);
  const [employee, setEmployee] = useState<EmployeeSavings | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUpEmployee, setLookingUpEmployee] = useState(false);
  const [savingAndNew, setSavingAndNew] = useState(false);

  const updateValue = (name: keyof PenarikanSimpananFormValues, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const lookupEmployee = async () => {
    const noEmployee = values.NoAnggota.trim();
    if (!onFindEmployee || !noEmployee || lookingUpEmployee) return;

    setLookingUpEmployee(true);
    setLookupError("");
    setEmployee(null);
    try {
      const result = await onFindEmployee(noEmployee);
      if (!result) {
        setLookupError("Data karyawan tidak ditemukan.");
        return;
      }
      setEmployee(result);
    } catch (error) {
      setLookupError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data karyawan.",
      );
    } finally {
      setLookingUpEmployee(false);
    }
  };

  const getPayload = () => {
    const tanggal = new Date(`${values.Tanggal}T00:00:00`);
    const jumlah = Number(values.Jumlah);
    const today = getLocalDate();

    if (
      !values.Tanggal ||
      !Number.isFinite(tanggal.getTime()) ||
      values.Tanggal > today ||
      !values.NoAnggota.trim() ||
      !values.JenisSimpanan.trim() ||
      !Number.isFinite(jumlah) ||
      jumlah < 0
    ) {
      return null;
    }
    if (onFindEmployee && !employee) {
      setLookupError("Masukkan No. Employee lalu tekan Enter untuk memuat data.");
      return null;
    }
    if (employee && jumlah > employee.Total) {
      setLookupError("Jumlah penarikan melebihi total simpanan anggota.");
      return null;
    }

    return {
      Tanggal: tanggal,
      NoAnggota: values.NoAnggota.trim(),
      JenisSimpanan: values.JenisSimpanan.trim(),
      Jumlah: jumlah,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = getPayload();
    if (payload) await onSubmit(payload);
  };

  const handleSaveAndNew = async () => {
    if (!formRef.current?.reportValidity()) return;
    const payload = getPayload();
    if (!payload || !onSaveAndNew || savingAndNew) return;

    setSavingAndNew(true);
    try {
      const saved = await onSaveAndNew(payload);
      if (saved) {
        setValues({
          Tanggal: getLocalDate(),
          NoAnggota: "",
          JenisSimpanan: "",
          Jumlah: "",
        });
        setEmployee(null);
        setLookupError("");
      }
    } finally {
      setSavingAndNew(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base ml-4 py-4">Data Penarikan Simpanan</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <FormField label="Tanggal Penarikan">
            <input
              required
              type="date"
              max={getLocalDate()}
              value={values.Tanggal}
              onChange={(event) => updateValue("Tanggal", event.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="No. Employee">
            <input
              required
              type="text"
              value={values.NoAnggota}
              onChange={(event) => {
                updateValue("NoAnggota", event.target.value);
                setEmployee(null);
                setLookupError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && onFindEmployee) {
                  event.preventDefault();
                  void lookupEmployee();
                }
              }}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Nama">
            <input
              type="text"
              value={employee?.Nama ?? ""}
              readOnly
              className={`${inputClassName} bg-muted`}
            />
          </FormField>
          <FormField label="Total Simpanan">
            <input
              type="text"
              value={employee ? formatRupiah(employee.Total) : ""}
              readOnly
              className={`${inputClassName} bg-muted`}
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
          <FormField label="Jumlah Penarikan">
            <input
              required
              type="number"
              min="0"
              step="any"
              value={values.Jumlah}
              onChange={(event) => {
                updateValue("Jumlah", event.target.value);
                setLookupError("");
              }}
              className={inputClassName}
            />
          </FormField>
          {onFindEmployee ? (
            <div
              aria-live="polite"
              className={`text-sm md:col-span-2 ${
                lookupError ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {lookupError ||
                (lookingUpEmployee
                  ? "Memuat data karyawan..."
                  : employee
                    ? "Data karyawan berhasil dimuat."
                    : "Tekan Enter pada No. Employee untuk memuat data.")}
            </div>
          ) : null}
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting || savingAndNew}
            >
              Batal
            </Button>
            {onSaveAndNew ? (
              <Button
                type="button"
                onClick={handleSaveAndNew}
                disabled={submitting || savingAndNew}
              >
                {savingAndNew ? "Menyimpan..." : "Save & New"}
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting || savingAndNew}>
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
