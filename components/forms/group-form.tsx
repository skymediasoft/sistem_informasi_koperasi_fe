"use client";

import * as React from "react";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type GroupFormValues = {
  GroupId: string;
  GroupName: string;
};

interface GroupFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<GroupFormValues>;
  onSubmit: (values: GroupFormValues) => void;
  onCancel?: () => void;
}

const defaultValues: GroupFormValues = {
  GroupId: "",
  GroupName: "",
};

export function GroupForm({ mode, initialValues, onSubmit, onCancel }: GroupFormProps) {
  const [form, setForm] = React.useState<GroupFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  React.useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-lg">
          {mode === "create" ? "Form tambah group baru" : "Form edit group"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Group ID</span>
              <Input
                value={form.GroupId}
                onChange={(event) => setForm((current) => ({ ...current, GroupId: event.target.value }))}
                placeholder="contoh: 1"
                disabled={mode === "edit"}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Nama Group</span>
              <Input
                value={form.GroupName}
                onChange={(event) => setForm((current) => ({ ...current, GroupName: event.target.value }))}
                placeholder="Masukkan nama group"
                required
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
                <X className="size-4" />
                Batal
              </Button>
            ) : null}
            <Button type="submit" className="gap-2">
              <Save className="size-4" />
              {mode === "create" ? "Simpan group" : "Update group"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}