"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Save, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showAlert } from "@/lib/alert";
import { groupApi, groupMenuAuthApi, type Group } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import type { ApiMenuNode } from "@/lib/auth/types";

const menuKey = (menu: ApiMenuNode) => {
	const rawMenu = menu as ApiMenuNode & {
		menuID?: string | number;
		menu_id?: string | number;
		MenuId?: string | number;
		id?: string | number;
		menu?: { menuId?: string | number; menuID?: string | number; id?: string | number };
	};
	return String(
		rawMenu.menuId ??
		rawMenu.menuID ??
		rawMenu.menu_id ??
		rawMenu.MenuId ??
		rawMenu.id ??
		rawMenu.menu?.menuId ??
		rawMenu.menu?.menuID ??
		rawMenu.menu?.id ??
		"",
	);
};

const getChildKeys = (menu: ApiMenuNode) =>
	(menu.children ?? []).map(menuKey);

const getGroupId = (group: Group) =>
	String(group.groupId ?? group.GroupId ?? group.id ?? "");

const getGroupName = (group: Group) =>
	group.groupName ?? group.GroupName ?? group.name ?? getGroupId(group);

const getAccessValue = (menu: ApiMenuNode) => {
	const rawMenu = menu as ApiMenuNode & {
		access_value?: number | string;
		access?: number | string;
		Access?: number | string;
		accessStatus?: string;
		menu?: { accessValue?: number | string; access_value?: number | string };
	};
	return Number(
		rawMenu.accessValue ??
		rawMenu.access_value ??
		rawMenu.access ??
		rawMenu.Access ??
		rawMenu.menu?.accessValue ??
		rawMenu.menu?.access_value ??
		0,
	);
};

const normalizeGroups = (payload: unknown): Group[] => {
	if (Array.isArray(payload)) {
		return payload.filter((group): group is Group => typeof group === "object" && group !== null);
	}

	if (typeof payload !== "object" || payload === null) {
		return [];
	}

	const response = payload as Record<string, unknown>;
	for (const key of ["data", "groups", "items", "results", "rows"]) {
		if (key in response) {
			return normalizeGroups(response[key]);
		}
	}

	return [];
};

const normalizeAuthorizationMenus = (payload: unknown): ApiMenuNode[] => {
	if (Array.isArray(payload)) {
		return payload.filter(
			(menu): menu is ApiMenuNode => typeof menu === "object" && menu !== null,
		);
	}

	if (typeof payload !== "object" || payload === null) {
		return [];
	}

	const response = payload as Record<string, unknown>;
	for (const key of ["data", "menus", "menuAuth", "groupAuth", "authorization", "permissions", "items", "results", "rows"]) {
		if (key in response) {
			return normalizeAuthorizationMenus(response[key]);
		}
	}

	return [];
};

const collectAllowedMenuIds = (menus: ApiMenuNode[], result = new Set<string>()) => {
	menus.forEach((menu) => {
		if (getAccessValue(menu) === 1 || menu.accessStatus?.toLowerCase() === "allowed") {
			result.add(menuKey(menu));
		}
		if (menu.children?.length) {
			collectAllowedMenuIds(menu.children, result);
		}
	});

	return result;
};

const flattenMenus = (menus: ApiMenuNode[]) =>
	menus.flatMap((parent) => [parent, ...(parent.children ?? [])]);

