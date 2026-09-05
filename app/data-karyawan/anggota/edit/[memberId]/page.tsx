"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserRoundCog } from "lucide-react";

import { MemberForm, type MemberFormValues } from "@/components/forms/anggota-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

const anggotaSeed: MemberFormValues[] = [
  {
    memberId: "KPR-2024-001",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "081234567890",
    departemen: "Keuangan",
    status: "Aktif",
    joinDate: "2024-01-15",
    address: "Jl. Merdeka No. 12, Bandung",
  },
  {
    memberId: "KPR-2024-002",
    name: "Siti Aminah",
    email: "siti.aminah@example.com",
    phone: "081233445566",
    departemen: "Simpanan & Pinjaman",
    status: "Baru",
    joinDate: "2024-02-10",
    address: "Jl. Cikutra No. 22, Bandung",
  },
  {
    memberId: "KPR-2024-003",
    name: "Andi Wijaya",
    email: "andi.wijaya@example.com",
    phone: "081287654321",
    departemen: "Anggota & Pelayanan",
    status: "Review",
    joinDate: "2023-12-21",
    address: "Jl. Setiabudi No. 7, Bandung",
  },
];

export default function EditAnggotaPage() {
  const router = useRouter();
  const params = useParams<{ memberId?: string }>();
  const { logout, user } = useAuth();

  const memberId = params?.memberId ?? "";
  const selectedMember = useMemo(
    () => anggotaSeed.find((item) => item.memberId === memberId) ?? anggotaSeed[0],
    [memberId]
  );

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  const handleSubmit = (values: MemberFormValues) => {
    console.log("Update anggota", values);
    router.push("/data-karyawan/anggota");
  };

  return (
    <DashboardShell
      title="Edit Anggota"
      subtitle="Perbarui data anggota"
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
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent-foreground">
          <UserRoundCog className="size-5" />
          <span className="font-medium">Mengubah identitas dan status anggota.</span>
        </div>

        <MemberForm
          mode="edit"
          initialValues={selectedMember}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/data-karyawan/anggota")}
        />
      </div>
    </DashboardShell>
  );
}
