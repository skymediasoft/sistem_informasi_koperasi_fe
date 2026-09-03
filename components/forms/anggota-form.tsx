"use client";

import * as React from "react";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type MemberFormValues = {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  departemen: string;
  status: "Aktif" | "Baru" | "Review";
  joinDate: string;
  address: string;
};

interface MemberFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<MemberFormValues>;
  onSubmit: (values: MemberFormValues) => void;
  onCancel?: () => void;
}

const defaultValues: MemberFormValues = {
  memberId: "KPR-2024-001",
  name: "Budi Santoso",
  email: "budi.santoso@example.com",
  phone: "081234567890",
  departemen: "Keuangan",
  status: "Aktif",
  joinDate: "2024-01-15",
  address: "Jl. Merdeka No. 12, Bandung",
};

export function MemberForm({ mode, initialValues, onSubmit, onCancel }: MemberFormProps) {
  const [form, setForm] = React.useState<MemberFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  React.useEffect(() => {
    setForm({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (field: keyof MemberFormValues, value: string) => {
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
          {mode === "create" ? "Form tambah anggota baru" : "Form edit anggota"}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nomor Anggota">
              <Input
                value={form.memberId}
                onChange={(event) => handleChange("memberId", event.target.value)}
                placeholder="contoh: KPR-2024-010"
              />
            </Field>

            <Field label="Nama Lengkap">
              <Input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Masukkan nama anggota"
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="anggota@email.com"
              />
            </Field>

            <Field label="Nomor Telepon">
              <Input
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="0812xxxxxxxx"
              />
            </Field>

            <Field label="Departemen">
              <select
                value={form.departemen}
                onChange={(event) => handleChange("departemen", event.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Keuangan">Keuangan</option>
                <option value="Simpanan & Pinjaman">Simpanan &amp; Pinjaman</option>
                <option value="Anggota & Pelayanan">Anggota &amp; Pelayanan</option>
                <option value="Operasional">Operasional</option>
                <option value="IT & Sistem">IT &amp; Sistem</option>
                <option value="HRD">HRD</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value as MemberFormValues["status"])}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Aktif">Aktif</option>
                <option value="Baru">Baru</option>
                <option value="Review">Review</option>
              </select>
            </Field>

            <Field label="Tanggal Bergabung" className="md:col-span-2">
              <Input
                type="date"
                value={form.joinDate}
                onChange={(event) => handleChange("joinDate", event.target.value)}
              />
            </Field>

            <Field label="Alamat" className="md:col-span-2">
              <textarea
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Masukkan alamat lengkap"
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
              {mode === "create" ? "Simpan anggota" : "Update anggota"}
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
