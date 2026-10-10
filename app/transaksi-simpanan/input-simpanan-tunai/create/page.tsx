"use client";

import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { InputSimpananTunaiForm } from "@/components/forms/input-simpanan-tunai-form";
import { showAlert } from "@/lib/alert";
import {
  InputSimpananTunaiAPI,
  type InputSimpananTunaiPayload,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";

export default function CreateInputSimpananTunaiPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const handleSubmit = async (values: InputSimpananTunaiPayload) => {
    try {
      await InputSimpananTunaiAPI.create(values);
      await showAlert(
        "success",
        `Simpanan tunai untuk "${values.Nama}" berhasil disimpan.`,
      );
      router.push("/transaksi-simpanan/input-simpanan-tunai");
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan simpanan tunai.",
      );
    }
  };

  const handleSaveAndNew = async (
    values: InputSimpananTunaiPayload,
  ): Promise<boolean> => {
    try {
      await InputSimpananTunaiAPI.create(values);
      return true;
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan simpanan tunai.",
      );
      return false;
    }
  };

  return (
    <DashboardShell
      title="Input Simpanan Tunai"
      subtitle="Form input simpanan tunai"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/transaksi-simpanan/input-simpanan-tunai")}
    >
      <div className="mx-auto max-w-4xl">
        <InputSimpananTunaiForm
          onSubmit={handleSubmit}
          onSaveAndNew={handleSaveAndNew}
          onCancel={() =>
            router.push("/transaksi-simpanan/input-simpanan-tunai")
          }
        />
      </div>
    </DashboardShell>
  );
}