export default function DefineMenuAuthorizationPage() {
	const { logout, user } = useAuth();
	const [checkedMenus, setCheckedMenus] = useState<Set<string>>(new Set());
	const [groups, setGroups] = useState<Group[]>([]);
	const [selectedGroupId, setSelectedGroupId] = useState("");
	const [isLoadingGroups, setIsLoadingGroups] = useState(false);
	const [isLoadingAuthorization, setIsLoadingAuthorization] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const role = user?.role ?? "administrator";
	const navigationMenu = getMenuByRole(role, user?.menus);
	const parentMenus = user?.menus ?? [];
	const displayName = user?.name || "Administrator Koperasi";

	useEffect(() => {
		setCheckedMenus(new Set());
	}, [user?.id]);

	useEffect(() => {
		if (!user) {
			return;
		}

		const loadGroups = async () => {
			setIsLoadingGroups(true);
			setErrorMessage("");
			try {
				const nextGroups = normalizeGroups(await groupApi.findAll());
				setGroups(nextGroups);
				setSelectedGroupId((current) =>
					current && nextGroups.some((group) => getGroupId(group) === current)
						? current
						: nextGroups.some((group) => getGroupId(group) === String(user.groupId))
							? String(user.groupId)
							: getGroupId(nextGroups[0] ?? {}),
				);
			} catch (error) {
				setErrorMessage(error instanceof Error ? error.message : "Group gagal dimuat dari server.");
			} finally {
				setIsLoadingGroups(false);
			}
		};

		void loadGroups();
	}, [user]);

	useEffect(() => {
		if (!selectedGroupId) {
			setCheckedMenus(new Set());
			return;
		}

		const loadAuthorization = async () => {
			setIsLoadingAuthorization(true);
			setErrorMessage("");
			try {
				const authorization = await groupMenuAuthApi.findAll(selectedGroupId);
				setCheckedMenus(collectAllowedMenuIds(normalizeAuthorizationMenus(authorization)));
			} catch (error) {
				setCheckedMenus(new Set());
				setErrorMessage(error instanceof Error ? error.message : "Authorization gagal dimuat dari server.");
			} finally {
				setIsLoadingAuthorization(false);
			}
		};

		void loadAuthorization();
	}, [selectedGroupId]);

	const selectedCount = checkedMenus.size;
	const totalCount = useMemo(
		() =>
			parentMenus.reduce(
				(total, parent) => total + 1 + (parent.children?.length ?? 0),
				0,
			),
		[parentMenus],
	);

	const isParentChecked = (parent: ApiMenuNode) => {
		const children = parent.children ?? [];

		if (children.length === 0) {
			return checkedMenus.has(menuKey(parent));
		}

		return checkedMenus.has(menuKey(parent)) || children.some((child) => checkedMenus.has(menuKey(child)));
	};

	const toggleParent = (parent: ApiMenuNode) => {
		const parentId = menuKey(parent);
		const childIds = getChildKeys(parent);
		const shouldCheck = !isParentChecked(parent);

		setCheckedMenus((current) => {
			const next = new Set(current);

			if (shouldCheck) {
				next.add(parentId);
				childIds.forEach((childId) => next.add(childId));
			} else {
				next.delete(parentId);
				childIds.forEach((childId) => next.delete(childId));
			}

			return next;
		});
	};

	const toggleChild = (parent: ApiMenuNode, child: ApiMenuNode) => {
		const parentId = menuKey(parent);
		const childId = menuKey(child);

		setCheckedMenus((current) => {
			const next = new Set(current);

			if (next.has(childId)) {
				next.delete(childId);
			} else {
				next.add(childId);
			}

			const childIds = getChildKeys(parent);
			const hasCheckedChild = childIds.some((id) => next.has(id));

			if (hasCheckedChild) {
				next.add(parentId);
			} else {
				next.delete(parentId);
			}

			return next;
		});
	};

	const handleSave = async () => {
		if (!selectedGroupId) {
			await showAlert("warning", "Pilih group terlebih dahulu.");
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		try {
			await groupMenuAuthApi.update(
				selectedGroupId,
				flattenMenus(parentMenus).map((menu) => ({
					groupId: Number(selectedGroupId),
					menuId: Number(menuKey(menu)),
					access: checkedMenus.has(menuKey(menu)) ? 1 : 0,
				})),
			);
			await showAlert("success", "Authorization berhasil disimpan.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Authorization gagal disimpan.";
			setErrorMessage(message);
			await showAlert("danger", message);
		} finally {
			setIsSaving(false);
		}
	};

	if (!user) {
		return null;
	}
//handle kalo check child nya parent ke checklist juga (kalau parent nya belum)
	return (
		<DashboardShell
			title="Define Menu Authorization"
			subtitle="Atur hak akses menu berdasarkan struktur parent dan child"
			displayName={displayName}
			groupName={user.groupName || "Koperasi"}
			menu={navigationMenu}
			onLogout={logout}
		>
			<div className="space-y-5">
				<Card className="rounded-2xl border border-border/70 shadow-sm">
					<CardHeader className="border-b bg-muted/20 px-5 py-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<CardTitle className="flex items-center gap-2 text-lg">
									<ShieldCheck className="size-5 text-primary" />
									Authorization Menu
								</CardTitle>
								<CardDescription>
									Centang parent untuk memilih seluruh child di dalamnya.
								</CardDescription>
							</div>
							<div className="rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
								<span className="font-semibold">{selectedCount}</span> / {totalCount} menu dipilih
							</div>
						</div>
					</CardHeader>
                    

					<CardContent className="space-y-3 p-5">
						{errorMessage ? (
							<p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
						) : null}
						<label className="block max-w-sm space-y-2 text-sm font-semibold">
							<span>Select Group</span>
							<select
								value={selectedGroupId}
								onChange={(event) => setSelectedGroupId(event.target.value)}
								disabled={isLoadingGroups || isSaving}
								className="w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
							>
								<option value="">{isLoadingGroups ? "Memuat group..." : "Pilih group"}</option>
								{groups.map((group) => (
									<option key={getGroupId(group)} value={getGroupId(group)}>
										{getGroupName(group)}
									</option>
								))}
							</select>
						</label>
						{isLoadingAuthorization ? (
							<p className="text-sm text-muted-foreground">Memuat authorization group...</p>
						) : null}
                        
						{parentMenus.length === 0 ? (
                            
							<div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
								Belum ada menu yang tersedia.
							</div>
						) : (
							parentMenus.map((parent) => {
								const children = parent.children ?? [];
								const parentChecked = isParentChecked(parent);

								return (
									<div key={menuKey(parent)} className="overflow-hidden rounded-xl border border-border/70">
										<label className="flex cursor-pointer items-center gap-3 bg-muted/40 px-4 py-3 hover:bg-muted/70">
											<input
												type="checkbox"
												checked={parentChecked}
												onChange={() => toggleParent(parent)}
												className="size-4 accent-primary"
											/>
											<span className="flex min-w-0 flex-1 items-center gap-2 font-semibold">
												<CheckSquare className="size-4 text-primary" />
												<span className="truncate">{parent.menuName}</span>
											</span>
											<span className="text-xs text-muted-foreground">
												{children.length} child
											</span>
										</label>

										{children.length > 0 ? (
											<div className="grid gap-1 border-t px-4 py-3 sm:grid-cols-2">
												{children.map((child) => (
													<label
														key={menuKey(child)}
														className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/60"
													>
														<input
															type="checkbox"
															checked={checkedMenus.has(menuKey(child))}
															onChange={() => toggleChild(parent, child)}
															className="size-4 accent-primary"
														/>
														<span className="min-w-0 flex-1">
															<span className="block truncate font-medium">{child.menuName}</span>
															{child.route ? (
																<span className="block truncate text-xs text-muted-foreground">
																	{child.route}
																</span>
															) : null}
														</span>
													</label>
												))}
											</div>
										) : null}
									</div>
								);
							})
						)}
					</CardContent>

					<div className="flex justify-end border-t bg-muted/10 px-5 py-4">
						<Button type="button" className="gap-2" disabled={parentMenus.length === 0 || !selectedGroupId || isSaving || isLoadingAuthorization} onClick={() => void handleSave()}>
							<Save className="size-4" />
							Simpan Authorization
						</Button>
					</div>
				</Card>
			</div>
		</DashboardShell>
	);
}
