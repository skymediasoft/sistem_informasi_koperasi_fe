"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubmitTransaksiPenarikanResignDto } from "@/lib/api";

export type PenarikanSimpananResignFormValues = {
  Tanggal: string;
  NoAnggota: string;
  SimpananPokok: string;
  SimpananWajib: string;
  SimpananSukarela: string;
};

export type EmployeeSavings = {
  Nama: string;
  SimpananPokok: number;
  SimpananWajib: number;
  SimpananSukarela: number;
};

type PenarikanSimpananResignFormProps = {
  initialValues: PenarikanSimpananResignFormValues;
  submitting: boolean;
  onSubmit: (payload: SubmitTransaksiPenarikanResignDto) => Promise<void>;
  onSaveAndNew?: (
    payload: SubmitTransaksiPenarikanResignDto,
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

export function PenarikanSimpananResignForm({
  initialValues,
  submitting,
  onSubmit,
  onSaveAndNew,
  onFindEmployee,
  onCancel,
}: PenarikanSimpananResignFormProps) {
  const [values, setValues] = useState(initialValues);
  const [employeeName, setEmployeeName] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookingUpEmployee, setLookingUpEmployee] = useState(false);
  const [savingAndNew, setSavingAndNew] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const updateValue = (
    name: keyof PenarikanSimpananResignFormValues,
    value: string,
  ) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const lookupEmployee = async () => {
    const noEmployee = values.NoAnggota.trim();
    if (!onFindEmployee || !noEmployee || lookingUpEmployee) return;

    setLookingUpEmployee(true);
    setLookupError("");
    setEmployeeName("");
    try {
      const employee = await onFindEmployee(noEmployee);
      if (!employee) {
        setValues((current) => ({
          ...current,
          SimpananPokok: "",
          SimpananWajib: "",
          SimpananSukarela: "",
        }));
        setLookupError("Data karyawan tidak ditemukan.");
        return;
      }

      setEmployeeName(employee.Nama);
      setValues((current) => ({
        ...current,
        SimpananPokok: String(employee.SimpananPokok),
        SimpananWajib: String(employee.SimpananWajib),
        SimpananSukarela: String(employee.SimpananSukarela),
      }));
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
    const simpanan = [
      values.SimpananPokok,
      values.SimpananWajib,
      values.SimpananSukarela,
    ].map(Number);

    if (
      !values.Tanggal ||
      !Number.isFinite(tanggal.getTime()) ||
      values.Tanggal > getLocalDate() ||
      !values.NoAnggota.trim() ||
      (onFindEmployee && !employeeName)
    ) {
      if (onFindEmployee && !employeeName) {
        setLookupError("Masukkan No. Employee lalu tekan Enter untuk memuat data.");
      }
      return null;
    }

    if (
      simpanan.some(
        (amount) => !Number.isSafeInteger(amount) || amount < 0,
      )
    ) {
      return null;
    }

    return {
      Tanggal: tanggal,
      NoAnggota: values.NoAnggota.trim(),
      SimpananPokok: simpanan[0],
      SimpananWajib: simpanan[1],
      SimpananSukarela: simpanan[2],
    };
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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
          SimpananPokok: "",
          SimpananWajib: "",
          SimpananSukarela: "",
        });
        setEmployeeName("");
        setLookupError("");
      }
    } finally {
      setSavingAndNew(false);
    }
  };

  const totalSimpanan =
    Number(values.SimpananPokok || 0) +
    Number(values.SimpananWajib || 0) +
    Number(values.SimpananSukarela || 0);

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base ml-4 py-4">
          Penarikan Simpanan Anggota Resign
        </CardTitle>
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
              onChange={(event) =>
                updateValue("Tanggal", event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField label="No. Employee">
            <input
              required
              type="text"
              maxLength={10}
              value={values.NoAnggota}
              onChange={(event) => {
                updateValue("NoAnggota", event.target.value);
                setEmployeeName("");
                setLookupError("");
                if (onFindEmployee) {
                  setValues((current) => ({
                    ...current,
                    SimpananPokok: "",
                    SimpananWajib: "",
                    SimpananSukarela: "",
                  }));
                }
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

          {onFindEmployee ? (
            <FormField label="Nama">
              <input
                type="text"
                value={employeeName}
                readOnly
                className={`${inputClassName} bg-muted`}
              />
            </FormField>
          ) : null}

          <FormField label="Simpanan Pokok">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananPokok}
              readOnly={Boolean(onFindEmployee)}
              onChange={(event) =>
                updateValue("SimpananPokok", event.target.value)
              }
              className={`${inputClassName} ${
                onFindEmployee ? "bg-muted" : ""
              }`}
            />
          </FormField>

          <FormField label="Simpanan Wajib">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananWajib}
              readOnly={Boolean(onFindEmployee)}
              onChange={(event) =>
                updateValue("SimpananWajib", event.target.value)
              }
              className={`${inputClassName} ${
                onFindEmployee ? "bg-muted" : ""
              }`}
            />
          </FormField>

          <FormField label="Simpanan Sukarela">
            <input
              required
              type="number"
              min="0"
              step="1"
              value={values.SimpananSukarela}
              readOnly={Boolean(onFindEmployee)}
              onChange={(event) =>
                updateValue("SimpananSukarela", event.target.value)
              }
              className={`${inputClassName} ${
                onFindEmployee ? "bg-muted" : ""
              }`}
            />
          </FormField>

          {onFindEmployee ? (
            <>
              <FormField label="Total Saldo">
                <input
                  type="text"
                  value={formatRupiah(totalSimpanan)}
                  readOnly
                  className={`${inputClassName} bg-muted`}
                />
              </FormField>
              <div
                aria-live="polite"
                className={`text-sm md:col-span-2 ${
                  lookupError ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {lookupError ||
                  (lookingUpEmployee
                    ? "Memuat data karyawan..."
                    : employeeName
                      ? "Data karyawan berhasil dimuat."
                      : "Tekan Enter pada No. Employee untuk memuat data.")}
              </div>
            </>
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
