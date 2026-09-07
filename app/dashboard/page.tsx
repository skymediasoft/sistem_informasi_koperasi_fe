"use client";

import {
  Activity,
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  FileText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

export default function DashboardPage() {
  const {
    logout,
    user,
    loading,
  } = useAuth();

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Memuat dashboard...
        </p>
      </div>
    );
  }

  /**
   * ============================================================
   * BELUM LOGIN
   * ============================================================
   *
   * AuthProvider yang menangani redirect/session.
   * Tidak perlu getSessionFromStorage() lagi di sini.
   */

  if (!user) {
    return null;
  }

  /**
   * ============================================================
   * USER DATA
   * ============================================================
   */

  const role = user.role;

  /**
   * IMPORTANT:
   *
   * Menu berasal dari response /me:
   *
   * user.menus
   *
   * children di dalam menu = secondary menu.
   */

  const menu = getMenuByRole(
    role,
    user.menus,
  );

  const displayName =
    user.name;

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <DashboardShell
      title="Dashboard operasional"
      subtitle="Ringkasan koperasi"
      displayName={displayName}
      groupName={
        user.groupName || "Koperasi"
      }
      menu={menu}
      onLogout={logout}
      actionLabel="Transaksi baru"
      onAction={() => {
        window.location.hash =
          "transaction";
      }}
    >
      {/* ======================================================
          STATISTICS
          ====================================================== */}

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

      {/* ======================================================
          HEALTH + ACTIVITY
          ====================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-2xl">
          <CardHeader className="flex-row px-4 py-2 items-center justify-between">
            <div>
              <CardTitle>
                Indikator kesehatan koperasi
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Performa keuangan tahun berjalan
              </p>
            </div>

            <Badge
              variant="secondary"
              className="gap-1"
            >
              <ShieldCheck className="size-3.5" />
              Sehat
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 px-4 sm:grid-cols-3">
              <Health
                label="Likuiditas"
                value="84"
                note="Sangat sehat"
              />

              <Health
                label="Kualitas aset"
                value="76"
                note="Sehat"
              />

              <Health
                label="Permodalan"
                value="92"
                note="Sangat sehat"
              />
            </div>

            <div className="mt-7 px-4 flex h-40 items-end gap-2 border-b border-border/70">
              {[
                42,
                52,
                46,
                64,
                58,
                70,
                68,
                78,
                74,
                86,
                80,
                94,
              ].map((height, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-t-md ${
                    index > 8
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-3 px-12 pb-3 flex justify-between text-xs text-muted-foreground">
              <span>Sep</span>
              <span>Nov</span>
              <span>Jan</span>
              <span>Mar</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl px-4 py-2">
          <CardHeader>
            <CardTitle>
              Aktivitas terbaru
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {[
              [
                "Simpanan wajib",
                "KPR-2024-018 · Budi Santoso",
                "Rp 500.000",
                "Berhasil",
              ],
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
            ].map(
              ([
                label,
                meta,
                amount,
                status,
              ]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl bg-secondary p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {label}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {meta}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {amount}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {status}
                    </p>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          QUICK MODULE
          ====================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <QuickModule
          icon={Building2}
          title="Master Data"
          description="Configuration, department, dan data anggota."
        />

        <QuickModule
          icon={ArrowUpRight}
          title="Transaction"
          description="Simpanan, pinjaman, jasa, dan SHU."
        />

        <QuickModule
          icon={FileText}
          title="Report"
          description="Laporan simpanan, payroll, piutang, serta formulir."
        />
      </div>
    </DashboardShell>
  );
}

/**
 * ============================================================
 * STAT
 * ============================================================
 */

function Stat({
  title,
  value,
  trend,
  icon: Icon,
  good = false,
}: {
  title: string;
  value: string;
  trend: string;
  icon: any;
  good?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight">
            {value}
          </p>

          <p
            className={`mt-2 text-xs ${
              good
                ? "text-emerald-600"
                : "text-muted-foreground"
            }`}
          >
            {trend}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ============================================================
 * HEALTH
 * ============================================================
 */

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
    <div className="rounded-2xl bg-secondary p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight">
          {value}
        </span>

        <span className="pb-1 text-xs text-muted-foreground">
          /100
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {note}
      </p>
    </div>
  );
}

/**
 * ============================================================
 * QUICK MODULE
 * ============================================================
 */

function QuickModule({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}