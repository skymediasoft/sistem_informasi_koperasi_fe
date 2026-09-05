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
import { departmentApi, type Department } from "@/lib/api";

type DepartemenRow = {
  Deptid: string;
  Departemen: string;
  createdUser: string;
  createdDate: number;
};

const formatTanggal = (timestamp: number) =>
  timestamp
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(timestamp))
    : "-";

export default function DepartemenPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [departemenData, setDepartemenData] = useState<DepartemenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(
    role,
    user?.menus,
  );
 
  const displayName = user?.name || "Administrator Koperasi";

  const loadDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const departments = await departmentApi.findAll();
      setDepartemenData(
        departments.map((department: Department) => ({
          Deptid: department.departmentId,
          Departemen: department.departmentName,
          createdUser: department.departmentCreatedUser,
          createdDate: department.departmentCreateDate
            ? new Date(department.departmentCreateDate).getTime()
            : 0,
        })),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat data departemen.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, []);

  if (!user) {
    return null;
  }

  const columns = useMemo(
    () => [
      { key: "No", header: "No", className: "w-16", accessor: (_row: DepartemenRow, index: number) => index },
      { key: "Deptid", header: "Dept Id", className: "w-24", accessor: (row: DepartemenRow) => row.Deptid },
      { key: "Departemen", header: "Nama Departemen", accessor: (row: DepartemenRow) => row.Departemen },
      { key: "createdUser", header: "Dibuat Oleh", accessor: (row: DepartemenRow) => row.createdUser },
      { key: "createdDate", header: "Tanggal Dibuat", accessor: (row: DepartemenRow) => formatTanggal(row.createdDate) },
    ],
    []
  );

  const handleCreate = () => router.push("/data-karyawan/departemen/create");
  const handleEdit = (row: DepartemenRow) => router.push(`/data-karyawan/departemen/edit/${row.Deptid}`);
  const handleDelete = async (row: DepartemenRow) => {
    const result = await showConfirm(`Data departemen "${row.Departemen}" akan dihapus.`);

    if (result.isConfirmed) {
      try {
        await departmentApi.delete(row.Deptid);
        setDepartemenData((current) => current.filter((department) => department.Deptid !== row.Deptid));
        await showAlert("success", `Departemen "${row.Departemen}" berhasil dihapus.`);
      } catch (requestError) {
        await showAlert(
          "danger",
          requestError instanceof Error ? requestError.message : "Gagal menghapus departemen.",
        );
      }
    }
  };

  return (
    <DashboardShell
      title="Departemen"
      subtitle="Unit kerja koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Tambah unit"
      onAction={handleCreate}
    >
      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadDepartments()}>
            <RefreshCw className="size-4" />
            Coba lagi
          </Button>
        </div>
      ) : null}
      <div className="mt-0">
        <DataTable
          title="Daftar departemen"
          subtitle="Kelola unit kerja dan struktur organisasi"
          data={departemenData}
          columns={columns}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createLabel="Create New Data"
          searchPlaceholder="Cari departemen..."
          pageSize={10}
          emptyMessage={loading ? "Memuat data departemen..." : "Belum ada data departemen."}
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
