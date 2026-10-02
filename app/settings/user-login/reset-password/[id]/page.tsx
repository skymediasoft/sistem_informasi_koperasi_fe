"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { type User, userApi } from "@/lib/api";

const normalizeList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const response = payload as Record<string, unknown>;
  for (const key of ["data", "users", "items", "results", "rows"]) {
    if (key in response) return normalizeList<T>(response[key]);
  }
  return [];
};

const getUserId = (user: User) => String(
  user.id ?? user.userId ?? user.UserId ?? user.userLogin ?? user.UserLogin ?? "",
);
const getUserLogin = (user: User) => user.userlogin ?? user.userLogin ?? user.UserLogin ?? "";
const getUserName = (user: User) => user.username ?? user.userName ?? user.UserName ?? "";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { logout, user } = useAuth();
  const userId = params?.id ?? "";
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);
  const [userlogin, setUserlogin] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      try {
        const usersPayload = await userApi.findAll();
        const userRecord = normalizeList<User>(usersPayload).find((item) => getUserId(item) === userId);
        if (!userRecord) throw new Error("User tidak ditemukan.");
        setUserlogin(getUserLogin(userRecord));
        setUsername(getUserName(userRecord));
      } catch (requestError) {
        await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal memuat data user.");
        router.push("/settings/user-login");
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, [router, userId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmation) {
      await showAlert("danger", "Konfirmasi password tidak sama.");
      return;
    }

    setSubmitting(true);
    try {
      await userApi.resetpassword(userlogin, newPassword);
      await showAlert("success", `Password user "${username}" berhasil direset.`);
      router.push("/settings/user-login");
    } catch (requestError) {
      await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal mereset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="Reset Password"
      subtitle="Buat password baru untuk user login"
      displayName={user?.name || "Administrator Koperasi"}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push(`/settings/user-login/edit/${userId}`)}
    >
      <div className="mx-auto max-w-2xl">
        {loading ? <p className="text-sm text-muted-foreground">Memuat data user...</p> : (
          <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="size-5" />
                Reset password {username ? `untuk ${username}` : "user"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Login User</span>
                  <Input value={userlogin} readOnly />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Password Baru</span>
                  <Input type="password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Konfirmasi Password Baru</span>
                  <Input type="password" minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
                </label>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push(`/settings/user-login/edit/${userId}`)}>
                    Batal
                  </Button>
                  <Button type="submit" className="gap-2" disabled={submitting || !userlogin}>
                    <KeyRound className="size-4" />
                    {submitting ? "Menyimpan..." : "Reset password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
