"use client";

import { Suspense, useEffect, useState } from "react";
import { Landmark, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Memuat halaman login...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, changePassword } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldChangePassword = searchParams.get("change-password") === "1" || Boolean(user?.mustChangePassword);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      await login(identifier, password, ["administrator", "admin-koperasi", "pengurus-koperasi"]);
    } catch (err: any) {
      setError(err.message || "Login gagal, periksa kembali identitas dan password Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (newPassword.trim().length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(newPassword);
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <a href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark />
          </span>
          kopera<span className="text-accent-foreground">.</span>
        </a>

        <Card className="rounded-3xl border-border/70 shadow-xl shadow-primary/5">
          <CardHeader className="gap-3 p-7 pb-4">
            <Badge variant="secondary" className="w-fit rounded-full">
              {shouldChangePassword ? "Keamanan akun admin" : "Portal admin koperasi"}
            </Badge>
            <CardTitle className="text-3xl tracking-tight">
              {shouldChangePassword ? "Ubah password awal" : "Selamat datang kembali"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {shouldChangePassword
                ? "Password Anda masih menggunakan password default. Silakan buat password baru untuk keamanan akun."
                : "Masuk untuk mengelola data, transaksi, dan laporan koperasi."}
            </p>
          </CardHeader>

          <CardContent className="p-7 pt-3">
            {shouldChangePassword ? (
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Password baru
                  <div className="relative">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="pr-10"
                    />
                    <LockKeyhole className="absolute right-3 top-3 size-4 text-muted-foreground" />
                  </div>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Konfirmasi password baru
                  <div className="relative">
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Ulangi password baru"
                      className="pr-10"
                    />
                    <LockKeyhole className="absolute right-3 top-3 size-4 text-muted-foreground" />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan password baru"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Email atau ID pengguna
                  <Input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="administrator@kopera.id / admin@kopera.id / pengurus@kopera.id"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Kata sandi
                  <div className="relative">
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <LockKeyhole className="absolute right-3 top-3 size-4 text-muted-foreground" />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Memproses..." : "Masuk ke sistem"}
                </Button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-accent-foreground" />
              Gunakan username dan password yang valid dari sistem koperasi.
            </div>
          </CardContent>
        </Card>

        {!shouldChangePassword ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akses?{" "}
            <a href="mailto:halo@kopera.id" className="font-semibold text-accent-foreground">
              Hubungi pengurus
            </a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
