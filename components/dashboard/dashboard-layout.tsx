"use client";

import { usePathname } from "next/navigation";

import { DashboardLayout as ShellLayout } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const groupNames: Record<number, string> = {
  0: "Anggota",
  1: "Administrator",
  2: "Admin Koperasi",
  3: "Pengurus Koperasi",
};

const getGroupName = (groupId: number | string | null | undefined) => {
  const normalizedGroupId = Number(groupId);

  return groupNames[normalizedGroupId] ?? "Koperasi";
};

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
      groupName={getGroupName(user.groupId)}
      menu={getMenuByRole(user.role, user.menus)}
      onLogout={logout}
    >
      {children}
    </ShellLayout>
  );
}