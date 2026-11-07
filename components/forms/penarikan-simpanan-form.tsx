"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmitTransaksiPenarikanDto } from "@/lib/api";

export type PenarikanSimpananFormValues = {
  IDPengambilan?: string;
  IDTransaksiSimpanan?: string;
  Tanggal: string;
  NoEmployee: string;
  JenisSimpanan: string;
  Jumlah: string;
};

export type EmployeeSavings = {
  Nama: string;
  // saldo ledger untuk jenis simpanan yang dipilih (GET /withdrawals/balance)
  Saldo: number;
};

type PenarikanSimpananFormProps = {
  initialValues: PenarikanSimpananFormValues;
  submitting: boolean;
  onSubmit: (payload: SubmitTransaksiPenarikanDto) => Promise<void>;
  onSaveAndNew?: (
    payload: SubmitTransaksiPenarikanDto,
  ) => Promise<boolean>;
  onFindEmployee?: (
    noEmployee: string,
    jenisSimpanan: string,
  ) => Promise<EmployeeSavings | null>;
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

const formatRupiahInput = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  return numericValue
    ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
        Number(numericValue),
      )
    : "";
};

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
  const lookupId = useRef(0);
  const [employee, setEmployee] = useState<EmployeeSavings | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUpEmployee, setLookingUpEmployee] = useState(false);
  const [savingAndNew, setSavingAndNew] = useState(false);

  const updateValue = (name: keyof PenarikanSimpananFormValues, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  // Membatalkan hasil lookup yang masih berjalan: respons untuk No. Employee /
  // Jenis Simpanan lama tidak boleh menimpa data input yang sudah berubah.
  const invalidateLookup = () => {
    lookupId.current += 1;
    setEmployee(null);
    setLookupError("");
    setLookingUpEmployee(false);
  };

  const lookupEmployee = async () => {
    const noEmployee = values.NoEmployee.trim();
    const jenisSimpanan = values.JenisSimpanan.trim();
    if (!onFindEmployee || !noEmployee || lookingUpEmployee) return;

    if (!jenisSimpanan) {
      setEmployee(null);
      setLookupError("Pilih Jenis Simpanan terlebih dahulu.");
      return;
    }

    const id = ++lookupId.current;
    setLookingUpEmployee(true);
    setLookupError("");
    setEmployee(null);
    try {
      const result = await onFindEmployee(noEmployee, jenisSimpanan);
      if (id !== lookupId.current) return;
      if (!result) {
        setLookupError("Data karyawan tidak ditemukan.");
        return;
      }
      setEmployee(result);
    } catch (error) {
      if (id !== lookupId.current) return;
      setLookupError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data karyawan.",
      );
    } finally {
      if (id === lookupId.current) setLookingUpEmployee(false);
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
      !values.NoEmployee.trim() ||
      !values.JenisSimpanan.trim() ||
      !Number.isFinite(jumlah) ||
      jumlah < 0
    ) {
      return null;
    }
    if (onFindEmployee && !employee) {
      setLookupError(
        "Pilih Jenis Simpanan dan masukkan No. Employee, lalu klik Cek Data atau tekan Enter.",
      );
      return null;
    }
    if (employee && jumlah > employee.Saldo) {
      setLookupError("Jumlah penarikan melebihi saldo simpanan anggota.");
      return null;
    }

    return {
      IDPengambilan: Number(values.IDPengambilan || 0),
      IDTransaksiSimpanan: Number(values.IDTransaksiSimpanan || 0),
      Tanggal: values.Tanggal, // plain yyyy-mm-dd: a Date shifts a day across timezones
      NoEmployee: values.NoEmployee.trim(),
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
          NoEmployee: "",
          JenisSimpanan: "",
          Jumlah: "",
        });
        invalidateLookup();
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
          <input
            type="hidden"
            name="IDPengambilan"
            value={values.IDPengambilan || "0"}
          />
          <input
            type="hidden"
            name="IDTransaksiSimpanan"
            value={values.IDTransaksiSimpanan || "0"}
          />
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
                    <FormField label="Jenis Simpanan">
             <select
             required
                  value={values.JenisSimpanan}
                  onChange={(event) => {
                    updateValue("JenisSimpanan", event.target.value);
                    // saldo bergantung pada jenis simpanan, jadi hasil lama tidak berlaku
                    invalidateLookup();
                  }}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="" disabled>
                   Jenis Simpanan
                </option>
                  <option value="SIMPANAN WAJIB">SIMPANAN WAJIB</option>
                  <option value="SIMPANAN SUKARELA">SIMPANAN SUKARELA</option>
                </select>
          </FormField>
          <div className="grid gap-1.5 text-sm font-medium">
            <label htmlFor="no-employee">No. Employee</label>
            <div className="flex gap-2">
              <input
                id="no-employee"
                required
                type="text"
                value={values.NoEmployee}
                onChange={(event) => {
                  updateValue("NoEmployee", event.target.value);
                  invalidateLookup();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && onFindEmployee) {
                    event.preventDefault();
                    void lookupEmployee();
                  }
                }}
                className={`${inputClassName} min-w-0 flex-1`}
              />
              {onFindEmployee ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void lookupEmployee()}
                  disabled={
                    !values.NoEmployee.trim() ||
                    !values.JenisSimpanan.trim() ||
                    lookingUpEmployee
                  }
                >
                  {lookingUpEmployee ? "Memuat..." : "Cek Data"}
                </Button>
              ) : null}
            </div>
          </div>
          <FormField label="Nama">
            <input
              type="text"
              value={employee?.Nama ?? ""}
              readOnly
              className={`${inputClassName} bg-muted`}
            />
          </FormField>
          <FormField
            label={
              values.JenisSimpanan
                ? `Saldo ${values.JenisSimpanan}`
                : "Saldo Simpanan"
            }
          >
            <input
              type="text"
              value={employee ? formatRupiah(employee.Saldo) : ""}
              readOnly
              className={`${inputClassName} bg-muted`}
            />
          </FormField>

          <FormField label="Jumlah Penarikan">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Rp
              </span>
              <input
                required
                type="text"
                inputMode="numeric"
                value={formatRupiahInput(values.Jumlah)}
                onChange={(event) => {
                  updateValue("Jumlah", event.target.value.replace(/\D/g, ""));
                  setLookupError("");
                }}
                className={`${inputClassName} pl-10`}
              />
            </div>
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
                    : "Pilih Jenis Simpanan, isi No. Employee, lalu klik Cek Data atau tekan Enter.")}
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
