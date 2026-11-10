"use client";

import { isAxiosError } from "axios";
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

const dateColumns = new Set(["Tanggal", "CreatedDate", "TanggalTransfer"]);
const currencyColumns = new Set([
  "Jumlah",
  "SimpananPokok",
  "SimpananWajib",
  "SimpananSukarela",
  "Total",
]);

const todayLocal = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const formatCellValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";

  if (dateColumns.has(key)) {
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      const dateValue = /^\d{4}-\d{2}-\d{2}/.test(value)
        ? `${value.slice(0, 10)}T00:00:00Z`
        : value;
      date = new Date(dateValue);
    } else if (typeof value === "number") {
      date = new Date(value);
    } else {
      return "-";
    }

    if (!Number.isFinite(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  if (currencyColumns.has(key)) {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? `Rp.${new Intl.NumberFormat("id-ID", {
          maximumFractionDigits: 0,
        }).format(amount)}`
      : "-";
  }

  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getRequestErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Gagal memuat data penarikan simpanan resign.";
  }

  const status = error.response?.status;
  const body: unknown = error.response?.data;
  console.error("Gagal memuat daftar penarikan simpanan resign:", {
    status,
    body,
  });

  let detail = "";
  if (typeof body === "string") {
    detail = body;
  } else if (isRecord(body)) {
    const message = body.message ?? body.error ?? body.p_Message;
    if (typeof message === "string") {
      detail = message;
    } else if (Array.isArray(message)) {
      detail = message.map(String).join(" ");
    } else {
      detail = JSON.stringify(body, (key, value: unknown) =>
        key === "stack" ? undefined : value,
      );
    }
  }

  const statusMessage = status ? `HTTP ${status}` : "Request gagal";
  return detail ? `${statusMessage}: ${detail}` : `${statusMessage}: ${error.message}`;
};

export default function PenarikanSimpananResignPage() {
  const { logout, user } = useAuth();
  const [status, setStatus] = useState("Open");
  const [dateFrom, setDateFrom] = useState(() => todayLocal());
  const [dateTo, setDateTo] = useState(() => todayLocal());
  const [noKaryawan, setNoKaryawan] = useState("%");
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
        accessor: (row: PenarikanSimpananRow) => formatCellValue(key, row[key]),
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

    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("Tanggal dari tidak boleh lebih besar dari tanggal sampai.");
      return;
    }

    const defaultDate = todayLocal();
    const effectiveDateFrom = dateFrom || defaultDate;
    const effectiveDateTo = dateTo || defaultDate;
    const payload: penarikanSimpananResignGet = {
      Status: status.trim(),
      DateFrom: new Date(`${effectiveDateFrom}T00:00:00`),
      DateTo: new Date(`${effectiveDateTo}T23:59:59.999`),
      NoKaryawan: noKaryawan.trim() || "%",
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
      setError(getRequestErrorMessage(requestError));
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
                <select
                  required
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="" disabled>
                  Semua Status
                </option>
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                Tanggal Dari
                <span className="relative block">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
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
