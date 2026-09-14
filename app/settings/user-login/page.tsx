"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import { showAlert, showConfirm } from "@/lib/alert";
import { groupApi, type Group, type User, userApi } from "@/lib/api";

type UserLoginRow = {
  id: string;
  email: string;
  userlogin: string;
  username: string;
  groupId: string;
  groupName: string;
};

const getGroupOptionId = (group: Group) =>
  String(group.groupId ?? group.GroupId ?? group.id ?? "");

const getGroupName = (group: Group) =>
  group.groupName ?? group.GroupName ?? group.name ?? getGroupOptionId(group);

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const response = payload as Record<string, unknown>;
  for (const key of ["data", "groups", "items", "results", "rows"]) {
    if (key in response) {
      return normalizeList<T>(response[key]);
    }
  }

  return [];
};

const getUserId = (user: User) => String(user.id ?? user.userId ?? user.UserId ?? "");
const getUserGroupId = (user: User) => String(user.groupId ?? user.group_id ?? user.GroupId ?? "");
const getUserLogin = (user: User) => user.userlogin ?? user.userLogin ?? user.UserLogin ?? "-";
const getUserName = (user: User) => user.username ?? user.userName ?? user.UserName ?? "-";
const getEmail = (user: User) => user.email ?? user.UserEmail ?? "-";

export default function UserLoginPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [userData, setUserData] = useState<UserLoginRow[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(
    role,
    user?.menus,
  );
 
  const displayName = user?.name || "Administrator Koperasi";

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersPayload, groupsPayload] = await Promise.all([userApi.findAll(), groupApi.findAll()]);
      const loadedGroups = normalizeList<Group>(groupsPayload);
      const groupNames = new Map(loadedGroups.map((group) => [getGroupOptionId(group), getGroupName(group)]));
      setGroups(loadedGroups);
      setUserData(normalizeList<User>(usersPayload).map((item) => ({
        id: getUserId(item), email: getEmail(item), userlogin: getUserLogin(item), username: getUserName(item),
        groupId: getUserGroupId(item), groupName: groupNames.get(getUserGroupId(item)) ?? (getUserGroupId(item) || "-"),
      })));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat data user.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  if (!user) {
    return null;
  }

  const columns = useMemo(
    () => [
      { key: "email", header: "Email User", accessor: (row: UserLoginRow) => row.email },
      { key: "userlogin", header: "Login User", accessor: (row: UserLoginRow) => row.userlogin },
      { key: "username", header: "Nama User", accessor: (row: UserLoginRow) => row.username },
      { key: "groupName", header: "Nama Group", accessor: (row: UserLoginRow) => row.groupName },
    ],
    []
  );

  const handleCreate = () => router.push("/settings/user-login/create");
  const handleEdit = (row: UserLoginRow) => router.push(`/settings/user-login/edit/${row.id}`);
  const handleDelete = async (row: UserLoginRow) => {
    const result = await showConfirm(`Data user "${row.username}" akan dihapus.`);

    if (result.isConfirmed) {
      try {
        await userApi.delete(row.id);
        setUserData((current) => current.filter((item) => item.id !== row.id));
        await showAlert("success", `User "${row.username}" berhasil dihapus.`);
      } catch (requestError) {
        await showAlert(
          "danger",
          requestError instanceof Error ? requestError.message : "Gagal menghapus user.",
        );
      }
    }
  };

  return (
    <DashboardShell
      title="User Login"
      subtitle="Kelola akun user dan group akses koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Tambah User"
      onAction={handleCreate}
    >
      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadUsers()}>
            <RefreshCw className="size-4" />
            Coba lagi
          </Button>
        </div>
      ) : null}
      <div className="mt-0">
        <DataTable
          title="Daftar user"
          subtitle="Kelola akun login dan group akses"
          data={userData}
          columns={columns}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createLabel="Tambah User"
          searchPlaceholder="Cari user..."
          pageSize={10}
          emptyMessage={loading ? "Memuat data user..." : "Belum ada data user."}
          renderActions={(row) => (
            <>
              <Button variant="outline" size="sm" onClick={() => handleEdit(row)} className="h-8 gap-1.5">
                <Edit className="size-3.5" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(row)} className="h-8 gap-1.5">
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </>
          )}
        />
      </div>
    </DashboardShell>
  );
}
