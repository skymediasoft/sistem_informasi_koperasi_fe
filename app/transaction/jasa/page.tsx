"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, ReceiptText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, getSessionFromStorage, secondaryMenu } from "@/lib/auth/navigation";

export default function JasaPage() {
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
      title="Jasa"
      subtitle="Tagihan jasa dan pembagian manfaat"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Posting jasa"
      onAction={() => undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={ReceiptText} label="Tagihan listrik" value="Rp 680.000" />
        <MetricCard icon={FileCheck2} label="Tagihan air" value="Rp 410.000" />
        <MetricCard icon={Sparkles} label="Jasa total" value="Rp 1.470.000" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Tagihan jasa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Listrik - 27 anggota",
              "Air - 19 anggota",
              "Sembako - 12 anggota",
              "Waserda - 8 anggota",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Posting terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {[
              "Tagihan listrik bulan ini telah diposting",
              "Jasa air sedang menunggu validasi",
              "Profit sembako berhasil dihitung",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-secondary p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
