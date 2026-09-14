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
import { groupApi, type Group } from "@/lib/api";

type GroupLoginRow = {
  GroupId: string;
  GroupName: string;
  createdUser: string;
  createdDate: number;
};

const getGroupId = (group: Group) =>
  String(group.groupId ?? group.GroupId ?? group.id ?? "");

const getGroupName = (group: Group) =>
  group.groupName ?? group.GroupName ?? group.name ?? getGroupId(group);

const getGroupCreatedUser = (group: Group) =>
  group.groupCreatedUser ?? group.GroupCreatedUser ?? group.createdUser ?? "-";

const getGroupCreatedDate = (group: Group) =>
  group.groupCreateDate ?? group.GroupCreateDate ?? group.createdDate;

const normalizeGroups = (payload: unknown): Group[] => {
  if (Array.isArray(payload)) {
    return payload.filter(
      (group): group is Group => typeof group === "object" && group !== null,
    );
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const response = payload as Record<string, unknown>;
  for (const key of ["data", "groups", "items", "results", "rows"]) {
    if (key in response) {
      return normalizeGroups(response[key]);
    }
  }

  return [];
};

const formatTanggal = (timestamp: number) =>
  timestamp
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(timestamp))
    : "-";

export default function GroupLoginPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [groupData, setGroupData] = useState<GroupLoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(
    role,
    user?.menus,
  );
 
  const displayName = user?.name || "Administrator Koperasi";

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const groups = normalizeGroups(await groupApi.findAll());
      setGroupData(
        groups.map((group) => ({
          GroupId: getGroupId(group),
          GroupName: getGroupName(group),
          createdUser: getGroupCreatedUser(group),
          createdDate: getGroupCreatedDate(group)
            ? new Date(getGroupCreatedDate(group) as string | number).getTime()
            : 0,
        })),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat data group.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  if (!user) {
    return null;
  }

  const columns = useMemo(
    () => [
      { key: "GroupId", header: "Group Id", className: "w-24 text-center", accessor: (row: GroupLoginRow) => row.GroupId },
      { key: "GroupName", header: "Nama Group", accessor: (row: GroupLoginRow) => row.GroupName },
      { key: "createdUser", header: "Dibuat Oleh", accessor: (row: GroupLoginRow) => row.createdUser },
      { key: "createdDate", header: "Tanggal Dibuat", accessor: (row: GroupLoginRow) => formatTanggal(row.createdDate) },
    ],
    []
  );

  const handleCreate = () => router.push("/settings/group-login/create");
  const handleEdit = (row: GroupLoginRow) => router.push(`/settings/group-login/edit/${row.GroupId}`);
  const handleDelete = async (row: GroupLoginRow) => {
    const result = await showConfirm(`Data group "${row.GroupName}" akan dihapus.`);

    if (result.isConfirmed) {
      try {
        await groupApi.delete(row.GroupId);
        setGroupData((current) => current.filter((group) => group.GroupId !== row.GroupId));
        await showAlert("success", `Group "${row.GroupName}" berhasil dihapus.`);
      } catch (requestError) {
        await showAlert(
          "danger",
          requestError instanceof Error ? requestError.message : "Gagal menghapus group.",
        );
      }
    }
  };

  return (
    <DashboardShell
      title="Group Login"
      subtitle="Kelola group dan akses login koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Tambah Group"
      onAction={handleCreate}
    >
      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadGroups()}>
            <RefreshCw className="size-4" />
            Coba lagi
          </Button>
        </div>
      ) : null}
      <div className="mt-0">
        <DataTable
          title="Daftar group"
          subtitle="Kelola group login dan struktur akses"
          data={groupData}
          columns={columns}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createLabel="Create New Data"
          searchPlaceholder="Cari group..."
          pageSize={10}
          emptyMessage={loading ? "Memuat data group..." : "Belum ada data group."}
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
