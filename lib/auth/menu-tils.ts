
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Folder,
  Gauge,
  Landmark,
  LayoutDashboard,
  Settings,
  Shield,
  User,
  Users,
  Wallet,
} from "lucide-react";

/**
 * ============================================================
 * NORMALIZE MENU ROUTE
 * ============================================================
 *
 * Backend bisa mengirim:
 *
 * "/dashboard"
 * "dashboard"
 * "/koperasi/member"
 * "koperasi/member"
 *
 * Fungsi ini memastikan route selalu valid
 * untuk Next.js.
 */

export const normalizeMenuRoute = (
  route?: string | null,
): string => {
  if (!route) {
    return "";
  }

  const normalized = route
    .trim()
    .replace(/^\/+/, "");

  if (!normalized) {
    return "";
  }

  return `/${normalized}`;
};

/**
 * ============================================================
 * GET MENU TYPE ICON
 * ============================================================
 *
 * Icon ditentukan berdasarkan nama menu / route.
 *
 * Backend cukup mengirim:
 *
 * {
 *   menuName: "Data Karyawan",
 *   route: "/data-karyawan"
 * }
 *
 * Frontend otomatis memilih icon.
 */

export const getMenuTypeIcon = (
  menuName?: string | null,
  route?: string | null,
) => {
  const value = `${menuName ?? ""} ${
    route ?? ""
  }`.toLowerCase();

  /**
   * Dashboard
   */
  if (
    value.includes("dashboard") ||
    value.includes("home") ||
    value.includes("beranda")
  ) {
    return LayoutDashboard;
  }

  /**
   * Master Data
   */
  if (
    value.includes("master") ||
    value.includes("data")
  ) {
    return Folder;
  }

  /**
   * User
   */
  if (
    value.includes("user") ||
    value.includes("account") ||
    value.includes("pengguna") ||
    value.includes("akun")
  ) {
    return Users;
  }

  /**
   * Member / Anggota
   */
  if (
    value.includes("member") ||
    value.includes("anggota")
  ) {
    return User;
  }

  /**
   * Koperasi
   */
  if (
    value.includes("koperasi") ||
    value.includes("organization") ||
    value.includes("organisasi")
  ) {
    return Building2;
  }

  /**
   * Transaction
   */
  if (
    value.includes("transaction") ||
    value.includes("transaksi") ||
    value.includes("transaksi")
  ) {
    return ClipboardList;
  }

  /**
   * Finance / Keuangan
   */
  if (
    value.includes("finance") ||
    value.includes("financial") ||
    value.includes("keuangan") ||
    value.includes("simpanan") ||
    value.includes("tabungan") ||
    value.includes("kas")
  ) {
    return Wallet;
  }

  /**
   * Report
   */
  if (
    value.includes("report") ||
    value.includes("laporan")
  ) {
    return BarChart3;
  }

  /**
   * Monitoring
   */
  if (
    value.includes("monitoring") ||
    value.includes("monitor") ||
    value.includes("activity") ||
    value.includes("aktivitas")
  ) {
    return Gauge;
  }

  /**
   * Notification
   */
  if (
    value.includes("notification") ||
    value.includes("notifikasi") ||
    value.includes("announcement") ||
    value.includes("pengumuman")
  ) {
    return Bell;
  }

  /**
   * Security
   */
  if (
    value.includes("security") ||
    value.includes("permission") ||
    value.includes("role") ||
    value.includes("akses") ||
    value.includes("keamanan")
  ) {
    return Shield;
  }

  /**
   * Settings
   */
  if (
    value.includes("setting") ||
    value.includes("settings") ||
    value.includes("pengaturan")
  ) {
    return Settings;
  }

  /**
   * Document
   */
  if (
    value.includes("document") ||
    value.includes("dokumen") ||
    value.includes("file")
  ) {
    return FileText;
  }

  /**
   * Default
   */
  return Landmark;
};
