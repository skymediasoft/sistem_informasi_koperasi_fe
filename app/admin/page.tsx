"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Landmark,
  LayoutDashboard,
  Map,
  Menu,
  MoreHorizontal,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const menu = [
  { icon: LayoutDashboard, label: "Dashboard operasional", active: true },
  { icon: Users, label: "Manajemen anggota" },
  { icon: CircleDollarSign, label: "Manajemen transaksi" },
  { icon: Check, label: "Approval & cetak" },
  { icon: BookOpen, label: "Laporan & akuntansi" },
  { icon: ArrowDownLeft, label: "Non-simpan pinjam" },
];

const activities = [
  ["Simpanan wajib", "KPR-2024-018 · Budi Santoso", "Rp 500.000", "Berhasil"],
  [
    "Pengajuan pinjaman",
    "KPR-2024-042 · Siti Aminah",
    "Rp 12.000.000",
    "Menunggu",
  ],
  [
    "Penarikan simpanan",
    "KPR-2024-009 · Andi Wijaya",
    "Rp 2.500.000",
    "Berhasil",
  ],
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-card px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 px-3 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </span>
            kopera<span className="text-accent-foreground">.</span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold">Admin Koperasi</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {menu.map(({ icon: Icon, label, active }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 flex flex-col gap-1">
          <a
            href="#"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
          >
            <Settings className="size-4" />
            Pengaturan
          </a>
          <a
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
          >
            <ArrowDownLeft className="size-4" />
            Keluar
          </a>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="lg:pl-72">
        <header className="flex items-center justify-between border-b bg-card px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">
                Senin, 25 Agustus 2026
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Dashboard operasional
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <Bell />
            </Button>
            <Button onClick={() => (window.location.hash = "transaksi")}>
              Transaksi baru
            </Button>
          </div>
        </header>
        <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              title="Total aset"
              value="Rp 18,4 M"
              trend="+8,2%"
              icon={WalletCards}
            />
            <Stat
              title="Anggota aktif"
              value="9.240"
              trend="+124 bulan ini"
              icon={Users}
            />
            <Stat
              title="Portfolio pinjaman"
              value="Rp 11,8 M"
              trend="+5,6%"
              icon={CircleDollarSign}
            />
            <Stat
              title="NPL koperasi"
              value="2,14%"
              trend="-0,32% dari bulan lalu"
              icon={Activity}
              good
            />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Indikator kesehatan koperasi</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Performa keuangan tahun berjalan
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="size-3.5" />
                  Sehat
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <Health label="Likuiditas" value="84" note="Sangat sehat" />
                  <Health label="Kualitas aset" value="76" note="Sehat" />
                  <Health label="Permodalan" value="92" note="Sangat sehat" />
                </div>
                <div className="mt-7 flex h-40 items-end gap-2 border-b border-border/70">
                  {[42, 52, 46, 64, 58, 70, 68, 78, 74, 86, 80, 94].map(
                    (h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-md ${i > 8 ? "bg-primary" : "bg-secondary"}`}
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Sep</span>
                  <span>Nov</span>
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>Mei</span>
                  <span>Jul</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Exposure NPL per unit</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top 5 unit dengan risiko tertinggi
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {[
                  ["Unit Jakarta Selatan", "3,8%", 76],
                  ["Unit Bandung", "2,9%", 58],
                  ["Unit Surabaya", "2,4%", 48],
                  ["Unit Yogyakarta", "1,8%", 36],
                  ["Unit Semarang", "1,2%", 24],
                ].map(([name, value, width]) => (
                  <div key={name as string}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{name}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-accent-foreground"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="mt-1 w-full">
                  Lihat peta simpanan <Map data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          </div>
          <Card id="transaksi" className="mt-6 rounded-2xl">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Aktivitas terbaru</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transaksi dan pengajuan yang perlu diperhatikan
                </p>
              </div>
              <Button variant="ghost">
                Lihat semua <ChevronRight data-icon="inline-end" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-150 text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Jenis aktivitas</th>
                      <th className="pb-3 font-medium">Anggota</th>
                      <th className="pb-3 font-medium">Nominal</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((row) => (
                      <tr key={row[1]} className="border-b last:border-0">
                        <td className="py-4 font-medium">{row[0]}</td>
                        <td className="py-4 text-muted-foreground">{row[1]}</td>
                        <td className="py-4 font-semibold">{row[2]}</td>
                        <td className="py-4">
                          <Badge
                            variant={
                              row[3] === "Berhasil" ? "secondary" : "outline"
                            }
                          >
                            {row[3]}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Quick icon={FileText} title="Laporan buku besar" />
            <Quick icon={BarChart3} title="Laba rugi & neraca" />
            <Quick icon={ArrowUpRight} title="Approval menunggu" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
  trend,
  icon: Icon,
  good,
}: {
  title: string;
  value: string;
  trend: string;
  icon: typeof Activity;
  good?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className="size-5 text-accent-foreground" />
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
        <p
          className={`mt-1 text-xs ${good ? "text-accent-foreground" : "text-muted-foreground"}`}
        >
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

function Health({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="text-2xl font-semibold">
          {value}
          <small className="text-sm text-muted-foreground">/100</small>
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-accent-foreground">{note}</p>
    </div>
  );
}

function Quick({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <Card className="rounded-2xl transition hover:shadow-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
          <Icon className="size-4 text-accent-foreground" />
        </div>
        <span className="text-sm font-medium">{title}</span>
        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
