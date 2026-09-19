"use client";

import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";
import {
  SettingSimpananApi,
  type CreateSimpananPayload,
  type SettingSimpanan,
} from "@/lib/api";
import { showAlert } from "@/lib/alert";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatInputNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const emptyForm: CreateSimpananPayload = {
  SimpananPokok: 0,
  SimpananWajib: 0,
  SimpananSukarela: 0,
};

const getSettingValue = (
  setting: SettingSimpanan | undefined,
  key: keyof CreateSimpananPayload,
) => {
  if (!setting) return 0;

  const value =
    setting[key] ??
    (key === "SimpananPokok" ? setting.profit : setting.tagihan);

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getSettingId = (setting: SettingSimpanan | undefined) => {
  const rawId =
    setting?.ID ??
    (setting as (SettingSimpanan & { id?: number | string }) | undefined)
      ?.id;

  const numericId = Number(rawId);

  return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
};

export default function SettingSimpananPage() {
  const { logout, user } = useAuth();

  const menu = getMenuByRole(
    user?.role ?? "administrator",
    user?.menus,
  );

  const [form, setForm] =
    useState<CreateSimpananPayload>(emptyForm);

  const [savedForm, setSavedForm] =
    useState<CreateSimpananPayload>(emptyForm);

  const [settingId, setSettingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const result = await SettingSimpananApi.findAll();

      const loadedSettings = Array.isArray(result)
        ? result
        : [result];

      const firstSetting = loadedSettings[0];

      const nextSettingId = getSettingId(firstSetting);

      const nextForm: CreateSimpananPayload = {
        SimpananPokok: getSettingValue(
          firstSetting,
          "SimpananPokok",
        ),
        SimpananWajib: getSettingValue(
          firstSetting,
          "SimpananWajib",
        ),
        SimpananSukarela: getSettingValue(
          firstSetting,
          "SimpananSukarela",
        ),
      };

      setSettingId(nextSettingId);
      setSavedForm(nextForm);
      setForm(nextForm);

      console.log("SETTING LOADED:", {
        id: nextSettingId,
        form: nextForm,
      });
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memuat setting simpanan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const validateForm = () => {
    const values = [
      form.SimpananPokok,
      form.SimpananWajib,
      form.SimpananSukarela,
    ];

    return values.every(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0,
    );
  };

  const handleUpdate = async () => {
    if (settingId === null) {
      await showAlert(
        "danger",
        "ID setting simpanan tidak ditemukan.",
      );
      return;
    }

    if (!validateForm()) {
      await showAlert(
        "danger",
        "Nominal simpanan tidak valid.",
      );
      return;
    }

    try {
      setSubmitting(true);

      console.log("UPDATE:", {
        id: settingId,
        payload: form,
      });

      await SettingSimpananApi.update(
        settingId,
        form,
      );

      await showAlert(
        "success",
        "Setting simpanan berhasil diperbarui.",
      );

      await loadSettings();
    } catch (requestError) {
      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui setting simpanan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateApply = async () => {
    if (!validateForm()) {
      await showAlert(
        "danger",
        "Nominal simpanan tidak valid.",
      );
      return;
    }

    try {
      setSubmitting(true);

console.log("UPDATE & APPLY PAYLOAD:", {
  SimpananPokok: form.SimpananPokok,
  SimpananWajib: form.SimpananWajib,
  SimpananSukarela: form.SimpananSukarela,
});

console.log(
  "JSON:",
  JSON.stringify(form),
);

      await SettingSimpananApi.updateApply(form);

      await showAlert(
        "success",
        "Setting simpanan berhasil diperbarui dan diterapkan.",
      );

      await loadSettings();
    } catch (requestError) {
      console.error("UPDATE & APPLY ERROR:", requestError);

      await showAlert(
        "danger",
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui dan menerapkan setting simpanan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (
    key: keyof CreateSimpananPayload,
    value: string,
  ) => {
    const digitsOnly = value.replace(/\D/g, "");

    const numericValue = digitsOnly
      ? Number(digitsOnly)
      : 0;

    setForm((currentForm) => ({
      ...currentForm,
      [key]: Number.isFinite(numericValue)
        ? numericValue
        : 0,
    }));
  };

  return (
    <DashboardShell
      title="Pusat laporan"
      subtitle="Laporan & akuntansi"
      displayName={
        user?.name || "Administrator Koperasi"
      }
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
    >
      <div className="mx-auto w-full">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary">
          <Wallet className="h-5 w-5" />
          <span className="font-medium">
            Setting standar simpanan
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="px-4 py-2">
          <CardHeader>
            <CardTitle className="text-base">
              Laporan simpanan anggota
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Memuat data...
                </p>
              ) : (
                <table className="w-full min-w-105 text-sm">
                  <tbody>
                    {(
                      [
                        "SimpananPokok",
                        "SimpananWajib",
                        "SimpananSukarela",
                      ] as const
                    ).map((key) => (
                      <tr
                        key={key}
                        className="border-b"
                      >
                        <td className="py-3">
                          {key.replace(
                            "Simpanan",
                            "Simpanan ",
                          )}
                        </td>

                        <td className="py-3 text-right font-medium">
                          {formatRupiah(
                            savedForm[key],
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="px-3 py-2">
          <CardHeader>
            <CardTitle className="text-base">
              Ubah Setting Simpanan
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {(
                [
                  "SimpananPokok",
                  "SimpananWajib",
                  "SimpananSukarela",
                ] as const
              ).map((key) => (
                <label
                  key={key}
                  className="grid gap-2 text-sm font-medium text-colors-foreground"
                >
                  {key.replace(
                    "Simpanan",
                    "Simpanan ",
                  )}

                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatInputNumber(
                      form[key],
                    )}
                    onChange={(event) =>
                      handleAmountChange(
                        key,
                        event.target.value,
                      )
                    }
                    disabled={submitting || loading}
                  />
                </label>
              ))}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={
                    submitting ||
                    loading ||
                    settingId === null
                  }
                >
                  {submitting
                    ? "Menyimpan..."
                    : "Update"}
                </Button>

                <Button
                  type="button"
                  onClick={handleUpdateApply}
                  disabled={
                    submitting || loading
                  }
                >
                  {submitting
                    ? "Menerapkan..."
                    : "Update & Apply"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}