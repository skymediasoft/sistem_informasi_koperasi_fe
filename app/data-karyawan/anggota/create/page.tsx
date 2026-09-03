"use client";

import { useRouter } from "next/navigation";
import { UserRoundPlus } from "lucide-react";

import { MemberForm, type MemberFormValues } from "@/components/forms/anggota-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function CreateAnggotaPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  const handleSubmit = (values: MemberFormValues) => {
    console.log("Create anggota", values);
    router.push("/master-data/anggota");
  };

  return (
    <DashboardShell
      title="Tambah Anggota"
      subtitle="Form pendaftaran anggota baru"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/master-data/anggota")}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary">
          <UserRoundPlus className="size-5" />
          <span className="font-medium">Isi data anggota baru dengan lengkap.</span>
        </div>

        <MemberForm mode="create" onSubmit={handleSubmit} onCancel={() => router.push("/master-data/anggota")} />
      </div>
    </DashboardShell>
  );
}
