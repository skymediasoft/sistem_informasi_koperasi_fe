"use client";

import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const savings = [
  ["Simpanan wajib", 2054725000],
  ["Simpanan sukarela", 2471760000],
  ["Simpanan pokok", 45735000],
];
const profit = [
  ["Kredit kendaraan", 1003006654, 161428938],
  ["Kredit", 1118373773, 214311269],
  ["Kredit sembako", 111777000, 11177700],
];
export default function ReportsPage() {
  const { logout, user } = useAuth();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  return (
    <DashboardShell
      title="Pusat laporan"
      subtitle="Laporan & akuntansi"
      displayName={user?.name || "Administrator Koperasi"}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
    >
      <div className="mb-6 px-4 py-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Analisis performa koperasi berdasarkan periode yang dipilih.
          </p>
        </div>
        <Button variant="outline">
          <Download data-icon="inline-start" /> Export laporan
        </Button>
      </div>
      <Card className="px-4 py-2">
        <CardHeader>
          <CardTitle className="text-base">Filter laporan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-2 text-sm font-medium">
            Tanggal mulai
            <input
              type="date"
              defaultValue="2026-01-01"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            />
          </label>
          <label className="grid flex-1 gap-2 text-sm font-medium">
            Tanggal akhir
            <input
              type="date"
              defaultValue="2026-08-29"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            />
          </label>
          <Button>
            <Filter data-icon="inline-start" /> Tampilkan
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="px-4 py-2">
          <CardHeader>
            <CardTitle className="text-base">
              Laporan simpanan anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <tbody>
                  {savings.map(([name, value]) => (
                    <tr key={name as string} className="border-b">
                      <td className="py-3">{name}</td>
                      <td className="py-3 text-right font-medium">
                        {formatRupiah(value as number)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="pt-4">Total simpanan</td>
                    <td className="pt-4 text-right">Rp 4.572.220.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="px-3 py-2">
          <CardHeader>
            <CardTitle className="text-base">Ringkasan profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3">Jenis transaksi</th>
                    <th className="text-right">Tagihan</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {profit.map(([name, bill, value]) => (
                    <tr key={name as string} className="border-b">
                      <td className="py-3">{name}</td>
                      <td className="text-right">
                        {formatRupiah(bill as number)}
                      </td>
                      <td className="text-right font-medium">
                        {formatRupiah(value as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
