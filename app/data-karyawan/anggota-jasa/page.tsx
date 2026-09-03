"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function AnggotaPage() {
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
      title="Anggota"
      subtitle="Data anggota koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Tambah anggota"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Users} label="Total anggota" value="9.240" />
        <MetricCard icon={ShieldCheck} label="Akun aktif" value="8.910" />
        <MetricCard icon={FolderKanban} label="Verifikasi" value="96%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Daftar anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Budi Santoso - KPR-2024-001",
              "Siti Aminah - KPR-2024-002",
              "Andi Wijaya - KPR-2024-003",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Verifikasi akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Akun baru menunggu review",
              "Data dokumen telah lengkap",
              "Status aktif: 18 pending approval",
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
