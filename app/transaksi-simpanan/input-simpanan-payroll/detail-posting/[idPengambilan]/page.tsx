"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";

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

type PayrollDetailRow = Record<string, unknown>;

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

function isRecord(value: unknown): value is PayrollDetailRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRows(value: unknown): PayrollDetailRow[] {
  if (Array.isArray(value) && value.every(isRecord)) return value;
  if (Array.isArray(value) && value.length === 0) return [];
  if (isRecord(value)) return [value];
  throw new Error("Format detail payroll dari server tidak valid.");
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

export default function DetailPostingPayrollPage() {
  const router = useRouter();
  const params = useParams<{ idPengambilan: string }>();
  const { logout, user } = useAuth();
  const transactionId = params.idPengambilan;
  const [detail, setDetail] = useState<PayrollDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TransaksiPayrollAPI.viewDetail(transactionId);
      setDetail(getRows(response));
    } catch (requestError) {
      console.error("Gagal mengambil detail posting payroll:", requestError);
      setDetail([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal mengambil detail posting payroll.",
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!getSessionFromStorage()) {
      router.replace("/login");
      return;
    }

    void fetchDetail();
  }, [fetchDetail, reloadKey, router]);

  const columns = useMemo(
    () =>
      Object.keys(detail[0] ?? {}).map((key) => ({
        key,
        header: key,
        accessor: (row: PayrollDetailRow) => formatCellValue(row[key], key),
      })),
    [detail],
  );

  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <DashboardShell
      title="Detail Posting Payroll"
      subtitle={`Detail transaksi ${transactionId}`}
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={getMenuByRole(user?.role ?? "administrator", user?.menus)}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali ke History"
      onAction={() =>
        router.push("/transaksi-simpanan/input-simpanan-payroll")
      }
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

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Memuat detail posting...
          </div>
        )}

        <Card className="overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-4">
            <div>
              <h2 className="font-semibold">Hasil Posting</h2>
              <p className="text-sm text-muted-foreground">
                ID Transaksi: {transactionId}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                router.push("/transaksi-simpanan/input-simpanan-payroll")
              }
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          </div>
          <CardContent className="p-0">
            <DataTable
              title=""
              data={detail}
              columns={columns}
              emptyMessage={
                loading
                  ? "Memuat detail posting..."
                  : error
                    ? "Detail posting gagal dimuat."
                    : "Detail posting tidak ditemukan."
              }
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
