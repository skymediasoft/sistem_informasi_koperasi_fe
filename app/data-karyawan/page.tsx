"use client";

import { useEffect } from "react";
import { Building2, Database, FileCog, ShieldCheck, Users, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function MasterDataPage() {
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
      title="Master Data"
      subtitle="Configuration & data master"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Tambah data"
      onAction={() => (window.location.hash = "#configuration")}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Departemen" value="18" trend="3 baru bulan ini" icon={Building2} />
        <Stat title="Anggota" value="9.240" trend="+124 anggota aktif" icon={Users} />
        <Stat title="Configuration" value="26" trend="4 setting utama" icon={FileCog} />
        <Stat title="Data valid" value="98,4%" trend="Aman" icon={ShieldCheck} good />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Setting Simpanan",
              "Setting Pinjaman/Kredit",
              "Setting Jenis Jasa",
              "Setting Formulir",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="secondary">Aktif</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Data Master</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Departemen",
              "Anggota Jasa",
              "Anggota",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                <span>{item}</span>
                <Badge variant="outline">Terdata</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <QuickCard title="Master data utama" desc="Data organisasi dan pengaturan operasional" icon={Database} />
        <QuickCard title="Pemeliharaan" desc="Validasi konfigurasi untuk seluruh menu transaksi" icon={WalletCards} />
        <QuickCard title="Keamanan" desc="Akses data anggota dan setting sistem terkontrol" icon={ShieldCheck} />
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
