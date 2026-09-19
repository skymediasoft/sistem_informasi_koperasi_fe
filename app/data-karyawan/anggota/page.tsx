"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, FolderKanban, ShieldCheck, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/lib/auth/auth-context";
import {
  getMenuByRole,
  getSessionFromStorage,
  secondaryMenu,
} from "@/lib/auth/navigation";

import { anggotaApi, type AnggotaPayload } from "@/lib/api";
import Swal from "sweetalert2";

export default function AnggotaPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [anggotaData, setAnggotaData] = useState<AnggotaPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchNama, setSearchNama] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterJenisAnggota, setFilterJenisAnggota] = useState("all");
  const [filterStatusAnggota, setFilterStatusAnggota] = useState("all");

  useEffect(() => {
    const savedSession = getSessionFromStorage();

    if (!savedSession) {
      router.replace("/login");
      return;
    }

    fetchAnggota();
  }, [router]);

  const fetchAnggota = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await anggotaApi.findAll();

      setAnggotaData(response ?? []);
    } catch (err) {
      console.error("Gagal mengambil data anggota:", err);
      setError("Gagal mengambil data anggota.");
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);

  const displayName = user?.name || "Administrator Koperasi";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const columns = useMemo(
    () => [
      {
        key: "NoAnggota",
        header: "No Anggota",
        accessor: (row: AnggotaPayload) => row.NoAnggota,
        className: "w-16 truncate",
      },
      {
        key: "NoEmployee",
        header: "No Employee",
        accessor: (row: AnggotaPayload) => row.NoEmployee,
        className: "w-16 truncate",
      },
      {
        key: "Nama",
        header: "Nama",
        accessor: (row: AnggotaPayload) => row.Nama,
      },
      {
        key: "Alamat",
        header: "Alamat",
        accessor: (row: AnggotaPayload) => row.Alamat,
        className: "w-16 truncate",
      },
      {
        key: "Telpon",
        header: "No. Telepon",
        accessor: (row: AnggotaPayload) => row.Telpon,
      },
      {
        key: "JenisKelamin",
        header: "Jenis Kelamin",
        accessor: (row: AnggotaPayload) => row.JenisKelamin,
      },
      {
        key: "DepartmentName",
        header: "Department",
        accessor: (row: AnggotaPayload) => row.DepartmentName,
        className: "w-16 truncate",
      },
      {
        key: "JenisAnggota",
        header: "Jenis Anggota",
        accessor: (row: AnggotaPayload) => row.JenisAnggota,
      },
      {
        key: "TanggalMasuk",
        header: "Tanggal Masuk",
        accessor: (row: AnggotaPayload) => formatTanggal(row.TanggalMasuk),
      },
      {
        key: "NoRekening",
        header: "No. Rekening",
        accessor: (row: AnggotaPayload) => row.NoRekening,
      },
      {
        key: "SimpananPokok",
        header: "Simpanan Pokok",
        accessor: (row: AnggotaPayload) =>
          formatRupiah(row.SimpananPokok),
      },
      {
        key: "SimpananWajib",
        header: "Simpanan Wajib",
        accessor: (row: AnggotaPayload) =>
          formatRupiah(row.SimpananWajib),
      },
      {
        key: "SimpananSukarela",
        header: "Simpanan Sukarela",
        accessor: (row: AnggotaPayload) =>
          formatRupiah(row.SimpananSukarela),
      },
      {
        key: "AlamatEmail",
        header: "Email",
        accessor: (row: AnggotaPayload) => row.AlamatEmail,
        className: "w-16 truncate",
      },
      {
        key: "CreatedUser",
        header: "Created User",
        accessor: (row: AnggotaPayload) => row.CreatedUser,
      },
      {
        key: "StatusAnggota",
        header: "Status Anggota",
        accessor: (row: AnggotaPayload) => row.StatusAnggota,
      },
    ],
    []
  );

  const departmentOptions = useMemo(() => {
  return Array.from(
    new Set(
      anggotaData
        .map((item) => item.DepartmentName)
        .filter(Boolean)
    )
  ).sort();
}, [anggotaData]);

const jenisAnggotaOptions = useMemo(() => {
  return Array.from(
    new Set(
      anggotaData
        .map((item) => item.JenisAnggota)
        .filter(Boolean)
    )
  ).sort();
}, [anggotaData]);

const statusAnggotaOptions = useMemo(() => {
  return Array.from(
    new Set(
      anggotaData
        .map((item) => item.StatusAnggota)
        .filter(Boolean)
    )
  ).sort();
}, [anggotaData]);

