"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Save, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import type { ApiMenuNode } from "@/lib/auth/types";

const menuKey = (menu: ApiMenuNode) => String(menu.menuId);

const getChildKeys = (menu: ApiMenuNode) =>
	(menu.children ?? []).map(menuKey);

export default function DefineMenuAuthorizationPage() {
	const { logout, user } = useAuth();
	const [checkedMenus, setCheckedMenus] = useState<Set<string>>(new Set());
    const groupName = user?.groupName || "Koperasi";
    const groupId = user?.groupId || "1";

	const role = user?.role ?? "administrator";
	const navigationMenu = getMenuByRole(role, user?.menus);
	const parentMenus = user?.menus ?? [];
	const displayName = user?.name || "Administrator Koperasi";

	useEffect(() => {
		setCheckedMenus(new Set());
	}, [user?.id]);

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

		return checkedMenus.has(menuKey(parent));
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
			const allChildrenChecked = childIds.every((id) => next.has(id));

			if (allChildrenChecked) {
				next.add(parentId);
			} else {
				next.delete(parentId);
			}

			return next;
		});
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
						 <h4 className="font-semibold">Select User by Group Id</h4>
                        <div className="flex items-left w-20 gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
							<select>
                                <option value={groupId}>{groupName}</option>
                            </select>
                        </div>
                        
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
						<Button type="button" className="gap-2" disabled={parentMenus.length === 0}>
							<Save className="size-4" />
							Simpan Authorization
						</Button>
					</div>
				</Card>
			</div>
		</DashboardShell>
	);
}
