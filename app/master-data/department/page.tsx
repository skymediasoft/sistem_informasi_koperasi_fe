"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ClipboardList, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function DepartmentPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  useEffect(() => {
    const savedSession = getSessionFromStorage();
    if (!savedSession) router.replace("/login");
  }, [router]);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <DashboardShell
      title="Department"
      subtitle="Unit kerja koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Tambah unit"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Building2} label="Unit aktif" value="18" />
        <MetricCard icon={Users} label="Pegawai" value="220" />
        <MetricCard icon={ClipboardList} label="Proses" value="7" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Daftar unit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Keuangan - 32 pegawai",
              "Simpanan & Pinjaman - 48 pegawai",
              "Anggota & Pelayanan - 58 pegawai",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Catatan perubahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Tim pelayanan ditambah 2 orang",
              "Unit audit mobile dibentuk bulan lalu",
              "Department keuangan perlu review struktur",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
