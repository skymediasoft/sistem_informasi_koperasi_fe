"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, FolderKanban, ShieldCheck, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

type AnggotaRow = {
  id: number;
  memberId: string;
  name: string;
  departemen: string;
  status: string;
  joinDate: string;
};

const anggotaData: AnggotaRow[] = [
  { id: 1, memberId: "KPR-2024-001", name: "Budi Santoso", departemen: "Keuangan", status: "Aktif", joinDate: "2024-01-15" },
  { id: 2, memberId: "KPR-2024-002", name: "Siti Aminah", departemen: "Simpanan & Pinjaman", status: "Baru", joinDate: "2024-02-10" },
  { id: 3, memberId: "KPR-2024-003", name: "Andi Wijaya", departemen: "Anggota & Pelayanan", status: "Review", joinDate: "2023-12-21" },
  { id: 4, memberId: "KPR-2024-004", name: "Rani Lestari", departemen: "Operasional", status: "Aktif", joinDate: "2024-03-12" },
  { id: 5, memberId: "KPR-2024-005", name: "Dewa Putra", departemen: "IT & Sistem", status: "Aktif", joinDate: "2024-01-25" },
  { id: 6, memberId: "KPR-2024-006", name: "Lina Kartika", departemen: "HRD", status: "Baru", joinDate: "2024-04-14" },
  { id: 7, memberId: "KPR-2024-007", name: "Fajar Nugraha", departemen: "Keuangan", status: "Aktif", joinDate: "2024-02-27" },
  { id: 8, memberId: "KPR-2024-008", name: "Melisa Putri", departemen: "Anggota & Pelayanan", status: "Review", joinDate: "2024-05-02" },
];

export default function AnggotaPage() {
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

  const columns = useMemo(
    () => [
      { key: "id", header: "No", className: "w-16", accessor: (row: AnggotaRow) => row.id },
      { key: "memberId", header: "ID Anggota", accessor: (row: AnggotaRow) => row.memberId },
      { key: "name", header: "Nama", accessor: (row: AnggotaRow) => row.name },
      { key: "departemen", header: "Departemen", accessor: (row: AnggotaRow) => row.departemen },
      { key: "status", header: "Status", accessor: (row: AnggotaRow) => <StatusBadge status={row.status} /> },
      { key: "joinDate", header: "Tanggal Join", accessor: (row: AnggotaRow) => row.joinDate },
    ],
    []
  );

  const handleCreate = () => router.push("/data-karyawan/anggota/create");
  const handleEdit = (row: AnggotaRow) => router.push(`/data-karyawan/anggota/edit/${row.memberId}`);
  const handleDelete = (row: AnggotaRow) => console.log("Delete anggota", row.memberId);

  return (
    <DashboardShell
      title="Anggota"
      subtitle="Data anggota koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Tambah anggota"
      onAction={handleCreate}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Users} label="Total anggota" value="9.240" />
        <MetricCard icon={ShieldCheck} label="Akun aktif" value="8.910" />
        <MetricCard icon={FolderKanban} label="Verifikasi" value="96%" />
      </div>

      <div className="mt-6">
        <DataTable
          title="Daftar anggota"
          subtitle="Kelola data anggota koperasi"
          data={anggotaData}
          columns={columns}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createLabel="Create New Data"
          searchPlaceholder="Cari anggota..."
          pageSize={5}
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

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette = {
    Aktif: "bg-emerald-100 text-emerald-700",
    Baru: "bg-blue-100 text-blue-700",
    Review: "bg-amber-100 text-amber-700",
  } as const;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${palette[status as keyof typeof palette] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
