"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { InputSimpananTunaiForm } from "@/components/forms/input-simpanan-tunai-form";
import { showAlert } from "@/lib/alert";
import {
  InputSimpananTunaiAPI,
  type InputSimpananTunaiPayload,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asInputDate = (value: unknown): Date | undefined => {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    !(value instanceof Date)
  ) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
};

const toFormValues = (
  record: Record<string, unknown>,
  routeId: string,
): Partial<InputSimpananTunaiPayload> => ({
  IDTransaksi: String(record.IDTransaksi ?? routeId),
  Tanggal: asInputDate(record.Tanggal),
  NoAnggota: String(record.NoAnggota ?? ""),
  JenisSimpanan: String(record.JenisSimpanan ?? ""),
  Jumlah: Number(record.Jumlah ?? 0),
  JumlahBulan: Number(record.JumlahBulan ?? 0),
});

export default function EditInputSimpananTunaiPage() {
  const router = useRouter();
  const params = useParams<{ idTransaksi: string }>();
  const idTransaksi = params.idTransaksi;
  const { logout, user } = useAuth();
  const [initialValues, setInitialValues] =
    useState<Partial<InputSimpananTunaiPayload> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listPath = "/transaksi-simpanan/input-simpanan-tunai";
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  const loadTransaction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await InputSimpananTunaiAPI.getById(idTransaksi);
      if (!isRecord(response)) {
        throw new Error("Detail simpanan tunai tidak ditemukan atau tidak valid.");
      }
      setInitialValues(toFormValues(response, idTransaksi));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat detail simpanan tunai.",
      );
    } finally {
      setLoading(false);
    }
  }, [idTransaksi]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const handleSubmit = async (payload: InputSimpananTunaiPayload) => {
    setSubmitting(true);
    try {
      await InputSimpananTunaiAPI.submit(payload);
      await showAlert("success", "Simpanan tunai berhasil diperbarui.");
      router.push(listPath);
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui simpanan tunai.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Edit Simpanan Tunai"
      subtitle={`Ubah transaksi ${idTransaksi}`}
      displayName={user.name || "Administrator Koperasi"}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      secondaryMenu={secondaryMenu}
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
            <button
              type="button"
              onClick={() => void loadTransaction()}
              className="ml-3 font-medium underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        ) : null}
        {loading ? (
          <p className="rounded-xl border p-4 text-sm text-muted-foreground">
            Memuat detail simpanan tunai...
          </p>
        ) : initialValues ? (
          <InputSimpananTunaiForm
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
