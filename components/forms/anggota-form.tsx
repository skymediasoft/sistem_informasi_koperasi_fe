"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { z } from "zod";

import { DashboardShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showAlert } from "@/lib/alert";
import {
  anggotaApi,
  departmentApi,
  SettingSimpananApi,
  type AnggotaCreatePayload,
  type Department,
  type SettingSimpanan,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole, secondaryMenu } from "@/lib/auth/navigation";

interface MemberFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<AnggotaCreatePayload>;
  onSubmit: (values: AnggotaCreatePayload) => void;
  onSaveAndNew?: (values: AnggotaCreatePayload) => boolean | Promise<boolean>;
  onCancel?: () => void;
}

const anggotaSchema = z.object({
  NoEmployee: z.string().trim().min(1, "No employee wajib diisi"),

  Nama: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),

  Alamat: z
    .string()
    .trim()
    .min(5, "Alamat wajib diisi")
    .max(500, "Alamat maksimal 500 karakter"),

  Telpon: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Nomor telepon hanya boleh berisi angka dan karakter + - ( )",
    ),

  JenisKelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),

  DepartmentId: z
    .number()
    .int("Department ID harus berupa angka bulat")
    .positive("Department wajib dipilih"),

  JenisAnggota: z.string().trim().min(1, "Jenis anggota wajib diisi"),

  // Kirim sebagai YYYY-MM-DD
  TanggalMasuk: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal masuk tidak valid"),

  NoRekening: z.string().trim().min(1, "No rekening wajib diisi"),

  SimpananPokok: z.number().nonnegative("Simpanan pokok tidak boleh negatif"),

  SimpananWajib: z.number().nonnegative("Simpanan wajib tidak boleh negatif"),

  SimpananSukarela: z
    .number()
    .nonnegative("Simpanan sukarela tidak boleh negatif"),

  AlamatEmail: z.string().trim().email("Format email tidak valid"),
    StatusAnggota: z.string().trim().min(1, "Status anggota wajib diisi"),
});

const defaultValues: AnggotaCreatePayload = {
  NoEmployee: "",
  Nama: "",
  Alamat: "",
  Telpon: "",
  JenisKelamin: "",
  DepartmentId: 0,
  JenisAnggota: "",
  TanggalMasuk: new Date().toISOString().slice(0, 10),
  NoRekening: "",
  SimpananPokok: 0,
  SimpananWajib: 0,
  SimpananSukarela: 0,
  AlamatEmail: "",
  StatusAnggota: "",
};

export default function CreateAnggotaPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const role = user?.role ?? "administrator";
  const menu = getMenuByRole(role);

  const displayName = user?.name || "Administrator Koperasi";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const handleSaveAndNew = async (values: AnggotaCreatePayload) => {
    try {
      await anggotaApi.create(values);

      await showAlert("success", `Anggota "${values.Nama}" berhasil disimpan.`);

      return true;
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal menyimpan anggota.",
      );

      return false;
    }
  };

  const handleSubmit = async (values: AnggotaCreatePayload) => {
    try {
      await anggotaApi.create(values);

      await showAlert("success", `Anggota "${values.Nama}" berhasil disimpan.`);

      router.push("/data-karyawan/anggota");
    } catch (error) {
      await showAlert(
        "danger",
        error instanceof Error ? error.message : "Gagal menyimpan anggota.",
      );
    }
  };

  return (
    <DashboardShell
      title="Tambah Anggota"
      subtitle="Form tambah anggota baru"
      displayName={displayName}
      groupName={user?.groupName || "Koperasi"}
      initials={initials}
      menu={menu}
      secondaryMenu={secondaryMenu}
      onLogout={logout}
      actionLabel="Kembali"
      onAction={() => router.push("/data-karyawan/anggota")}
    >
      <div className="mx-auto max-w-4xl">
        <MemberForm
          mode="create"
          onSubmit={handleSubmit}
          onSaveAndNew={handleSaveAndNew}
          onCancel={() => router.push("/data-karyawan/anggota")}
        />
      </div>
    </DashboardShell>
  );
}

