"use client";

import * as React from "react";
import { KeyRound, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Group } from "@/lib/api";

export type UserLoginFormValues = {
  userlogin: string;
  username: string;
  password: string;
  email: string;
  groupId: string;
};

type UserLoginFormProps = {
  mode: "create" | "edit";
  groups: Group[];
  initialValues?: Partial<UserLoginFormValues>;
  onSubmit: (values: UserLoginFormValues) => void;
  onCancel: () => void;
  onResetPassword?: () => void;
};

const defaultValues: UserLoginFormValues = {
  userlogin: "",
  username: "",
  password: "123456",
  email: "",
  groupId: "",
};

const groupId = (group: Group) =>
  String(group.groupId ?? group.GroupId ?? group.id ?? "");
const groupName = (group: Group) =>
  group.groupName ?? group.GroupName ?? group.name ?? groupId(group);

export function UserLoginForm({
  mode,
  groups,
  initialValues,
  onSubmit,
  onCancel,
  onResetPassword,
}: UserLoginFormProps) {
  const [form, setForm] = React.useState({
    ...defaultValues,
    ...initialValues,
  });
  React.useEffect(
    () => setForm({ ...defaultValues, ...initialValues }),
    [initialValues],
  );

  const update = (key: keyof UserLoginFormValues, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-lg">
          {mode === "create" ? "Form tambah user" : "Form edit user"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form);
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Login User</span>
              <Input
                value={form.userlogin}
                onChange={(event) => update("userlogin", event.target.value)}
                required
                disabled={mode === "edit"}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nama User</span>
              <Input
                value={form.username}
                onChange={(event) => update("username", event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email User</span>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
              />
            </label>
            {mode === "create" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Password</span>
                <Input
                  type="text"
                  minLength={6}
                  value={form.password}
                  disabled
                />
              </label>
            ) : onResetPassword ? (
              <div className="flex items-end">
                <Button type="button" variant="outline" className="gap-2" onClick={onResetPassword}>
                  <KeyRound className="size-4" />
                  Reset password
                </Button>
              </div>
            ) : null}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium">Group</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.groupId}
                onChange={(event) => update("groupId", event.target.value)}
                required
              >
                <option value="">Pilih group</option>
                {groups.map((group) => (
                  <option key={groupId(group)} value={groupId(group)}>
                    {groupName(group)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-2"
            >
              <X className="size-4" />
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="size-4" />
              {mode === "create" ? "Simpan user" : "Update user"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
