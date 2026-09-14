"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderTree, Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { showAlert, showConfirm } from "@/lib/alert";
import { menuApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import type { ApiMenuNode } from "@/lib/auth/types";

type MenuEditorRow = Omit<ApiMenuNode, "children"> & {
  children: MenuEditorRow[];
};

type RawMenu = Record<string, unknown>;

const toEditorMenus = (menus: RawMenu[] | undefined): MenuEditorRow[] =>
  (menus ?? []).map(toEditorMenu);

function toEditorMenu(menu: RawMenu): MenuEditorRow {
  const rawId = menu.menuId ?? menu.menuID ?? menu.id ?? "";
  const rawSort = menu.accessValue ?? menu.menuSort;
  const rawChildren = Array.isArray(menu.children)
    ? menu.children.filter((child): child is RawMenu => typeof child === "object" && child !== null)
    : undefined;

  return {
    ...menu,
    menuId: typeof rawId === "number" || typeof rawId === "string" ? rawId : String(rawId),
    menuName: String(menu.menuName ?? menu.name ?? ""),
    route: typeof (menu.route ?? menu.menuRoute) === "string" ? String(menu.route ?? menu.menuRoute) : null,
    accessValue: typeof rawSort === "number" ? rawSort : rawSort ? Number(rawSort) : null,
    children: toEditorMenus(rawChildren),
  };
}

const buildEditorMenus = (rawMenus: unknown): MenuEditorRow[] => {
  if (!Array.isArray(rawMenus)) {
    return [];
  }

  const menus = rawMenus.filter(
    (menu): menu is RawMenu => typeof menu === "object" && menu !== null,
  );
  if (menus.some((menu) => Array.isArray(menu.children))) {
    return toEditorMenus(menus);
  }

  const parents = menus.filter((menu) => Number(menu.menuParentID ?? menu.menuParentId ?? 0) === 0);
  return parents.map((parent) => ({
    ...toEditorMenu(parent),
    children: menus
      .filter((menu) => String(menu.menuParentID ?? menu.menuParentId ?? "") === String(parent.menuId ?? parent.menuID))
      .map(toEditorMenu),
  }));
};

export default function DefineMenuPage() {
  const { logout, user } = useAuth();
  const [menuData, setMenuData] = useState<MenuEditorRow[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [formMode, setFormMode] = useState<"parent" | "child">("child");
  const [entryType, setEntryType] = useState<"child" | "route">("child");
  const [menuName, setMenuName] = useState("");
  const [route, setRoute] = useState("");
  const [menuSort, setMenuSort] = useState("1");
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role, user?.menus);
  const displayName = user?.name || "Administrator Koperasi";

  const loadMenus = async () => {
    setIsLoadingMenus(true);
    try {
      const parents = await menuApi.findAllParent();
      const menusWithChildren = await Promise.all(
        parents.map(async (parent) => {
          const normalizedParent = toEditorMenu(parent as unknown as RawMenu);

          return {
            ...normalizedParent,
            children: await menuApi.findAllChild(String(normalizedParent.menuId)),
          };
        }),
      );
      const nextMenus = buildEditorMenus(menusWithChildren);

      setMenuData(nextMenus);
      setSelectedParentId((current) =>
        nextMenus.some((parent) => String(parent.menuId) === current)
          ? current
          : nextMenus[0]
            ? String(nextMenus[0].menuId)
            : "",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Menu gagal dimuat dari server.";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsLoadingMenus(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadMenus().catch(() => undefined);
  }, [user]);

  const selectedParent = useMemo(
    () => menuData.find((item) => String(item.menuId) === selectedParentId),
    [menuData, selectedParentId],
  );
  const parentRoute = selectedParent?.route?.replace(/\/+$/, "") ?? "";

  const getChildRoute = () => {
    const childRoute = route.trim().replace(/^\/+/, "");

    if (!parentRoute) {
      return childRoute ? `/${childRoute}` : "";
    }

    return childRoute ? `${parentRoute}/${childRoute}` : parentRoute;
  };

  if (!user) {
    return null;
  }

  const resetForm = () => {
    setFormMode("child");
    setEditingMenuId(null);
    setMenuName("");
    setRoute("");
    setMenuSort(String((selectedParent?.children.length ?? 0) + 1));
  };

  const addParentForm = () => {
    setFormMode("parent");
    setEditingMenuId(null);
    setMenuName("");
    setRoute("");
    setMenuSort(String(menuData.length + 1));
  };

  const editParent = (parent: MenuEditorRow) => {
    setSelectedParentId(String(parent.menuId));
    setFormMode("parent");
    setEditingMenuId(String(parent.menuId));
    setMenuName(parent.menuName);
    setRoute(parent.route ?? "");
    setMenuSort(String(parent.accessValue ?? 1));
  };

  const editChild = (parent: MenuEditorRow, child: MenuEditorRow) => {
    const fullRoute = child.route ?? "";
    const prefix = parent.route?.replace(/\/+$/, "") ?? "";
    const childRoute = prefix && fullRoute.startsWith(`${prefix}/`)
      ? fullRoute.slice(prefix.length + 1)
      : fullRoute.replace(/^\/+/, "");

    setSelectedParentId(String(parent.menuId));
    setFormMode("child");
    setEditingMenuId(String(child.menuId));
    setMenuName(child.menuName);
    setRoute(childRoute);
    setMenuSort(String(child.accessValue ?? 1));
  };

  const handleDelete = async (menuId: string, menuNameToDelete: string) => {
    const confirmation = await showConfirm(`Data menu "${menuNameToDelete}" akan dihapus.`);
    if (!confirmation.isConfirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      await menuApi.delete(menuId);
      await loadMenus();
      resetForm();
      await showAlert("success", "Data menu berhasil dihapus.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Menu gagal dihapus dari server.";
      setErrorMessage(message);
      await showAlert("danger", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!menuName.trim()) {
      await showAlert("warning", "Nama menu wajib diisi.");
      return;
    }

    if (formMode === "child" && !selectedParent) {
      await showAlert("warning", "Pilih menu parent terlebih dahulu.");
      return;
    }

    if (!route.trim()) {
      await showAlert("warning", "Route menu wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const menuRoute = formMode === "child" ? getChildRoute() : route.trim();
      const payload = {
        menuName: menuName.trim(),
        menuRoute,
        menuSort: Number(menuSort) || 1,
      };

      if (editingMenuId) {
        await menuApi.update(editingMenuId, payload);
        await loadMenus();
        await showAlert("success", "Data menu berhasil diperbarui.");
      } else {
        await menuApi.create({
          ...payload,
          menuParentId: formMode === "child" ? Number(selectedParentId) || selectedParentId : 0,
          postBy: user.id,
        });
        await loadMenus();
        await showAlert("success", "Data menu berhasil disimpan.");
      }
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Menu gagal disimpan ke server.";
      setErrorMessage(message);
      await showAlert("danger", message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Define Menu"
      subtitle="Atur struktur parent, child, dan route menu"
      displayName={displayName}
      groupName={user.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
      actionLabel="Tambah Parent"
      onAction={resetForm}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.85fr)_minmax(420px,1.5fr)]">
        <Card className="rounded-2xl border border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderTree className="size-5 text-primary" />
                Menu Parent 
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addParentForm}>
                Add Parent Menu
              </Button>
            </div>
            <CardDescription>Pilih parent untuk mengatur child menu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {errorMessage ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            {isLoadingMenus ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Memuat menu...
              </p>
            ) : menuData.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Belum ada menu parent dari server.
              </p>
            ) : (
              menuData.map((parent) => {
                const isSelected = String(parent.menuId) === selectedParentId;

                return (
                  <div
                    key={String(parent.menuId)}
                    onClick={() => {
                      setSelectedParentId(String(parent.menuId));
                      setFormMode("child");
                      setMenuSort(String(parent.children.length + 1));
                    }}
                    className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent hover:border-border hover:bg-muted/60"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium">{parent.menuName}</span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {parent.children.length} child
                        </span>
                        <span className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <button type="button" title="Edit parent" onClick={() => editParent(parent)} className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground">
                            <Pencil className="size-3.5" />
                          </button>
                          <button type="button" title="Hapus parent" onClick={() => void handleDelete(String(parent.menuId), parent.menuName)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </button>
                        </span>
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {parent.route || "Parent tanpa route"}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-5 py-4">
            <CardTitle className="text-lg">
              {formMode === "parent" ? "Tambah Parent Menu" : "Tambah Menu"}
            </CardTitle>
            <CardDescription>
              {formMode === "parent"
                ? "Buat menu parent baru untuk struktur navigasi."
                : selectedParent
                ? `Menambahkan menu di bawah ${selectedParent.menuName}.`
                : "Pilih menu parent terlebih dahulu."}
            </CardDescription>
          </CardHeader>
          {/* need fix menu */}
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              { formMode === "child" ? (
             
              <label className="space-y-2 text-sm font-medium">
                Menu Child Name
                <Input
                  value={menuName}
                  onChange={(event) => setMenuName(event.target.value)}
                  placeholder={ "Contoh: Data Karyawan"}
                  disabled={formMode === "child" && !selectedParent}
                />
              </label>) : (
                <label className="space-y-2 text-sm font-medium">
                  Parent Menu Name
                  <Input
                    value={menuName}
                    onChange={(event) => setMenuName(event.target.value)}
                    placeholder="Contoh: Data Karyawan"
                  />
                </label>
              ) }
              <label className="space-y-2 text-sm font-medium">
                Menu Sort
                <Input
                  type="number"
                  min="1"
                  value={menuSort}
                  onChange={(event) => setMenuSort(event.target.value)}
                  placeholder="1"
                  disabled={formMode === "child" && !selectedParent}
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium">
              Route
              {formMode === "child" && selectedParent && parentRoute ? (
                <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="shrink-0 border-r bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {parentRoute}
                  </span>
                  <Input
                    value={route}
                    onChange={(event) => setRoute(event.target.value)}
                    placeholder="contoh: /anggota"
                    className="rounded-none border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              ) : (
                <Input
                  value={route}
                  onChange={(event) => setRoute(event.target.value)}
                  placeholder={formMode === "parent" ? "Contoh: /data-karyawan" : "Contoh: /anggota"}
                  disabled={formMode === "child" && !selectedParent}
                />
              )}
            </label>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  isSaving ||
                  (formMode === "child" && !selectedParent) ||
                  !menuName.trim() ||
                  !menuSort.trim() ||
                  !route.trim()
                }
                className="gap-2"
              >
                <Save className="size-4" />
                {formMode === "parent" ? "Simpan Menu Parent" : "Simpan Menu"}
              </Button>
            </div>

            {selectedParent ? (
              <div className="rounded-xl border border-dashed border-border p-4">
                <p className="mb-3 text-sm font-semibold">Child di {selectedParent.menuName}</p>
                {selectedParent.children.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada child menu.</p>
                ) : (
                  <div className="space-y-2">
                    {[...selectedParent.children]
                      .sort((first, second) => Number(first.accessValue ?? 0) - Number(second.accessValue ?? 0))
                      .map((child) => (
                        <div key={String(child.menuId)} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                          <span className="font-medium">{child.menuName}</span>
                          <span className="flex items-center gap-2">
                            <span className="truncate text-xs text-muted-foreground">{child.route || "-"}</span>
                            <button type="button" title="Edit child" onClick={() => editChild(selectedParent, child)} className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground">
                              <Pencil className="size-3.5" />
                            </button>
                            <button type="button" title="Hapus child" onClick={() => void handleDelete(String(child.menuId), child.menuName)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="size-3.5" />
                            </button>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