const filteredAnggotaData = useMemo(() => {
  const keyword = searchNama.trim().toLowerCase();

  return anggotaData.filter((item) => {
    const matchNama =
      !keyword ||
      String(item.Nama ?? "")
        .toLowerCase()
        .includes(keyword);

    const matchDepartment =
      filterDepartment === "all" ||
      item.DepartmentName === filterDepartment;

    const matchJenisAnggota =
      filterJenisAnggota === "all" ||
      item.JenisAnggota === filterJenisAnggota;

    const matchStatusAnggota =
      filterStatusAnggota === "all" ||
      item.StatusAnggota === filterStatusAnggota;
    return (
      matchNama &&
      matchDepartment &&
      matchJenisAnggota &&
      matchStatusAnggota
    );
  });
}, [
  anggotaData,
  searchNama,
  filterDepartment,
  filterJenisAnggota,
  filterStatusAnggota,
]);

  const handleCreate = () => {
    router.push("/data-karyawan/anggota/create");
  };

  const handleEdit = (row: AnggotaPayload) => {
    router.push(`/data-karyawan/anggota/edit/${row.NoAnggota}`);
  };

const handleDelete = async (row: AnggotaPayload) => {
  const result = await Swal.fire({
    title: "Hapus anggota?",
    text: `Apakah Anda yakin ingin menghapus anggota "${row.Nama}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await anggotaApi.delete(String(row.NoAnggota));

    setAnggotaData((prev) =>
      prev.filter((item) => item.NoAnggota !== row.NoAnggota)
    );

    await Swal.fire({
      title: "Berhasil!",
      text: "Data anggota berhasil dihapus.",
      icon: "success",
      confirmButtonText: "OK",
    });
  } catch (err) {
    console.error("Gagal menghapus anggota:", err);

    await Swal.fire({
      title: "Gagal!",
      text: "Gagal menghapus data anggota.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

  const totalAnggota = anggotaData.length;

  const akunAktif = anggotaData.length;

  const totalSimpanan = anggotaData.reduce(
    (total, item) =>
      total +
      Number(item.SimpananPokok || 0) +
      Number(item.SimpananWajib || 0) +
      Number(item.SimpananSukarela || 0),
    0
  );

  return (
    <DashboardShell
      title="Kelola Anggota Koperasi"
      subtitle=""
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
        <MetricCard
          icon={Users}
          label="Total anggota"
          value={loading ? "..." : totalAnggota.toLocaleString("id-ID")}
        />

        <MetricCard
          icon={ShieldCheck}
          label="Total data"
          value={loading ? "..." : akunAktif.toLocaleString("id-ID")}
        />

        <MetricCard
          icon={FolderKanban}
          label="Total simpanan"
          value={loading ? "..." : formatRupiah(totalSimpanan)}
        />
      </div>

      <div className="mt-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnggota}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}
        <div className="mb-4 rounded-2xl border bg-card p-4">
  <div className="grid gap-3 md:grid-cols-4">
    {/* Search Nama */}
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        Nama
      </label>

      <Input
        value={searchNama}
        onChange={(e) => setSearchNama(e.target.value)}
        placeholder="Cari nama anggota..."
      />
    </div>

    {/* Filter Department */}
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        Departemen
      </label>

      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={filterDepartment}
        onChange={(e) => setFilterDepartment(e.target.value)}
      >
        <option value="all">Semua departemen</option>

        {departmentOptions.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </div>

    {/* Filter Jenis Anggota */}
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        Jenis Anggota
      </label>

      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={filterJenisAnggota}
        onChange={(e) => setFilterJenisAnggota(e.target.value)}
      >
        <option value="all">Semua jenis anggota</option>

        {jenisAnggotaOptions.map((jenis) => (
          <option key={jenis} value={jenis}>
            {jenis}
          </option>
        ))}
      </select>
    </div>
        {/* Filter Status Anggota */}
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        Status Anggota
      </label>

      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={filterStatusAnggota}
        onChange={(e) => setFilterStatusAnggota(e.target.value)}
      >
        <option value="all">Semua status anggota</option>

        {statusAnggotaOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

        <DataTable
          title="Daftar anggota"
          subtitle="Kelola data anggota koperasi"
          data={filteredAnggotaData}
          columns={columns}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createLabel="Tambah Anggota Baru"
          searchPlaceholder="Cari anggota..."
          pageSize={5}
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
                onClick={() => handleDelete(row)}
                className="h-8 gap-1.5"
              >
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

function formatTanggal(value: Date | string) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("id-ID");
}

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>

          <p className="mt-3 text-xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

