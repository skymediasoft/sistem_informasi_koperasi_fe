"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import {
  UserLoginForm,
  type UserLoginFormValues,
} from "@/components/forms/user-login-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { groupApi, type Group } from "@/lib/api";
import { authApi } from "@/lib/auth/authapi";

const normalizeGroups = (payload: unknown): Group[] => {
  if (Array.isArray(payload)) return payload as Group[];
  if (!payload || typeof payload !== "object") return [];
  const response = payload as Record<string, unknown>;
  for (const key of ["data", "groups", "items", "results", "rows"]) {
    if (key in response) return normalizeGroups(response[key]);
  }
  return [];
};

export default function CreateUserPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    void groupApi
      .findAll()
      .then((payload) => setGroups(normalizeGroups(payload)));
  }, []);

  const handleSubmit = async (values: UserLoginFormValues) => {
    try {
      await authApi.register({
        userlogin: values.userlogin,
        username: values.username,
        password: values.password,
        email: values.email,
        groupId: values.groupId ? Number(values.groupId) : undefined,
      });
      await showAlert(
        "success",
        `User "${values.username}" berhasil disimpan.`,
      );
      router.push("/settings/user-login");
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal menyimpan user.",
      );
    }
  };

  return (
    <DashboardShell
      title="Tambah User"
      subtitle="Form tambah user login baru"
      displayName={user?.name || "Administrator Koperasi"}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/settings/user-login")}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary">
          <Users className="size-5" />
          <span className="font-medium">
            Isi data user login baru dengan lengkap.
          </span>
        </div>
        <UserLoginForm
          mode="create"
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/settings/user-login")}
        />
      </div>
    </DashboardShell>
  );
}
