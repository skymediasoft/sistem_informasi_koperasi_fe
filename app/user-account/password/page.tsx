"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function UserPasswordPage() {
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
      title="Change My Password"
      subtitle="Keamanan akun"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Update password"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Password policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl bg-secondary p-3">Minimal 6 karakter</div>
            <div className="rounded-xl bg-secondary p-3">Gunakan kombinasi huruf dan angka</div>
            <div className="rounded-xl bg-secondary p-3">Jangan gunakan password lama</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Status keamanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <ShieldCheck className="size-4 text-emerald-600" />
              Password terkini aman
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <LockKeyhole className="size-4 text-primary" />
              Enkripsi akun aktif
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
