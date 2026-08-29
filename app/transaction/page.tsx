"use client";

import { useEffect } from "react";
import { ArrowUpRight, Banknote, CircleDollarSign, FileCheck2, HandCoins, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function TransactionPage() {
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
      title="Transaction"
      subtitle="Simpanan, pinjaman, jasa, dan SHU"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Proses transaksi"
      onAction={() => (window.location.hash = "#transaction")}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Simpanan" value="Rp 24,8 M" trend="+7,8%" icon={Banknote} />
        <Stat title="Pinjaman" value="Rp 14,2 M" trend="+5,4%" icon={CircleDollarSign} />
        <Stat title="Jasa" value="Rp 3,9 M" trend="+2,1%" icon={HandCoins} />
        <Stat title="SHU" value="Rp 1,2 M" trend="Menunggu" icon={Landmark} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Simpanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Input Simpanan Payroll",
              "Pengambilan Simpanan Sukarela",
              "Pengambilan Simpanan Resign",
              "Input Simpanan Tunai",
              "Log Simpanan",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Pinjaman & Kredit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Pembayaran Payroll",
              "Input Pinjaman/Kredit",
              "Pembayaran Tunai",
              "Approve Pengajuan",
              "Verifikasi Pengajuan",
              "Pelunasan",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="outline">Proses</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <QuickCard title="Jasa" desc="Posting tagihan air, listrik, sembako, dan waserda" icon={FileCheck2} />
        <QuickCard title="SHU" desc="Posting SHU dan pembagian keuntungan koperasi" icon={ArrowUpRight} />
        <QuickCard title="Log transaksi" desc="Histori setiap proses pembayaran dan pengajuan" icon={CircleDollarSign} />
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
