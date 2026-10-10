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
import {
  InputSimpananTunaiAPI,
  TransaksiSimpananAPI,
  type TransaksiSimpanan,
} from "@/lib/api";
import { showAlert, showConfirm } from "@/lib/alert";

type InputSimpananTunai = TransaksiSimpanan & {
  Tanggal?: string;
};

export default function ListSimpananTunaiPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [inputSimpananTunaiData, setInputSimpananTunaiData] = useState<InputSimpananTunai[]>([]);
  const [postingDate, setPostingDate] = useState(getLocalDateValue);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //buat filtering
  const [jenisSimpanan, setJenisSimpanan] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nama, setNama] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  useEffect(() => {
    if (!getSessionFromStorage()) {
      router.replace("/login");
      return;
    }

    void fetchDataSimpananTunai();
  }, [router]);

  const fetchDataSimpananTunai = async () => {
    try {
      setLoading(true);
      setError(null);
      const inputSimpananTunai = await InputSimpananTunaiAPI.findAll();
      setInputSimpananTunaiData(
        (inputSimpananTunai ?? []) as unknown as InputSimpananTunai[],
      );
    } catch (err) {
      console.error("Gagal mengambil data transaksi simpanan:", err);
      setError("Gagal mengambil data simpanan tunai.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransaksiData = useMemo(() => {
  if (!searchTriggered) return inputSimpananTunaiData;

  return inputSimpananTunaiData.filter((item) => {
    const itemDate = String(item.Tanggal ?? "").slice(0, 10);
    const itemNama = String(item.Nama ?? "").toLowerCase();

    // Filter jenis simpanan
    if (jenisSimpanan) {
      const jenisValue = Number(
        jenisSimpanan === "pokok"
          ? item.SimpananPokok
          : jenisSimpanan === "wajib"
            ? item.SimpananWajib
            : item.SimpananSukarela,
      );

      if (!jenisValue) return false;
    }

    // Filter tanggal dari
    if (dateFrom && itemDate < dateFrom) {
      return false;
    }

    // Filter tanggal sampai
    if (dateTo && itemDate > dateTo) {
      return false;
    }

    // Filter nama
    if (nama && !itemNama.includes(nama.toLowerCase())) {
      return false;
    }

    return true;
  });
}, [
  inputSimpananTunaiData,
  jenisSimpanan,
  dateFrom,
  dateTo,
  nama,
  searchTriggered,
]);

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
      { key: "Tanggal", header: "Tanggal" },
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
        accessor: (row: TransaksiSimpanan) =>
          formatRupiah(row.SimpananSukarela),
      },
      {
        key: "Total",
        header: "Total",
        accessor: (row: TransaksiSimpanan) => formatRupiah(row.Total),
      },
    ],
    [],
  );

  const handlePosting = async () => {
    const confirmation = await showConfirm(
      `Lakukan posting simpanan untuk tanggal ${postingDate}?`,
      "Konfirmasi posting simpanan",
    );
    if (!confirmation.isConfirmed) return;

    try {
      setSubmitting(true);
      setError(null);
      const result = await TransaksiSimpananAPI.postingSimpanan({
        Tanggal: postingDate,
      });
      const message = typeof result === "string" ? result : result?.message;

      if (message?.startsWith("Error ")) throw new Error(message);

      await showAlert("success", message || "Posting simpanan berhasil.");
      await fetchDataSimpananTunai();
    } catch (err) {
      console.error("Gagal melakukan posting simpanan:", err);
      await showAlert("danger", getPostingErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

return (
  <DashboardShell
    title="Input Simpanan Tunai"
    subtitle="Data transaksi simpanan tunai"
    displayName={displayName}
    groupName={user?.groupName || "Koperasi"}
    initials={initials}
    menu={menu}
    secondaryMenu={secondaryMenu}
    onLogout={logout}
  >
    <div className="mt-6 space-y-5">

      {/* ERROR ALERT */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-red-100">
                <span className="font-bold text-red-600">!</span>
              </div>

              <span>{error}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchDataSimpananTunai()}
              className="rounded-xl border-red-200 bg-white hover:bg-red-50"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      )}

      {/* FILTER CARD */}
      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        <div className="border-b bg-gradient-to-r from-primary/[0.04] via-background to-background px-5 py-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-tight">
              Filter Transaksi
            </h3>

            <p className="text-sm text-muted-foreground">
              Gunakan filter di bawah untuk mencari transaksi simpanan.
            </p>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

            {/* JENIS SIMPANAN */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Jenis Simpanan
              </label>

              <select
                value={jenisSimpanan}
                onChange={(e) => setJenisSimpanan(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Semua Jenis</option>
                <option value="pokok">Simpanan Pokok</option>
                <option value="wajib">Simpanan Wajib</option>
                <option value="sukarela">Simpanan Sukarela</option>
              </select>
            </div>

            {/* FROM */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Tanggal Dari
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* TO */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Tanggal Sampai
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* NAMA */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Nama
              </label>

              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  placeholder="Cari nama..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchTriggered(true);
                    }
                  }}
                  className="h-8 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* SEARCH */}
            <div className="flex items-end">
              <Button
                type="button"
                className="h-8 w-full rounded-lg shadow-sm transition-all hover:shadow-md"
                onClick={() => setSearchTriggered(true)}
              >
                <Send className="mr-2 size-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE CARD */}
      <Card className="overflow-hidden rounded-2xl border shadow-sm">

        {/* TABLE HEADER */}
        <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-primary/[0.04] via-background to-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="size-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Transaksi Simpanan Tunai
                </h3>

                <p className="text-sm text-muted-foreground">
                  Daftar transaksi simpanan tunai anggota
                </p>
              </div>
            </div>
          </div>

          {/* LOADING INDICATOR */}
          {loading && (
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" />
              Memuat data...
            </div>
          )}
        </div>

        {/* TABLE */}
        <CardContent className="p-0">
          <DataTable
            title=""
            data={filteredTransaksiData}
            columns={columns}
            onCreate={() =>
              router.push(
                "/transaksi-simpanan/input-simpanan-tunai/create"
              )
            }
            emptyMessage={
              loading
                ? "Memuat data transaksi..."
                : "Belum ada data transaksi."
            }
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  </DashboardShell>
);



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
}