"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  HandCoins,
  HeartHandshake,
  Landmark,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const benefits = [
  {
    icon: WalletCards,
    title: "Simpan, tumbuh, berdampak",
    description:
      "Simpanan anggota dikelola transparan untuk menguatkan ekonomi bersama.",
  },
  {
    icon: HandCoins,
    title: "Pinjaman lebih manusiawi",
    description:
      "Ajukan kebutuhan produktif dengan proses yang sederhana dan bunga bersahabat.",
  },
  {
    icon: HeartHandshake,
    title: "Keputusan bersama",
    description:
      "Setiap anggota punya suara untuk menentukan arah koperasi kita.",
  },
];

export default function Page() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a
          href="#beranda"
          className="flex items-center gap-2.5"
          aria-label="Kopera beranda"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Landmark aria-hidden="true" className="size-5" />
          </span>
          <span className="font-sans text-lg font-bold tracking-tight">
            kopera<span className="text-accent-foreground">.</span>
          </span>
        </a>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a
            className="transition-colors hover:text-foreground"
            href="#tentang"
          >
            Tentang kami
          </a>
          <a
            className="transition-colors hover:text-foreground"
            href="#layanan"
          >
            Layanan
          </a>
          <a className="transition-colors hover:text-foreground" href="#cerita">
            Cerita anggota
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              window.location.href = "/login";
            }}
          >
             Masuk{" "}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Buka menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute inset-x-5 top-full z-20 flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-3 shadow-xl md:hidden sm:inset-x-8">
            <a
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              href="#tentang"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang kami
            </a>
            <a
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              href="#layanan"
              onClick={() => setMobileMenuOpen(false)}
            >
              Layanan
            </a>
            <a
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              href="#cerita"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cerita anggota
            </a>
          </div>
        )}
      </nav>

      <section
        id="beranda"
        className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28"
      >
        <div className="max-w-2xl">
          <Badge
            variant="secondary"
            className="mb-6 gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5" /> Ekonomi yang tumbuh bersama
          </Badge>
          <h1 className="text-balance font-sans text-5xl font-semibold leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl">
            Kita kuat, karena{" "}
            <span className="text-accent-foreground">bersama.</span>
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Kopera adalah rumah bagi simpanan, pinjaman, dan harapan yang
            dikelola dengan transparan untuk kesejahteraan setiap anggota.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => {
                window.location.hash = "daftar";
              }}
            >
              Mulai jadi anggota{" "}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                window.location.hash = "layanan";
              }}
            >
              Lihat layanan <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
          <div className="mt-9 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-accent text-xs font-semibold">
                AR
              </span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-semibold">
                DS
              </span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold">
                +9k
              </span>
            </div>
            <span>Dipercaya oleh 9.240+ anggota</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:mr-0">
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-accent/50 blur-2xl" />
          <Card className="overflow-hidden rounded-3xl border-border/70 bg-card shadow-2xl shadow-primary/10">
            <CardHeader className="border-b border-border/70 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Saldo simpanan bersama
                  </p>
                  <CardTitle className="mt-2 text-3xl tracking-tight">
                    Rp 2.480.000
                  </CardTitle>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <ShieldCheck className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-accent-foreground">
                <span className="rounded-full bg-accent px-2 py-1 font-medium">
                  +12,8%
                </span>
                <span className="text-muted-foreground">dari tahun lalu</span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex h-32 items-end gap-2.5 border-b border-border/70 pb-0">
                <div className="h-[32%] flex-1 rounded-t-md bg-muted" />
                <div className="h-[44%] flex-1 rounded-t-md bg-muted" />
                <div className="h-[38%] flex-1 rounded-t-md bg-muted" />
                <div className="h-[57%] flex-1 rounded-t-md bg-muted" />
                <div className="h-[67%] flex-1 rounded-t-md bg-accent" />
                <div className="h-[82%] flex-1 rounded-t-md bg-primary" />
                <div className="h-full flex-1 rounded-t-md bg-primary" />
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Apr</span>
                <span>Jul</span>
                <span>Okt</span>
                <span>Des 2026</span>
              </div>
            </CardContent>
          </Card>
          <div className="absolute -bottom-7 -left-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xl sm:-left-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Check className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Setoran berhasil</p>
              <p className="text-sm font-semibold">+ Rp 250.000</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="tentang"
        className="border-y border-border/70 bg-secondary/50"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-8 lg:px-10">
          <div>
            <p className="text-3xl font-semibold tracking-tight">9.240+</p>
            <p className="mt-1 text-sm text-muted-foreground">Anggota aktif</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">Rp 18,4 M</p>
            <p className="mt-1 text-sm text-muted-foreground">Aset dikelola</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">12 tahun</p>
            <p className="mt-1 text-sm text-muted-foreground">Tumbuh bersama</p>
          </div>
        </div>
      </section>

      <section
        id="layanan"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            Satu ekosistem
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Lebih dari sekadar tempat menabung.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Kami hadir supaya setiap rupiah yang kamu titipkan punya arti untuk
            masa depanmu dan komunitas.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="rounded-2xl border-border/70 shadow-none transition-shadow hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                  <a
                    href="#daftar"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground"
                  >
                    Pelajari lebih lanjut <ArrowRight className="size-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="daftar"
        className="mx-5 mb-12 overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:mx-8 sm:px-12 lg:mx-auto lg:max-w-7xl lg:px-16 lg:py-16"
      >
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-primary-foreground/70">
              Mulai langkahmu hari ini
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Bergabung, bertumbuh, dan berdampak.
            </h2>
            <p className="mt-4 leading-7 text-primary-foreground/70">
              Karena masa depan yang baik dibangun oleh banyak tangan.
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              window.location.href = "mailto:halo@kopera.id";
            }}
          >
            Daftar sekarang{" "}
          </Button>
        </div>
      </section>

      <footer
        id="cerita"
        className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"
      >
        <p>© 2026 kopera. Koperasi untuk semua.</p>
        <div className="flex gap-5">
          <a href="#tentang" className="hover:text-foreground">
            Tentang
          </a>
          <a href="#layanan" className="hover:text-foreground">
            Layanan
          </a>
          <a href="mailto:halo@kopera.id" className="hover:text-foreground">
            Kontak
          </a>
        </div>
      </footer>
    </main>
  );
}
