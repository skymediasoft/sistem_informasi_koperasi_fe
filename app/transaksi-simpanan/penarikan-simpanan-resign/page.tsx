"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Search, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import {
  penarikanSimpananResignApi,
  type penarikanSimpananResignGet,
} from "@/lib/api";

type PenarikanSimpananRow = Record<string, unknown>;

const isRecord = (value: unknown): value is PenarikanSimpananRow =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function PenarikanSimpananResignPage() {
  const { logout, user } = useAuth();
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [noKaryawan, setNoKaryawan] = useState("");
  const [data, setData] = useState<PenarikanSimpananRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const displayName = user?.name || "Administrator Koperasi";

  const getIdFromRow = (row: PenarikanSimpananRow): string | null => {
    const candidates = [
      "IDPengambilan",
      "idPengambilan",
      "ID_Pengambilan",
      "IdPengambilan",
      "id_pengambilan",
      "ID",
      "id",
    ];

    for (const k of candidates) {
      if (k in row && row[k] !== undefined && row[k] !== null) return String(row[k]);
    }

    return null;
  };

  const listPath = "/transaksi-simpanan/penarikan-simpanan-resign";
  const handleCreate = () => router.push(`${listPath}/create`);

  const columns = useMemo(
    () =>
      Object.keys(data[0] ?? {}).map((key) => ({
        key,
        header: key,
        accessor: (row: PenarikanSimpananRow) => formatCellValue(row[key]),
      })),
    [data],
  );

  const handleEdit = (row: PenarikanSimpananRow) => {
    const id = getIdFromRow(row);
    if (!id) {
      void showAlert("danger", "ID transaksi tidak ditemukan di baris ini.");
      return;
    }
    router.push(`${listPath}/edit/${encodeURIComponent(id)}`);
  };

  const handleClose = (row: PenarikanSimpananRow) => {
    const id = getIdFromRow(row);
    if (!id) {
      void showAlert("danger", "ID transaksi tidak ditemukan di baris ini.");
      return;
    }

    router.push(`${listPath}/close/${encodeURIComponent(id)}`);
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (dateFrom > dateTo) {
      setError("Tanggal dari tidak boleh lebih besar dari tanggal sampai.");
      return;
    }

    const payload: penarikanSimpananResignGet = {
      Status: status.trim(),
      DateFrom: new Date(`${dateFrom}T00:00:00`),
      DateTo: new Date(`${dateTo}T23:59:59.999`),
      NoKaryawan: noKaryawan.trim(),
    };

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await penarikanSimpananResignApi.getdataView(payload);

      if (!Array.isArray(response)) {
        throw new Error("Format data penarikan simpanan dari server tidak valid.");
      }

      const rows = response.map((row, index) => {
        if (!isRecord(row)) {
          throw new Error(`Data penarikan simpanan ke-${index + 1} tidak valid.`);
        }
        return row;
      });

      setData(rows);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat data penarikan simpanan.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Penarikan Simpanan Resign"
      subtitle="Cari data transaksi penarikan simpanan resign"
      displayName={displayName}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
    >
      <div className="mt-6 space-y-5">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <Card className="overflow-hidden rounded-2xl border shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-base ml-4 pt-2">Filter Penarikan Simpanan Resign</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
            >
              <label className="space-y-1.5 text-sm font-medium">
                Status
                <input
                  type="text"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  placeholder="Masukkan status"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Tanggal Dari
                <span className="relative block">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    required
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </span>
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Tanggal Sampai
                <span className="relative block">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    required
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </span>
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                No. Karyawan
                <input
                  type="text"
                  value={noKaryawan}
                  onChange={(event) => setNoKaryawan(event.target.value)}
                  placeholder="Masukkan nomor karyawan"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <div className="flex items-end">
                <Button type="submit" disabled={loading} className="w-full">
                  <Search data-icon="inline-start" />
                  {loading ? "Memuat..." : "Tampilkan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <DataTable
          title="Daftar Penarikan Simpanan Resign"
          subtitle={loading ? "Memuat data..." : undefined}
          data={data}
          columns={columns}
          searchPlaceholder={data.length ? "Cari data penarikan..." : undefined}
          pageSize={10}
          onCreate={handleCreate}
          createLabel="Buat Penarikan"
          onEdit={handleEdit}
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
                onClick={() => handleClose(row)}
                className="h-8 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Close
              </Button>
            </>
          )}
          emptyMessage={
            loading
              ? "Memuat data penarikan simpanan..."
              : hasSearched
                ? "Data penarikan simpanan tidak ditemukan."
                : "Isi filter di atas untuk menampilkan data penarikan simpanan."
          }
        />
      </div>
    </DashboardShell>
  );
}
