"use client";

import { useEffect } from "react";
import { BarChart3, BriefcaseBusiness, FileBarChart2, ReceiptText, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function ReportPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  useEffect(() => {
    const savedSession = getSessionFromStorage();
    if (!savedSession) router.replace("/login");
  }, [router]);

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);
  const displayName = user?.name || "Administrator Koperasi";
  const initials = user?.name ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <DashboardShell
      title="Report"
      subtitle="Laporan simpanan, pinjaman, payroll, dan SHU"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Export laporan"
      onAction={() => (window.location.hash = "#laporan")}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Laporan aktif" value="42" trend="Terbaru hari ini" icon={BarChart3} />
        <Stat title="Pinjaman" value="Rp 14,2 M" trend="Data detail" icon={BriefcaseBusiness} />
        <Stat title="Profit" value="Rp 2,4 M" trend="Kinerja bulan ini" icon={ReceiptText} />
        <Stat title="Validasi" value="96%" trend="Sudah dicek" icon={ShieldCheck} good />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Simpanan & Anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Laporan Simpanan",
              "Summary Simpanan Anggota",
              "Mutasi Simpanan Anggota",
              "Laporan Anggota",
              "Laporan Data Anggota",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="secondary">Draft</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Pinjaman & SHU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Laporan Pinjaman/Kredit",
              "Pembayaran Detail",
              "Profit Lunas",
              "Profit Berjalan",
              "Laporan SHU",
              "Pembagian SHU",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="outline">Ready</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <QuickCard title="Payroll" desc="Tagihan dan potongan payroll per bulan" icon={FileBarChart2} />
        <QuickCard title="Jasa" desc="Monitoring pembayaran listrik, air, dan telepon" icon={BarChart3} />
        <QuickCard title="Kredit Waserda" desc="Data tagihan dan profit pada kredit waserda" icon={ReceiptText} />
      </div>
    </DashboardShell>
  );
}

function Stat({ title, value, trend, icon: Icon, good = false }: { title: string; value: string; trend: string; icon: any; good?: boolean }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          <p className={`mt-2 text-xs ${good ? "text-emerald-600" : "text-muted-foreground"}`}>{trend}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
