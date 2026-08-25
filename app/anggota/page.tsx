"use client";

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CreditCard,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
export default function AnggotaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const menuButton = document.querySelector("header button");
    const sidebar = document.querySelector("aside");
    if (!menuButton || !sidebar) return;
    const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);
    menuButton.addEventListener("click", toggleSidebar);
    return () => menuButton.removeEventListener("click", toggleSidebar);
  }, []);

  useEffect(() => {
    document.querySelector("aside")?.classList.toggle("hidden", !sidebarOpen);
  }, [sidebarOpen]);

  return (
    <main className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-card px-5 py-6 lg:block">
        <a href="/" className="flex items-center gap-2 px-3 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark className="size-5" />
          </span>
          kopera<span className="text-accent-foreground">.</span>
        </a>
        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
            BS
          </div>
          <div>
            <p className="text-sm font-semibold">Budi Santoso</p>
            <p className="text-xs text-muted-foreground">KPR-2024-018</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          <a
            className="flex items-center gap-3 rounded-xl bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"
            href="#"
          >
            <LayoutDashboard className="size-4" />
            Ringkasan
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
            href="#profil"
          >
            <UserRound className="size-4" />
            Detail anggota
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
            href="#login"
          >
            <ShieldCheck className="size-4" />
            Management login
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground"
            href="#mutasi"
          >
            <FileText className="size-4" />
            Mutasi buku anggota
          </a>
        </nav>
        <a
          href="/login"
          className="absolute bottom-6 left-8 flex items-center gap-3 text-sm text-muted-foreground"
        >
          <LogOut className="size-4" />
          Keluar
        </a>
      </aside>
      <div className="lg:pl-72">
        <header className="flex items-center justify-between border-b bg-card px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">Portal anggota</p>
              <h1 className="text-xl font-semibold">Halo, Budi</h1>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Bell />
          </Button>
        </header>
        <section className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/10 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-foreground/70">
                  Total simpanan
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  Rp 8.750.000
                </p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  Update terakhir hari ini, 09:42
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <WalletCards />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => (window.location.hash = "mutasi")}
              >
                Lihat mutasi
              </Button>
              <Button
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => (window.location.hash = "profil")}
              >
                Kartu anggota digital
              </Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Mini
              title="Simpanan wajib"
              value="Rp 3.600.000"
              icon={CreditCard}
            />
            <Mini
              title="Simpanan sukarela"
              value="Rp 4.150.000"
              icon={WalletCards}
            />
            <Mini
              title="Pinjaman berjalan"
              value="Rp 12.000.000"
              icon={ArrowUpRight}
            />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card id="mutasi" className="rounded-2xl">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Mutasi buku anggota</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ringkasan transaksi terbaru
                  </p>
                </div>
                <Button variant="ghost">
                  Unduh <ArrowDownLeft data-icon="inline-end" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {[
                    [
                      "Setoran simpanan wajib",
                      "25 Agu 2026",
                      "+ Rp 300.000",
                      true,
                    ],
                    ["Angsuran pinjaman", "20 Agu 2026", "- Rp 850.000", false],
                    [
                      "Setoran simpanan sukarela",
                      "12 Agu 2026",
                      "+ Rp 500.000",
                      true,
                    ],
                    ["Bagi hasil anggota", "31 Jul 2026", "+ Rp 125.000", true],
                  ].map(([title, date, amount, positive]) => (
                    <div
                      key={title as string}
                      className="flex items-center gap-3"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                        <ArrowDownLeft
                          className={`size-4 ${positive ? "text-accent-foreground" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${positive ? "text-accent-foreground" : ""}`}
                      >
                        {amount}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card id="profil" className="rounded-2xl">
              <CardHeader>
                <CardTitle>Detail anggota</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informasi profil terdaftar
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 border-b pb-5">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-xl font-bold text-accent-foreground">
                    BS
                  </div>
                  <div>
                    <p className="font-semibold">Budi Santoso</p>
                    <p className="text-sm text-muted-foreground">
                      Anggota sejak Januari 2024
                    </p>
                    <Badge variant="secondary" className="mt-2 gap-1">
                      <ShieldCheck className="size-3" />
                      Aktif
                    </Badge>
                  </div>
                </div>
                <dl className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Nomor anggota</dt>
                    <dd className="font-medium">KPR-2024-018</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">No. telepon</dt>
                    <dd className="font-medium">0812 3456 7890</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">budi@email.id</dd>
                  </div>
                </dl>
                <Button id="login" variant="outline" className="mt-6 w-full">
                  Kelola akses login <Settings data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
function Mini({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof CreditCard;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <Icon className="size-5 text-accent-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
