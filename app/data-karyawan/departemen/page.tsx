"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, ClipboardList, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole} from "@/lib/auth/navigation";

type DepartemenRow = {
  Deptid: string;
  Departemen: string;
  createdUser: string;
  createdDate: number;
};

const departemenData: DepartemenRow[] = [
  { Deptid: "16", Departemen: "Keuangan", createdUser: "Rina Wijaya", createdDate: Date.now() },
  { Deptid: "17", Departemen: "Simpanan & Pinjaman", createdUser: "Dodi Pratama", createdDate: Date.now() },
  { Deptid: "ANP", Departemen: "Anggota & Pelayanan", createdUser: "Nia Rahma", createdDate: Date.now() },
  { Deptid: "CER", Departemen: "Operasional", createdUser: "Andi Kusuma", createdDate: Date.now() },
];



export default function DepartemenPage() {
  const router = useRouter();
  const { logout, user,loading } = useAuth();

  
  if (!user) {
    return null;
  }

  const role = user.role;
  const menu = getMenuByRole(
    role,
    user.menus,
  );
 
  const displayName = user?.name || "";

  const columns = useMemo(
    () => [
      { key: "No", header: "No", className: "w-16", accessor: (_row: DepartemenRow, index: number) => index },
      { key: "Deptid", header: "Dept Id", className: "w-24", accessor: (row: DepartemenRow) => row.Deptid },
      { key: "Departemen", header: "Nama Departemen", accessor: (row: DepartemenRow) => row.Departemen },
      { key: "createdUser", header: "Dibuat Oleh", accessor: (row: DepartemenRow) => row.createdUser },
      { key: "createdDate", header: "Tanggal Dibuat", accessor: (row: DepartemenRow) => new Date(row.createdDate).toLocaleDateString() },
    ],
    []
  );

  const handleCreate = () => router.push("/data-karyawan/departemen/create");
  const handleEdit = (row: DepartemenRow) => router.push(`/data-karyawan/departemen/edit/${row.Deptid}`);
  const handleDelete = (row: DepartemenRow) => {
    const confirmed = window.confirm(`Apakah kamu yakin ingin menghapus data departemen "${row.Departemen}"?`);

    if (confirmed) {
      console.log("Delete departemen", row.Deptid, row.Departemen);
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
