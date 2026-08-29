"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function UserThemePage() {
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
      title="Change Themes"
      subtitle="Tema aplikasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Terapkan tema"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Pilihan tema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <Palette className="size-4 text-primary" />
              Default theme
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary p-3">
              <LayoutTemplate className="size-4 text-primary" />
              Light / dark layout ready
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
