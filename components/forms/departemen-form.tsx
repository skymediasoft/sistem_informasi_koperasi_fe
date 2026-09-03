"use client";

import * as React from "react";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type DepartemenFormValues = {
  // No: number;
  Deptid: string;
  Departemen: string;
  // createdUser: string;
  // createdDate: number;
};

interface DepartemenFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<DepartemenFormValues>;
  onSubmit: (values: DepartemenFormValues) => void;
  onCancel?: () => void;
}

const defaultValues: DepartemenFormValues = {
  Deptid: "",
  Departemen: "",
};

export function DepartemenForm({ mode, initialValues, onSubmit, onCancel }: DepartemenFormProps) {
  const [form, setForm] = React.useState<DepartemenFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  React.useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (field: keyof DepartemenFormValues, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-lg">
          {mode === "create" ? "Form tambah departemen baru" : "Form edit departemen"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
           
            <Field label="Dept ID">
              <Input
                value={form.Deptid}
                onChange={(event) => handleChange("Deptid", event.target.value)}
                placeholder="contoh: DEP-001"
              />
            </Field>

            <Field label="Nama Departemen">
              <Input
                value={form.Departemen}
                onChange={(event) => handleChange("Departemen", event.target.value)}
                placeholder="Masukkan nama departemen"
              />
            </Field>
           
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
              {mode === "create" ? "Simpan departemen" : "Update departemen"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `${className} block` : "block"}>
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
