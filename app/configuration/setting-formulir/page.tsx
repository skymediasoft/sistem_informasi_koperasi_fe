"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileCog, Settings2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function SettingFormulirPage() {
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
      title="Configuration"
      subtitle="Setting utama aplikasi koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Simpan config"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Settings2} label="Simpanan" value="Aktif" />
        <MetricCard icon={SlidersHorizontal} label="Pinjaman" value="Aktif" />
        <MetricCard icon={FileCog} label="Formulir" value="11 template" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Konfigurasi umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Setting simpanan wajib",
              "Setting pinjaman & kredit",
              "Setting jenis jasa",
              "Setting formulir dokumen",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Daftar status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Simpanan aktif",
              "Pinjaman aktif",
              "Jasa aktif",
              "Formulir siap dipakai",
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
