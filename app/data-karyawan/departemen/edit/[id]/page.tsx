"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { type DepartemenFormValues, DepartemenForm } from "@/components/forms/departemen-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { departmentApi } from "@/lib/api";
import { showAlert } from "@/lib/alert";

export default function EditDepartemenPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { logout, user } = useAuth();
  const departemenId = params?.id ?? "";
  const [selectedDepartemen, setSelectedDepartemen] = useState<DepartemenFormValues>();
  const [loading, setLoading] = useState(true);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  useEffect(() => {
    const loadDepartment = async () => {
      if (!departemenId) return;

      try {
        const department = await departmentApi.findOne(departemenId);
        setSelectedDepartemen({
          Deptid: department.departmentId,
          Departemen: department.departmentName,
        });
      } catch (requestError) {
        await showAlert(
          "danger",
          requestError instanceof Error ? requestError.message : "Gagal memuat departemen.",
        );
        router.push("/data-karyawan/departemen");
      } finally {
        setLoading(false);
      }
    };

    void loadDepartment();
  }, [departemenId, router]);

  const handleSubmit = async (values: DepartemenFormValues) => {
    try {
      await departmentApi.update(departemenId, {
        departmentName: values.Departemen,
      });
      await showAlert("success", `Departemen "${values.Departemen}" berhasil diperbarui.`);
      router.push("/data-karyawan/departemen");
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error ? requestError.message : "Gagal memperbarui departemen.",
      );
    }
  };

  return (
    <DashboardShell
      title="Edit Departemen"
      subtitle="Perbarui data unit kerja"
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
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent-foreground">
          <Building2 className="size-5" />
          <span className="font-medium">Mengubah data departemen yang sudah ada.</span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat data departemen...</p>
        ) : selectedDepartemen ? (
          <DepartemenForm
            mode="edit"
            initialValues={selectedDepartemen}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/data-karyawan/departemen")}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
