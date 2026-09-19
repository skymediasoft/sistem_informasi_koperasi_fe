"use client";

import { useRouter } from "next/navigation";

import { MemberForm} from "@/components/forms/anggota-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { showAlert } from "@/lib/alert";
import { anggotaApi, AnggotaCreatePayload } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";

export default function CreateAnggotaPage() {
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

  const handleSubmit = async (values: AnggotaCreatePayload) => {
    try {
      await anggotaApi.create(values);

      await showAlert(
        "success",
        `Anggota "${values.Nama}" berhasil disimpan.`,
      );

      router.push("/data-karyawan/anggota");
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan anggota.",
      );
    }
  };

  const handleSaveAndNew = async (
    values: AnggotaCreatePayload,
  ): Promise<boolean> => {
    try {
      await anggotaApi.create(values);

      await showAlert(
        "success",
        `Anggota "${values.Nama}" berhasil disimpan.`,
      );

      return true;
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal menyimpan anggota.",
      );

      return false;
    }
  };

  return (
    <DashboardShell
      title="Tambah Anggota"
      subtitle="Form tambah anggota baru"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/data-karyawan/anggota")}
    >
      <div className="mx-auto max-w-4xl">
        <MemberForm
          mode="create"
          onSubmit={handleSubmit}
          onSaveAndNew={handleSaveAndNew}
          onCancel={() => router.push("/data-karyawan/anggota")}
        />
      </div>
    </DashboardShell>
  );
}
