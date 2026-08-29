"use client";

import { useEffect } from "react";
import { KeyRound, Lock, Palette, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function UserAccountPage() {
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
      title="User Account"
      subtitle="Profil dan pengaturan akun"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Edit profil"
      onAction={() => (window.location.hash = "#change-profile")}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Role" value={user?.role || "administrator"} trend="Aktif" icon={UserCog} />
        <Stat title="Password" value="Updated" trend="Terakhir 30 hari" icon={KeyRound} />
        <Stat title="Tema" value="Default" trend="Dark mode" icon={Palette} />
        <Stat title="Security" value="Strong" trend="2FA ready" icon={Lock} good />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Profil saya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Nama lengkap",
              "Nomor induk karyawan",
              "Email atau nomor telepon",
              "Divisi / unit",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="secondary">Tersedia</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Pengaturan keamanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Change My Password",
              "Change Themes",
              "Pengaturan notifikasi",
              "Log aktivitas akun",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="outline">Aktif</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Stat({ title, value, trend, icon: Icon, good = false }: { title: string; value: string; trend: string; icon: any; good?: boolean }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          <p className={`mt-2 text-xs ${good ? "text-emerald-600" : "text-muted-foreground"}`}>{trend}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
