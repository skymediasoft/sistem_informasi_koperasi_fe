"use client";

import { usePathname } from "next/navigation";

import { DashboardLayout as ShellLayout } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const publicPaths = new Set(["/", "/login", "/admin"]);

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (publicPaths.has(pathname) || loading || !user) {
    return <>{children}</>;
  }

  return (
    <ShellLayout
      displayName={user.name}
      groupName={user.groupName || "Koperasi"}
      menu={getMenuByRole(user.role, user.menus)}
      onLogout={logout}
    >
      {children}
    </ShellLayout>
  );
}