"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { GroupForm, type GroupFormValues } from "@/components/forms/group-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { groupApi } from "@/lib/api";

export default function CreateGroupPage() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  const handleSubmit = async (values: GroupFormValues) => {
    try {
      await groupApi.create({ groupId: values.GroupId, groupName: values.GroupName });
      await showAlert("success", `Group "${values.GroupName}" berhasil disimpan.`);
      router.push("/settings/group-login");
    } catch (requestError) {
      await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal menyimpan group.");
    }
  };

  return (
    <DashboardShell title="Tambah Group" subtitle="Form tambah group login baru" displayName={user?.name || "Administrator Koperasi"} groupName={user?.groupName || "Koperasi"} menu={menu} secondaryMenu={secondaryMenu} onLogout={logout} actionLabel="Kembali" onAction={() => router.push("/settings/group-login")}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary"><Users className="size-5" /><span className="font-medium">Isi data group login baru dengan lengkap.</span></div>
        <GroupForm mode="create" onSubmit={handleSubmit} onCancel={() => router.push("/settings/group-login")} />
      </div>
    </DashboardShell>
  );
}