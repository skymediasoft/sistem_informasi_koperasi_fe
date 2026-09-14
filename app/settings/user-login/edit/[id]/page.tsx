"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { UserLoginForm, type UserLoginFormValues } from "@/components/forms/user-login-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { groupApi, type Group, type User, userApi } from "@/lib/api";

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const response = payload as Record<string, unknown>;
  for (const key of ["data", "groups", "items", "results", "rows"]) {
    if (key in response) return normalizeList<T>(response[key]);
  }
  return [];
};
const getUserId = (item: User) => String(
  item.id ?? item.userId ?? item.UserId ?? item.userLogin ?? item.UserLogin ?? "",
);
const getUserGroupId = (item: User) => String(item.groupId ?? item.group_id ?? item.GroupId ?? "");

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { logout, user } = useAuth();
  const groupId = params?.id ?? "";
  const [selectedUser, setSelectedUser] = useState<UserLoginFormValues>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;
      try {
        const [usersPayload, groupsPayload] = await Promise.all([userApi.findAll(), groupApi.findAll()]);
        const userRecord = normalizeList<User>(usersPayload).find((item) => getUserId(item) === groupId);
        const loadedGroups = normalizeList<Group>(groupsPayload);
        if (!userRecord) throw new Error("User tidak ditemukan.");
        setGroups(loadedGroups);
        setSelectedUser({ userlogin: userRecord.userlogin ?? userRecord.userLogin ?? userRecord.UserLogin ?? "", username: userRecord.username ?? userRecord.userName ?? userRecord.UserName ?? "", email: userRecord.userEmail ?? userRecord.email ?? userRecord.UserEmail ?? "", groupId: getUserGroupId(userRecord), password: "" });
      } catch (requestError) {
        await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal memuat group.");
        router.push("/settings/user-login");
      } finally {
        setLoading(false);
      }
    };
    void loadGroup();
  }, [groupId, router]);

  const handleSubmit = async (values: UserLoginFormValues) => {
    try {
      const payload = { username: values.username, email: values.email, groupId: values.groupId ? Number(values.groupId) : undefined, ...(values.password ? { password: values.password } : {}) };
      await userApi.update(groupId, payload);
      await showAlert("success", `User "${values.username}" berhasil diperbarui.`);
      router.push("/settings/user-login");
    } catch (requestError) {
      await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal memperbarui user.");
    }
  };

  return (
    <DashboardShell title="Edit User" subtitle="Perbarui data user login" displayName={user?.name || "Administrator Koperasi"} groupName={user?.groupName || "Koperasi"} menu={menu} secondaryMenu={secondaryMenu} onLogout={logout} actionLabel="Kembali" onAction={() => router.push("/settings/user-login")}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent-foreground"><Users className="size-5" /><span className="font-medium">Mengubah data user login yang sudah ada.</span></div>
        {loading ? <p className="text-sm text-muted-foreground">Memuat data user...</p> : selectedUser ? <UserLoginForm mode="edit" groups={groups} initialValues={selectedUser} onSubmit={handleSubmit} onCancel={() => router.push("/settings/user-login")} /> : null}
      </div>
    </DashboardShell>
  );
}