"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/app-shell";
import {
  PenarikanSimpananResignForm,
  type PenarikanSimpananResignFormValues,
  type EmployeeSavings,
} from "@/components/forms/penarikan-simpanan-resign-form";
import { showAlert } from "@/lib/alert";
import { anggotaApi, penarikanSimpananResignApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const today = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const initialValues: PenarikanSimpananResignFormValues = {
  Tanggal: today(),
  NoAnggota: "",
  SimpananPokok: "",
  SimpananWajib: "",
  SimpananSukarela: "",
};

export default function CreatePenarikanSimpananPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  const handleSubmit = async (
    payload: Parameters<typeof penarikanSimpananResignApi.submit>[0],
  ) => {
    setSubmitting(true);
    try {
      await penarikanSimpananResignApi.submit(payload);
      await showAlert("success", "Transaksi penarikan simpanan resign berhasil disimpan.");
      router.push("/transaksi-simpanan/penarikan-simpanan-resign");
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi penarikan simpanan resign.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFindEmployee = async (
    noEmployee: string,
  ): Promise<EmployeeSavings | null> => {
    const members = await anggotaApi.findAll();
    const employee = members.find(
      (member) =>
        member.NoEmployee.trim().toLowerCase() === noEmployee.toLowerCase(),
    );
    if (!employee) return null;

    return {
      Nama: employee.Nama,
      SimpananPokok: Number(employee.SimpananPokok || 0),
      SimpananWajib: Number(employee.SimpananWajib || 0),
      SimpananSukarela: Number(employee.SimpananSukarela || 0),
    };
  };

  const handleSaveAndNew = async (
    payload: Parameters<typeof penarikanSimpananResignApi.submit>[0],
  ): Promise<boolean> => {
    setSubmitting(true);
    try {
      await penarikanSimpananResignApi.submit(payload);
      await showAlert(
        "success",
        "Transaksi penarikan simpanan resign berhasil disimpan.",
      );
      return true;
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi penarikan simpanan resign.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Buat Penarikan Simpanan Resign"
      subtitle="Masukkan data penarikan simpanan anggota resign"
      displayName={user.name || "Administrator Koperasi"}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/transaksi-simpanan/penarikan-simpanan-resign")}
    >
      <div className="mx-auto mt-6 max-w-4xl">
        <PenarikanSimpananResignForm
          initialValues={initialValues}
          submitting={submitting}
          onSubmit={handleSubmit}
          onSaveAndNew={handleSaveAndNew}
          onFindEmployee={handleFindEmployee}
          onCancel={() => router.push("/transaksi-simpanan/penarikan-simpanan-resign")}
        />
      </div>
    </DashboardShell>
  );
}
