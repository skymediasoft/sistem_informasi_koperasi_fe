"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Eye, LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { TransaksiPayrollAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getMenuByRole,
  getSessionFromStorage,
  secondaryMenu,
} from "@/lib/auth/navigation";

type PayrollRow = Record<string, unknown>;

const postingPath = "/transaksi-simpanan/input-simpanan-payroll/posting";
const detailPath =
  "/transaksi-simpanan/input-simpanan-payroll/detail-posting";
const idKeys = ["IDTransaksi", "IdTransaksi", "idTransaksi", "id"];
const currencyFields = new Set([
  "simpananpokok",
  "simpananwajib",
  "simpanansukarela",
  "totalsimpananpokok",
  "totalsimpananwajib",
  "totalsimpanansukarela",
  "totalsimpanan",
  "total",
]);

function isRecord(value: unknown): value is PayrollRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRows(value: unknown): PayrollRow[] {
  if (Array.isArray(value) && value.every(isRecord)) return value;
  if (isRecord(value)) return [value];
  if (Array.isArray(value) && value.length === 0) return [];
  throw new Error("Format data payroll dari server tidak valid.");
}

function getTransactionId(row: PayrollRow) {
  const idKey = idKeys.find(
    (key) => row[key] !== undefined && row[key] !== null && row[key] !== "",
  );

  return idKey ? String(row[idKey]) : null;
}

function formatCellValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") return "-";
  if (currencyFields.has(key.toLowerCase())) {
    const amount = Number(value);
    if (Number.isFinite(amount)) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount);
    }
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function HistorySimpananPayrollPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!getSessionFromStorage()) {
      router.replace("/login");
      return;
    }

    let active = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await TransaksiPayrollAPI.history(year);
        const rows = getRows(response);
        if (active) setHistory(rows);
      } catch (requestError) {
        console.error("Gagal mengambil riwayat posting payroll:", requestError);
        if (active) {
          setHistory([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal mengambil riwayat posting payroll.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchHistory();

    return () => {
      active = false;
    };
  }, [router, year, reloadKey]);

  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";
  const years = useMemo(
    () => Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index),
    [],
  );

  const columns = useMemo(
    () =>
      Object.keys(history[0] ?? {}).map((key) => ({
        key,
        header: key,
        accessor: (row: PayrollRow) => formatCellValue(row[key], key),
      })),
    [history],
  );

  return (
    <DashboardShell
      title="Input Simpanan Payroll"
      subtitle="Riwayat posting simpanan payroll anggota"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={getMenuByRole(user?.role ?? "administrator", user?.menus)}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Posting"
      onAction={() => router.push(postingPath)}
    >
      <div className="mt-6 space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        <Card className="overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex flex-col gap-4 border-b bg-gradient-to-r from-primary/[0.04] via-background to-background px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  History Posting Simpanan Payroll
                </h2>
                <p className="text-sm text-muted-foreground">
                  Lihat hasil posting berdasarkan tahun.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Tahun
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="h-10 min-w-32 rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {years.map((optionYear) => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                className="h-10 gap-2"
                onClick={() => router.push(postingPath)}
              >
                <Send className="size-4" />
                Posting Simpanan
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 px-5 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Memuat riwayat posting...
            </div>
          )}

          <CardContent className="p-0">
            <DataTable
              title={`Riwayat posting ${year}`}
              data={history}
              columns={columns}
              searchPlaceholder="Cari riwayat posting..."
              emptyMessage={
                loading
                  ? "Memuat riwayat posting..."
                  : error
                    ? "Riwayat posting gagal dimuat."
                    : `Belum ada riwayat posting untuk tahun ${year}.`
              }
              pageSize={10}
              renderActions={(row) => {
                const id = getTransactionId(row);

                return (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!id}
                    title={id ? "Lihat detail posting" : "IDTransaksi tidak tersedia"}
                    onClick={() => {
                      if (id) {
                        router.push(
                          `${detailPath}/${encodeURIComponent(id)}`,
                        );
                      }
                    }}
                    className="h-8 gap-1.5"
                  >
                    <Eye className="size-3.5" />
                    View
                  </Button>
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
