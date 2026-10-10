"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/app-shell";
import {
  PenarikanSimpananResignForm,
  type PenarikanSimpananResignFormValues,
} from "@/components/forms/penarikan-simpanan-resign-form";
import { showAlert } from "@/lib/alert";
import { penarikanSimpananResignApi } from "@/lib/api";
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
): PenarikanSimpananResignFormValues => ({
  IDPengambilan: String(record.IDPengambilan ?? routeId),
  Tanggal: asInputDate(record.Tanggal),
  NoAnggota: String(record.NoAnggota ?? ""),
  SimpananPokok: String(record.SimpananPokok ?? ""),
  SimpananWajib: String(record.SimpananWajib ?? ""),
  SimpananSukarela: String(record.SimpananSukarela ?? ""),
});

export default function EditPenarikanSimpananPage() {
  const router = useRouter();
  const params = useParams<{ idPengambilan: string }>();
  const idPengambilan = params.idPengambilan;
  const { logout, user } = useAuth();
  const [initialValues, setInitialValues] =
    useState<PenarikanSimpananResignFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const listPath = "/transaksi-simpanan/penarikan-simpanan-resign";

  const loadTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await penarikanSimpananResignApi.getById(idPengambilan);
      if (!isRecord(response)) {
        throw new Error("Detail transaksi penarikan simpanan resign tidak ditemukan atau tidak valid.");
      }
      setInitialValues(toFormValues(response, idPengambilan));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat detail transaksi penarikan simpanan resign.",
      );
    } finally {
      setLoading(false);
    }
  }, [idPengambilan]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const handleSubmit = async (
    payload: Parameters<typeof penarikanSimpananResignApi.submit>[0],
  ) => {
    setSubmitting(true);
    try {
      await penarikanSimpananResignApi.submit({
        ...payload,
        IDPengambilan: Number(idPengambilan),
      });
      await showAlert("success", "Transaksi penarikan simpanan resign berhasil diperbarui.");
      router.push(listPath);
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui transaksi penarikan simpanan resign.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Edit Penarikan Simpanan Resign"
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
          <PenarikanSimpananResignForm
            initialValues={initialValues}
            submitting={submitting}
            onSubmit={handleSubmit}
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
