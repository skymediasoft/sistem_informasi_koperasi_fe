"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { CalendarDays, LoaderCircle, Send, Users, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DashboardShell } from "@/components/dashboard/app-shell";

import { useAuth } from "@/lib/auth/auth-context";
import {
  getMenuByRole,
  getSessionFromStorage,
  secondaryMenu,
} from "@/lib/auth/navigation";

import { TransaksiSimpananAPI, type TransaksiSimpanan } from "@/lib/api";
import { showAlert, showConfirm } from "@/lib/alert";

export default function LogSimpananPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [transaksiData, setTransaksiData] = useState<TransaksiSimpanan[]>([]);
  const [postingDate, setPostingDate] = useState(getLocalDateValue);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSession = getSessionFromStorage();

    if (!savedSession) {
      router.replace("/login");
      return;
    }

    void fetchTransaksi();
  }, [router]);

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      setError(null);

      const transaksi = await TransaksiSimpananAPI.findAll();
      setTransaksiData(transaksi ?? []);
    } catch (err) {
      console.error("Gagal mengambil data transaksi simpanan:", err);
      setError("Gagal mengambil data transaksi simpanan.");
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
        accessor: (row: TransaksiSimpanan) => String(row.NoAnggota),
      },
      {
        key: "NoEmployee",
        header: "No Employee",
        accessor: (row: TransaksiSimpanan) => row.NoEmployee,
      },
      {
        key: "Nama",
        header: "Nama",
        accessor: (row: TransaksiSimpanan) => row.Nama,
      },
      {
        key: "SimpananPokok",
        header: "Simpanan Pokok",
        accessor: (row: TransaksiSimpanan) => formatRupiah(row.SimpananPokok),
      },
      {
        key: "SimpananWajib",
        header: "Simpanan Wajib",
        accessor: (row: TransaksiSimpanan) => formatRupiah(row.SimpananWajib),
      },
      {
        key: "SimpananSukarela",
        header: "Simpanan Sukarela",
        accessor: (row: TransaksiSimpanan) => formatRupiah(row.SimpananSukarela),
      },
      {
        key: "Total",
        header: "Total",
        accessor: (row: TransaksiSimpanan) => formatRupiah(row.Total),
      },
    ],
    []
  );

  const totalSimpanan = transaksiData.reduce(
    (total, item) => total + Number(item.Total || 0),
    0
  );
  const totalSimpananPokok = transaksiData.reduce(
    (total, item) => total + Number(item.SimpananPokok || 0),
    0
  );
  const totalSimpananWajib = transaksiData.reduce(
    (total, item) => total + Number(item.SimpananWajib || 0),
    0
  );
  const totalSimpananSukarela = transaksiData.reduce(
    (total, item) => total + Number(item.SimpananSukarela || 0),
    0
  );
  const submitPosting = async () => {
    if (!postingDate || transaksiData.length === 0) return;

    const confirmation = await showConfirm(
      `Posting ${transaksiData.length.toLocaleString("id-ID")} anggota dengan total simpanan ${formatRupiah(totalSimpanan)} pada tanggal ${postingDate}?`,
      "Konfirmasi posting simpanan",
    );
    if (!confirmation.isConfirmed) return;

    try {
      setSubmitting(true);
      const transaksiId = `SP-${postingDate.replaceAll("-", "")}-${Date.now()}`;
      const result = await TransaksiSimpananAPI.postingSimpanan({
        IDTransaksi: transaksiId,
        Tanggal: postingDate,
        TotalAnggota: transaksiData.length,
        TotalSimpananPokok: totalSimpananPokok,
        TotalSimpananWajib: totalSimpananWajib,
        TotalSimpananSukarela: totalSimpananSukarela,
        TotalSimpanan: totalSimpanan,
      });

      const message = typeof result === "string" ? result : result?.message;
      if (message?.startsWith("Error ")) {
        throw new Error(message);
      }

      await showAlert(
        "success",
        message || "Posting simpanan berhasil.",
      );
      await fetchTransaksi();
    } catch (err) {
      console.error("Gagal melakukan posting simpanan:", err);
      await showAlert(
        "danger",
        getPostingErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Simpanan Anggota"
      subtitle="Data simpanan setiap anggota koperasi"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
    >
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          <h2 className="text-base font-semibold">Ringkasan transaksi simpanan</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            icon={Users}
            label="Total Anggota"
            value={loading ? "..." : transaksiData.length.toLocaleString("id-ID")}
          />
          <MetricCard
            icon={Wallet}
            label="Total Simpanan Pokok"
            value={loading ? "..." : formatRupiah(totalSimpananPokok)}
          />
          <MetricCard
            icon={Wallet}
            label="Total Simpanan Wajib"
            value={loading ? "..." : formatRupiah(totalSimpananWajib)}
          />
          <MetricCard
            icon={Wallet}
            label="Total Simpanan Sukarela"
            value={loading ? "..." : formatRupiah(totalSimpananSukarela)}
          />
          <MetricCard
            icon={Wallet}
            label="Total Simpanan"
            value={loading ? "..." : formatRupiah(totalSimpanan)}
          />
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex w-full flex-col gap-1.5 text-sm font-medium sm:max-w-xs">
            Tanggal Posting
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={postingDate}
                onChange={(event) => setPostingDate(event.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                disabled={submitting}
              />
            </span>
          </label>
          <Button
            onClick={() => void submitPosting()}
            disabled={loading || submitting || transaksiData.length === 0 || !postingDate}
            className="h-10 gap-2"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {submitting ? "Memposting..." : "Posting Simpanan"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchTransaksi()}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}
        <DataTable
          title="Transaksi simpanan anggota"
          subtitle=""
          data={transaksiData}
          columns={columns}
          searchPlaceholder="Cari transaksi.."
          emptyMessage={loading ? "Memuat data transaksi..." : "Belum ada data transaksi."}
          pageSize={10}
        />
      </div>
    </DashboardShell>
  );
}

function formatRupiah(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `Rp ${Number.isFinite(amount) ? amount.toLocaleString("id-ID") : "0"}`;
}

function getLocalDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function getPostingErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseBody = error.response?.data;
    console.error("Respons error posting simpanan:", {
      status: error.response?.status,
      body: responseBody,
    });

    if (typeof responseBody === "string" && responseBody.trim()) {
      return responseBody;
    }

    if (responseBody && typeof responseBody === "object") {
      const body = responseBody as {
        message?: string | string[];
        p_Message?: string;
        error?: string;
      };
      const message = body.p_Message ?? body.message ?? body.error;

      if (Array.isArray(message)) return message.join(" ");
      if (message) return message;
    }
  }

  return error instanceof Error
    ? error.message
    : "Gagal melakukan posting simpanan.";
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

