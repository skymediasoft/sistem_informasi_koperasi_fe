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

import { userApi, type User } from "@/lib/api";

export default function UserLoginPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role ?? "administrator";

  const menu = getMenuByRole(
    role,
    user?.menus,
  );

  const displayName =
    user?.name || "Administrator Koperasi";

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.findAll();

      setUserData(
        Array.isArray(response) ? response : [],
      );
    } catch (requestError) {
      console.error(
        "Gagal memuat data user:",
        requestError,
      );

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

  const columns = useMemo(
    () => [
      {
        key: "UserLogin",
        header: "Login User",
        accessor: (row: User) =>
          row.UserLogin ?? "-",
      },
      {
        key: "UserName",
        header: "Nama User",
        accessor: (row: User) =>
          row.UserName ?? "-",
      },
      {
        key: "UserEmail",
        header: "Email User",
        accessor: (row: User) =>
          row.UserEmail ?? "-",
      },
      {
        key: "GroupName",
        header: "Nama Group",
        accessor: (row: User) =>
          row.GroupName ?? "-",
      },
      {
        key: "PostBy",
        header: "Dibuat Oleh",
        accessor: (row: User) =>
          row.PostBy ?? "-",
      },
      {
        key: "PostDate",
        header: "Tanggal",
        accessor: (row: User) =>
          formatTanggal(row.PostDate),
      },
    ],
    [],
  );

  const handleCreate = () => {
    router.push(
      "/settings/user-login/create",
    );
  };

  const handleEdit = (row: User) => {
    router.push(
      `/settings/user-login/edit/${row.UserLogin}`,
    );
  };

  const handleDelete = async (row: User) => {
    const result = await showConfirm(
      `Data user "${row.UserName}" akan dihapus.`,
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      await userApi.delete(
        row.UserLogin ?? "",
      );

      setUserData((current) =>
        current.filter(
          (item) =>
            item.UserLogin !== row.UserLogin,
        ),
      );

      await showAlert(
        "success",
        `User "${row.UserName}" berhasil dihapus.`,
      );
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal menghapus user.",
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardShell
      title="User Login"
      subtitle="Kelola akun user dan group akses koperasi"
      displayName={displayName}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Tambah User"
      onAction={handleCreate}
    >
      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadUsers()}
          >
            <RefreshCw className="size-4" />
            Coba lagi
          </Button>
        </div>
      ) : null}

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
        emptyMessage={
          loading
            ? "Memuat data user..."
            : "Belum ada data user."
        }
        renderActions={(row) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row)}
              className="h-8 gap-1.5"
            >
              <Edit className="size-3.5" />
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => void handleDelete(row)}
              className="h-8 gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </>
        )}
      />
    </DashboardShell>
  );
}

function formatTanggal(
  value?: string | number,
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
