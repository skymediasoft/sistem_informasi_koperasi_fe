"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { DepartemenForm, type DepartemenFormValues } from "@/components/forms/departemen-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { departmentApi } from "@/lib/api";

export default function CreateDepartemenPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  const handleSubmit = async (values: DepartemenFormValues) => {
    try {
      await departmentApi.create({
        departmentId: values.Deptid,
        departmentName: values.Departemen,
      });
      await showAlert("success", `Departemen "${values.Departemen}" berhasil disimpan.`);
      router.push("/data-karyawan/departemen");
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error ? requestError.message : "Gagal menyimpan departemen.",
      );
    }
  };

  return (
    <DashboardShell
      title="Tambah Departemen"
      subtitle="Form tambah unit kerja baru"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/data-karyawan/departemen")}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary">
          <Building2 className="size-5" />
          <span className="font-medium">Isi data unit kerja baru dengan lengkap.</span>
        </div>

        <DepartemenForm mode="create" onSubmit={handleSubmit} onCancel={() => router.push("/data-karyawan/departemen")} />
      </div>
    </DashboardShell>
  );
}
