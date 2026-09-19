"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserRoundCog } from "lucide-react";

import { MemberForm } from "@/components/forms/anggota-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { showAlert } from "@/lib/alert";
import { anggotaApi, AnggotaCreatePayload, type AnggotaPayload } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";

export default function EditAnggotaPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const params = useParams<{ memberId?: string }>();

  const memberId = params?.memberId ?? "";
  const [memberData, setMemberData] = useState<AnggotaPayload | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!memberId) {
    setLoading(false);
    return;
  }

  const fetchMember = async () => {
    try {
      setLoading(true);

      const response = await anggotaApi.findOne(memberId);

      console.log("DETAIL ANGGOTA:", response);

      setMemberData(response);
    } catch (error) {
      console.error("GAGAL GET ANGGOTA:", error);

      await showAlert(
        "danger",
        error instanceof Error
          ? error.message
          : "Gagal memuat detail anggota.",
      );

      router.push("/data-karyawan/anggota");
    } finally {
      setLoading(false);
    }
  };

  void fetchMember();
}, [memberId, router]);

  const selectedMember = useMemo(() => {
    if (!memberData) return undefined;

    return {
      NoEmployee: memberData.NoEmployee ?? "",
      Nama: memberData.Nama ?? "",
      Alamat: memberData.Alamat ?? "",
      Telpon: memberData.Telpon ?? "",
      JenisKelamin: memberData.JenisKelamin ?? "",
      DepartmentId: Number(memberData.DepartmentId ?? 0),
      JenisAnggota: memberData.JenisAnggota ?? "",
      TanggalMasuk: memberData.TanggalMasuk ? String(memberData.TanggalMasuk).slice(0, 10) : new Date().toISOString().slice(0, 10),
      NoRekening: memberData.NoRekening ?? "",
      SimpananPokok: Number(memberData.SimpananPokok ?? 0),
      SimpananWajib: Number(memberData.SimpananWajib ?? 0),
      SimpananSukarela: Number(memberData.SimpananSukarela ?? 0),
      AlamatEmail: memberData.AlamatEmail ?? "",
      StatusAnggota: memberData.StatusAnggota ?? "",
    };
  }, [memberData]);

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
    await anggotaApi.update(memberId, values);

    await showAlert(
      "success",
      `Anggota "${values.Nama}" berhasil diperbarui.`,
    );

    router.push("/data-karyawan/anggota");
  } catch (error) {
    await showAlert(
      "danger",
      error instanceof Error
        ? error.message
        : "Gagal memperbarui anggota.",
    );
  }
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

        {!loading && selectedMember ? (
          <MemberForm
            mode="edit"
            initialValues={selectedMember}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/data-karyawan/anggota")}
          />
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            Memuat data anggota...
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
