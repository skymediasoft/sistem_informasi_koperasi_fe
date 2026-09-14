"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { GroupForm, type GroupFormValues } from "@/components/forms/group-form";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";
import { showAlert } from "@/lib/alert";
import { groupApi, type Group } from "@/lib/api";

const getGroupId = (group: Group) => String(group.groupId ?? group.GroupId ?? group.id ?? "");
const getGroupName = (group: Group) => group.groupName ?? group.GroupName ?? group.name ?? "";

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { logout, user } = useAuth();
  const groupId = params?.id ?? "";
  const [selectedGroup, setSelectedGroup] = useState<GroupFormValues>();
  const [loading, setLoading] = useState(true);
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;
      try {
        const groups = await groupApi.findAll();
        const group = (Array.isArray(groups) ? groups : []).find((item) => getGroupId(item as Group) === groupId) as Group | undefined;
        if (!group) throw new Error("Group tidak ditemukan.");
        setSelectedGroup({ GroupId: getGroupId(group), GroupName: getGroupName(group) });
      } catch (requestError) {
        await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal memuat group.");
        router.push("/settings/group-login");
      } finally {
        setLoading(false);
      }
    };
    void loadGroup();
  }, [groupId, router]);

  const handleSubmit = async (values: GroupFormValues) => {
    try {
      await groupApi.update(groupId, { groupName: values.GroupName });
      await showAlert("success", `Group "${values.GroupName}" berhasil diperbarui.`);
      router.push("/settings/group-login");
    } catch (requestError) {
      await showAlert("danger", requestError instanceof Error ? requestError.message : "Gagal memperbarui group.");
    }
  };

  return (
    <DashboardShell title="Edit Group" subtitle="Perbarui data group login" displayName={user?.name || "Administrator Koperasi"} groupName={user?.groupName || "Koperasi"} menu={menu} secondaryMenu={secondaryMenu} onLogout={logout} actionLabel="Kembali" onAction={() => router.push("/settings/group-login")}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-accent-foreground"><Users className="size-5" /><span className="font-medium">Mengubah data group login yang sudah ada.</span></div>
        {loading ? <p className="text-sm text-muted-foreground">Memuat data group...</p> : selectedGroup ? <GroupForm mode="edit" initialValues={selectedGroup} onSubmit={handleSubmit} onCancel={() => router.push("/settings/group-login")} /> : null}
      </div>
    </DashboardShell>
  );
}