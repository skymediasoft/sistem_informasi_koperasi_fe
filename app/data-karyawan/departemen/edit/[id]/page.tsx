"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { type DepartemenFormValues, DepartemenForm } from "@/components/forms/departemen-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

const departemenSeed: DepartemenFormValues[] = [
  {
    Deptid: "16",
    Departemen: "Keuangan",
  },
  {
    Deptid: "17",
    Departemen: "Simpanan & Pinjaman",
  },
  {
    Deptid: "ANP",
    Departemen: "Anggota & Pelayanan",
  },
  {
    Deptid: "CER",
    Departemen: "Operasional",
  },
];

export default function EditDepartemenPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { logout, user } = useAuth();

  const departemenId = params?.id ?? "";
  const selectedDepartemen = useMemo(
    () => departemenSeed.find((item) => item.Deptid === departemenId) ?? departemenSeed[0],
    [departemenId]
  );

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  const handleSubmit = (values: DepartemenFormValues) => {
    console.log("Update departemen", values);
    router.push("/master-data/departemen");
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
      onAction={() => router.push("/master-data/departemen")}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent-foreground">
          <Building2 className="size-5" />
          <span className="font-medium">Mengubah data departemen yang sudah ada.</span>
        </div>

        <DepartemenForm
          mode="edit"
          initialValues={selectedDepartemen}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/master-data/departemen")}
        />
      </div>
    </DashboardShell>
  );
}