export function MemberForm({
  mode,
  initialValues,
  onSubmit,
  onSaveAndNew,
  onCancel,
}: MemberFormProps) {
  const [form, setForm] = React.useState<AnggotaCreatePayload>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof AnggotaCreatePayload, string>>
  >({});

  const [departments, setDepartments] = React.useState<Department[]>([]);

  const [settingSimpanan, setSettingSimpanan] =
    React.useState<SettingSimpanan | null>(null);

  const [loadingDepartment, setLoadingDepartment] = React.useState(true);

  const [loadingSetting, setLoadingSetting] = React.useState(true);

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeSettingList = (value: unknown): SettingSimpanan[] => {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is SettingSimpanan => !!item && typeof item === "object",
      );
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;

      if (Array.isArray(record.data)) {
        return record.data.filter(
          (item): item is SettingSimpanan => !!item && typeof item === "object",
        );
      }

      if (record.data && typeof record.data === "object") {
        return [record.data as SettingSimpanan];
      }

      return [record as SettingSimpanan];
    }

    return [];
  };

  const getSettingValue = (
    setting: SettingSimpanan | null | undefined,
    key: keyof Pick<
      SettingSimpanan,
      "SimpananPokok" | "SimpananWajib" | "SimpananSukarela"
    >,
  ) => {
    if (!setting) return 0;

    const rawValue =
      setting[key] ??
      (key === "SimpananPokok"
        ? (setting.profit ?? setting.tagihan)
        : (setting.tagihan ?? setting.profit));

    return toNumber(rawValue);
  };

  /*
   * Load department dan setting simpanan
   */
  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoadingDepartment(true);
        setLoadingSetting(true);

        const [departmentResult, settingResult] = await Promise.all([
          departmentApi.findAll(),
          SettingSimpananApi.findAll(),
        ]);

        if (!mounted) return;

        setDepartments(departmentResult);

        const settingList = normalizeSettingList(settingResult);
        const setting = settingList[0] ?? null;

        setSettingSimpanan(setting);

        /*
         * Untuk create, default value simpanan menggunakan
         * nilai minimum dari setting.
         */
        if (mode === "create" && setting) {
          setForm((current) => ({
            ...current,
            SimpananPokok: getSettingValue(setting, "SimpananPokok"),
            SimpananWajib: getSettingValue(setting, "SimpananWajib"),
             SimpananSukarela: 0,
          }));
        }
      } catch (error) {
        if (!mounted) return;

        await showAlert(
          "danger",
          error instanceof Error
            ? error.message
            : "Gagal mengambil data department dan setting simpanan.",
        );
      } finally {
        if (mounted) {
          setLoadingDepartment(false);
          setLoadingSetting(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [mode]);

  React.useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
    });

    setErrors({});
  }, [initialValues]);

  const handleChange = <K extends keyof AnggotaCreatePayload>(
    field: K,
    value: AnggotaCreatePayload[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    const result = anggotaSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AnggotaCreatePayload, string>> =
        {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AnggotaCreatePayload;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return null;
    }

    /*
     * Validasi minimum simpanan berdasarkan setting.
     */
    if (settingSimpanan) {
      const minimumPokok = getSettingValue(settingSimpanan, "SimpananPokok");

      const minimumWajib = getSettingValue(settingSimpanan, "SimpananWajib");

      const maksimumSukarela = getSettingValue(
        settingSimpanan,
        "SimpananSukarela",
      );

      const minimumErrors: Partial<Record<keyof AnggotaCreatePayload, string>> =
        {};

      if (result.data.SimpananPokok < minimumPokok) {
        minimumErrors.SimpananPokok = `Minimal simpanan pokok Rp ${formatRupiah(
          minimumPokok,
        )}`;
      }

      if (result.data.SimpananWajib < minimumWajib) {
        minimumErrors.SimpananWajib = `Minimal simpanan wajib Rp ${formatRupiah(
          minimumWajib,
        )}`;
      }

      if (result.data.SimpananSukarela > maksimumSukarela) {
        minimumErrors.SimpananSukarela = `Maksimal simpanan sukarela Rp ${formatRupiah(
          maksimumSukarela,
        )}`;
      }

      if (Object.keys(minimumErrors).length > 0) {
        setErrors(minimumErrors);
        return null;
      }
    }

    setErrors({});

    return result.data;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = validateForm();

    if (values) {
      onSubmit(values);
    }
  };

  const handleSaveAndNew = async () => {
    const values = validateForm();

    if (!values || !onSaveAndNew) {
      return;
    }

    const saved = await onSaveAndNew(values);

    if (saved) {
      setForm({
        ...defaultValues,
        SimpananPokok: Number(settingSimpanan?.SimpananPokok ?? 0),
        SimpananWajib: Number(settingSimpanan?.SimpananWajib ?? 0),
      SimpananSukarela: 0,
          });

      setErrors({});
    }
  };

  const formatDateForInput = (date: Date | string) => {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toISOString().split("T")[0];
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
            <Field label="No Employee" error={errors.NoEmployee}>
              <Input
                value={form.NoEmployee}
                onChange={(event) =>
                  handleChange("NoEmployee", event.target.value)
                }
                placeholder="Contoh: EMP-001"
              />
            </Field>

            <Field label="Nama Lengkap" error={errors.Nama}>
              <Input
                value={form.Nama}
                onChange={(event) => handleChange("Nama", event.target.value)}
                placeholder="Masukkan nama anggota"
              />
            </Field>

            <Field label="Email" error={errors.AlamatEmail}>
              <Input
                type="email"
                value={form.AlamatEmail}
                onChange={(event) =>
                  handleChange("AlamatEmail", event.target.value)
                }
                placeholder="anggota@email.com"
              />
            </Field>

            <Field label="Nomor Telepon" error={errors.Telpon}>
              <Input
                value={form.Telpon}
                onChange={(event) => handleChange("Telpon", event.target.value)}
                placeholder="0812xxxxxxxx"
              />
            </Field>

            <Field label="Jenis Kelamin" error={errors.JenisKelamin}>
              <select
                value={form.JenisKelamin}
                onChange={(event) =>
                  handleChange("JenisKelamin", event.target.value)
                }
                className={selectClass(errors.JenisKelamin)}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="PRIA">Laki-laki</option>
                <option value="WANITA">Perempuan</option>
              </select>
            </Field>

            {/* Department dari API */}
            <Field label="Department" error={errors.DepartmentId}>
              <select
                value={form.DepartmentId ? String(form.DepartmentId) : ""}
                disabled={loadingDepartment}
                onChange={(event) =>
                  handleChange("DepartmentId", Number(event.target.value))
                }
                className={selectClass(errors.DepartmentId)}
              >
                <option value="">
                  {loadingDepartment
                    ? "Memuat department..."
                    : "Pilih department"}
                </option>

                {departments.map((department) => (
                  <option
                    key={department.departmentId}
                    value={department.departmentId}
                  >
                    {department.departmentName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Jenis Anggota" error={errors.JenisAnggota}>
              <select
                value={form.JenisAnggota}
                onChange={(event) =>
                  handleChange("JenisAnggota", event.target.value)
                }
                className={selectClass(errors.JenisAnggota)}
              >
                <option value="">Pilih jenis anggota</option>
                <option value="KARYAWAN">KARYAWAN</option>
                <option value="NON KARYAWAN">NON KARYAWAN</option>
              </select>
            </Field>



            <Field label="No Rekening" error={errors.NoRekening}>
              <Input
                value={form.NoRekening}
                onChange={(event) =>
                  handleChange("NoRekening", event.target.value)
                }
                placeholder="Nomor rekening"
              />
            </Field>

            <Field label="Tanggal Masuk" error={errors.TanggalMasuk}>
              <Input
                type="date"
                value={form.TanggalMasuk}
                onChange={(event) =>
                  handleChange("TanggalMasuk", event.target.value)
                }
              />
            </Field>

            <Field label="Simpanan Pokok" error={errors.SimpananPokok}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>

                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(form.SimpananPokok)}
                  readOnly
                  className="pl-10 bg-muted/50"
                />
              </div>

              {settingSimpanan ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimal: Rp{" "}
                  {formatRupiahInput(
                    getSettingValue(settingSimpanan, "SimpananPokok"),
                  )}
                </p>
              ) : null}
            </Field>

            <Field label="Simpanan Wajib" error={errors.SimpananWajib}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>

                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(form.SimpananWajib)}
                  readOnly
                  className="pl-10 bg-muted/50"
                />
              </div>

              {settingSimpanan ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimal: Rp{" "}
                  {formatRupiahInput(
                    getSettingValue(settingSimpanan, "SimpananWajib"),
                  )}
                </p>
              ) : null}
            </Field>
            <Field label="Simpanan Sukarela" error={errors.SimpananSukarela}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>

                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiahInput(form.SimpananSukarela)}
                  disabled={loadingSetting}
                  className="pl-10"
                  onChange={(event) => {
                    const value = parseRupiahInput(event.target.value);

                    const maximum =
                      getSettingValue(settingSimpanan, "SimpananSukarela") ||
                      2_000_000;

                    handleChange("SimpananSukarela", Math.min(value, maximum));
                  }}
                />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Maksimal: Rp{" "}
                {formatRupiahInput(
                  getSettingValue(settingSimpanan, "SimpananSukarela") ||
                    2_000_000,
                )}
              </p>
            </Field>
            <Field
              label="Alamat"
              className="md:col-span-2"
              error={errors.Alamat}
            >
              <textarea
                value={form.Alamat}
                onChange={(event) => handleChange("Alamat", event.target.value)}
                rows={4}
                className={textareaClass(errors.Alamat)}
                placeholder="Masukkan alamat lengkap"
              />
            </Field>
          
          <Field label="Status Anggota" error={errors.StatusAnggota}>
            <select
              value={form.StatusAnggota ?? ""}
              onChange={(event) =>
                handleChange("StatusAnggota", event.target.value)
              }
              className={selectClass(errors.StatusAnggota)}
            >
              <option value="">Pilih status anggota</option>
              <option value="AKTIF">AKTIF</option>
              <option value="BELUM AKTIF">BELUM AKTIF</option>
            </select>
          </Field>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="gap-2"
              >
                <X className="size-4" />
                Batal
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={handleSaveAndNew}
              disabled={loadingDepartment || loadingSetting}
              className="gap-2"
            >
              <Save className="size-4" />

              {mode === "create" ? "Save and New" : "Update anggota"}
            </Button>

            <Button
              type="submit"
              disabled={loadingDepartment || loadingSetting}
              className="gap-2"
            >
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
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `${className} block` : "block"}>
      <span className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </span>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : null}
    </label>
  );
}

function selectClass(error?: string) {
  return [
    "h-9 w-full rounded-lg border bg-background px-2.5 text-sm",
    "text-foreground outline-none ring-0 transition-colors",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    error ? "border-destructive" : "border-input",
  ].join(" ");
}

function textareaClass(error?: string) {
  return [
    "w-full rounded-lg border bg-background px-3 py-2 text-sm",
    "text-foreground outline-none transition-colors",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    error ? "border-destructive" : "border-input",
  ].join(" ");
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatRupiahInput = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};

const parseRupiahInput = (value: string) => {
  const numericValue = value.replace(/\D/g, "");

  return numericValue ? Number(numericValue) : 0;
};
