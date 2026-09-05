"use client";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const stats = [
  {
    label: "Total simpanan",
    value: "Rp 4,57 M",
    change: "+12,4%",
    icon: WalletCards,
  },
  {
    label: "Portfolio pinjaman",
    value: "Rp 2,12 M",
    change: "+8,2%",
    icon: CircleDollarSign,
  },
  { label: "NPL ratio", value: "2,1%", change: "Sehat", icon: ShieldCheck },
  {
    label: "Anggota aktif",
    value: "1.247",
    change: "+8 minggu ini",
    icon: Users,
  },
];
const activities = [
  {
    title: "Simpanan wajib",
    member: "Budi Santoso · KPR-2024-018",
    amount: 500000,
    status: "Berhasil",
  },
  {
    title: "Pengajuan pinjaman",
    member: "Siti Aminah · KPR-2024-042",
    amount: 12000000,
    status: "Menunggu",
  },
  {
    title: "Penarikan simpanan",
    member: "Andi Wijaya · KPR-2024-009",
    amount: 2500000,
    status: "Berhasil",
  },
];

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  return (
    <DashboardShell
      title="Selamat datang, Administrator"
      subtitle="Ringkasan operasional"
      displayName={user?.name || "Administrator Koperasi"}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Pantau kesehatan koperasi dan aktivitas anggota hari ini.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-2">
          <span className="size-2 rounded-full bg-primary" />
          Data diperbarui 5 menit lalu
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {value}
                </p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {change}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="px-4 py-2">
          <CardHeader>
            <CardTitle className="text-base">
              Indikator kesehatan koperasi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            {[
              ["Portfolio pinjaman", 85, "Kualitas bagus"],
              ["Likuiditas", 72, "Cukup baik"],
              ["CAR equivalent", 68, "Memadai"],
            ].map(([label, value, note]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <strong>{value}%</strong>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="px-4 py-2">
          <CardHeader>
            <CardTitle className="text-base">Eksposur NPL per unit</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">Rp 44,5 jt</p>
              <p className="mt-1 text-sm text-muted-foreground">
                2,1% dari total portfolio
              </p>
            </div>
            <div className="flex size-20 items-center justify-center rounded-full border-10 border-primary/20 border-t-primary">
              <span className="text-sm font-semibold">2.1%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 px-4 py-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas terbaru</CardTitle>
          <a
            href="/laporan/transaksi"
            className="text-sm font-medium text-primary"
          >
            Lihat semua <ArrowUpRight className="ml-1 inline size-4" />
          </a>
        </CardHeader>
        <CardContent className="grid gap-1">
          {activities.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 border-b py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.member}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-sm font-semibold">
                  {formatRupiah(item.amount)}
                </p>
                <Badge
                  variant={item.status === "Berhasil" ? "default" : "secondary"}
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
