"use client";

import { useState } from "react";
import {
  ArrowRight,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "anggota">("admin");
  const destination = role === "admin" ? "/admin" : "/anggota";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-semibold"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark />
          </span>
          kopera<span className="text-accent-foreground">.</span>
        </a>
        <Card className="rounded-3xl border-border/70 shadow-xl shadow-primary/5">
          <CardHeader className="gap-3 p-7 pb-4">
            <Badge variant="secondary" className="w-fit rounded-full">
              Portal koperasi
            </Badge>
            <CardTitle className="text-3xl tracking-tight">
              Selamat datang kembali
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Masuk untuk mengelola aktivitas koperasi atau melihat akun
              anggota.
            </p>
          </CardHeader>
          <CardContent className="p-7 pt-3">
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
              <button
                onClick={() => setRole("admin")}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${role === "admin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Admin
              </button>
              <button
                onClick={() => setRole("anggota")}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${role === "anggota" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                Anggota
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Email atau ID anggota
                <Input
                  placeholder={
                    role === "admin" ? "admin@kopera.id" : "KPR-2024-001"
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Kata sandi
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <LockKeyhole className="absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </label>
              <Button
                size="lg"
                className="mt-2 w-full"
                onClick={() => {
                  window.location.href = destination;
                }}
              >
                Masuk ke {role === "admin" ? "dashboard admin" : "portal anggota"}
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-accent-foreground" />{" "}
              Prototype demo · data belum tersimpan
            </div>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akses?{" "}
          <a
            href="mailto:halo@kopera.id"
            className="font-semibold text-accent-foreground"
          >
            Hubungi pengurus
          </a>
        </p>
      </div>
    </main>
  );
}
