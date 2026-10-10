"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showAlert } from "@/lib/alert";
import { penarikanSimpananResignApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const today = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

export default function ClosePenarikanSimpananPage() {
  const router = useRouter();
  const params = useParams<{ idPengambilan: string }>();
  const { logout, user } = useAuth();
  const [tanggalTransfer, setTanggalTransfer] = useState(today());
  const [noRef, setNoRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const listPath = "/transaksi-simpanan/penarikan-simpanan-resign";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const idPengambilan = Number(params.idPengambilan);
      const tanggal = new Date(`${tanggalTransfer}T00:00:00`);
      const noReferensi = noRef.trim();

      if (
        !Number.isSafeInteger(idPengambilan) ||
        idPengambilan < 1 ||
        !tanggalTransfer ||
        !Number.isFinite(tanggal.getTime()) ||
        !noReferensi
      ) {
        throw new Error("ID pengambilan, tanggal transfer, dan nomor referensi wajib diisi dengan benar.");
      }

      await penarikanSimpananResignApi.close({
        IDPengambilan: idPengambilan,
        TanggalTransfer: tanggal,
        NoRef: noReferensi,
      });
      await showAlert("success", "Transaksi penarikan simpanan resign berhasil ditutup.");
      router.push(listPath);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Gagal menutup transaksi penarikan simpanan resign.";
      setError(message);
      await showAlert("danger", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardShell
      title="Close Penarikan Simpanan Resign"
      subtitle={`Lengkapi data transfer untuk pengambilan ${params.idPengambilan}`}
      displayName={user.name || "Administrator Koperasi"}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push(listPath)}
    >
      <div className="mx-auto mt-6 max-w-3xl">
        <Card className="overflow-hidden rounded-2xl border shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-base">Data Penutupan Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {error ? (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <label className="grid gap-1.5 text-sm font-medium">
                ID Pengambilan
                <input
                  type="number"
                  value={params.idPengambilan}
                  readOnly
                  className="h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm font-normal"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Tanggal Transfer
                <input
                  required
                  type="date"
                  value={tanggalTransfer}
                  onChange={(event) => setTanggalTransfer(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                No. Referensi
                <input
                  required
                  type="text"
                  value={noRef}
                  onChange={(event) => setNoRef(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(listPath)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Memproses..." : "Close Transaksi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
  