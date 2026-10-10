"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/app-shell";
import {
  PenarikanSimpananForm,
  type PenarikanSimpananFormValues,
} from "@/components/forms/penarikan-simpanan-form";
import { showAlert } from "@/lib/alert";
import { penarikanSimpananApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const today = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const initialValues: PenarikanSimpananFormValues = {
  IDPengambilan: "",
  IDTransaksiSimpanan: "",
  Tanggal: today(),
  NoAnggota: "",
  JenisSimpanan: "",
  Jumlah: "",
};

export default function CreatePenarikanSimpananPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  const handleSubmit = async (
    payload: Parameters<typeof penarikanSimpananApi.submit>[0],
  ) => {
    setSubmitting(true);
    try {
      await penarikanSimpananApi.submit(payload);
      await showAlert("success", "Transaksi penarikan berhasil disimpan.");
      router.push("/transaksi-simpanan/penarikan-simpanan");
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi penarikan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Buat Penarikan Simpanan"
      subtitle="Masukkan data transaksi penarikan"
      displayName={user.name || "Administrator Koperasi"}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/transaksi-simpanan/penarikan-simpanan")}
    >
      <div className="mx-auto mt-6 max-w-4xl">
        <PenarikanSimpananForm
          initialValues={initialValues}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/transaksi-simpanan/penarikan-simpanan")}
        />
      </div>
    </DashboardShell>
  );
}
