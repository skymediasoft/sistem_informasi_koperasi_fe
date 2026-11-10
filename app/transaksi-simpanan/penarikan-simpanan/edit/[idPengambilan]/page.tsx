"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/app-shell";
import {
  PenarikanSimpananForm,
  type PenarikanSimpananFormValues,
  type EmployeeSavings,
} from "@/components/forms/penarikan-simpanan-form";
import { showAlert } from "@/lib/alert";
import { anggotaApi, penarikanSimpananApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asInputDate = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    return "";
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const toFormValues = (
  record: Record<string, unknown>,
  routeId: string,
): PenarikanSimpananFormValues => ({
  IDPengambilan: String(record.IDPengambilan ?? routeId),
  IDTransaksiSimpanan: String(record.IDTransaksiSimpanan ?? ""),
  Tanggal: asInputDate(record.Tanggal),
  NoEmployee: String(record.NoEmployee ?? ""),
  JenisSimpanan: String(record.JenisSimpanan ?? ""),
  Jumlah: String(record.Jumlah ?? ""),
});

export default function EditPenarikanSimpananPage() {
  const router = useRouter();
  const params = useParams<{ idPengambilan: string }>();
  const idPengambilan = params.idPengambilan;
  const { logout, user } = useAuth();
  const [initialValues, setInitialValues] =
    useState<PenarikanSimpananFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const listPath = "/transaksi-simpanan/penarikan-simpanan";

  const loadTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await penarikanSimpananApi.getById(idPengambilan);
      const record = Array.isArray(response) ? response[0] : response;
      if (!isRecord(record)) {
        throw new Error("Detail transaksi penarikan tidak ditemukan atau tidak valid.");
      }
      setInitialValues(toFormValues(record, idPengambilan));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat detail transaksi penarikan.",
      );
    } finally {
      setLoading(false);
    }
  }, [idPengambilan]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const handleSubmit = async (
    payload: Parameters<typeof penarikanSimpananApi.submit>[0],
  ) => {
    setSubmitting(true);
    try {
      await penarikanSimpananApi.submit(payload);
      await showAlert("success", "Transaksi penarikan berhasil diperbarui.");
      router.push(listPath);
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui transaksi penarikan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFindEmployee = async (
    noEmployee: string,
    jenisSimpanan: string,
  ): Promise<EmployeeSavings | null> => {
    const saldo = await penarikanSimpananApi.getSaldo({
      NoEmployee: noEmployee,
      JenisSimpanan: jenisSimpanan,
    });

    if (saldo.NoAnggota) {
      return { Nama: saldo.Nama ?? "", Saldo: Number(saldo.Saldo ?? 0) };
    }

    const anggota = await anggotaApi.findAll();
    const employee = anggota.find(
      (member) =>
        member.NoEmployee.trim().toLowerCase() === noEmployee.toLowerCase(),
    );
    if (!employee) return null;
    if (employee.StatusAnggota !== "AKTIF") {
      throw new Error("Anggota tidak aktif.");
    }

    return { Nama: employee.Nama, Saldo: 0 };
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Edit Penarikan Simpanan"
      subtitle={`Ubah transaksi pengambilan ${idPengambilan}`}
      displayName={user.name || "Administrator Koperasi"}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push(listPath)}
    >
      <div className="mx-auto mt-6 max-w-4xl space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
            <ButtonRetry onClick={() => void loadTransaction()} />
          </div>
        ) : null}
        {loading ? (
          <p className="rounded-xl border p-4 text-sm text-muted-foreground">
            Memuat detail transaksi...
          </p>
        ) : initialValues ? (
          <PenarikanSimpananForm
            initialValues={initialValues}
            submitting={submitting}
            onSubmit={handleSubmit}
            onFindEmployee={handleFindEmployee}
            onCancel={() => router.push(listPath)}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}

function ButtonRetry({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-3 font-medium underline underline-offset-2"
    >
      Coba lagi
    </button>
  );
}
