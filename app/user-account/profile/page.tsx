"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function UserProfilePage() {
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
      title="Change My Profile"
      subtitle="Profil akun"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Simpan profil"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Informasi profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl bg-secondary p-3">Nama: {displayName}</div>
            <div className="rounded-xl bg-secondary p-3">Email: {user?.email || "administrator@kopera.id"}</div>
            <div className="rounded-xl bg-secondary p-3">Role: {user?.role || "administrator"}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <BadgeCheck className="size-4 text-emerald-600" />
              Akun terverifikasi
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <UserCog className="size-4 text-primary" />
              Hak akses sesuai role
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
