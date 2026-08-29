import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

export type UserRole =
  | "administrator"
  | "admin-koperasi"
  | "pengurus-koperasi"
  | "anggota";

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  groupId: number;
  groupName: string;
  permissions: string[];
  mustChangePassword: boolean;
  updatedAt?: string;
}

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
  description?: string;
  children?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}

export const DEFAULT_PASSWORD = "koperasi123";

export interface JwtSessionPayload {
  sub: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  groupId: number;
  groupName: string;
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
}

export const buildJwtPayload = (user: AuthSessionUser): JwtSessionPayload => {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: user.id,
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    groupId: user.groupId,
    groupName: user.groupName,
    permissions: user.permissions,
    iat: now,
    exp: now + 60 * 60 * 8,
    iss: "koperasi-app",
  };
};

export const encodeBase64Url = (value: string) => {
  if (typeof window !== "undefined") {
    return window
      .btoa(unescape(encodeURIComponent(value)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

export const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  if (typeof window !== "undefined") {
    return decodeURIComponent(
      escape(window.atob(padded)),
    );
  }

  return Buffer.from(padded, "base64").toString("utf-8");
};

export const createJwtSession = (user: AuthSessionUser) => {
  const payload = buildJwtPayload(user);
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = encodeBase64Url("koperasi-signature");

  return `${header}.${body}.${signature}`;
};

export const decodeJwtSession = (token: string): JwtSessionPayload | null => {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    const [, payloadSegment] = token.split(".");
    const parsed = JSON.parse(decodeBase64Url(payloadSegment)) as JwtSessionPayload;

    if (!parsed?.sub || !parsed?.role || !parsed.exp) {
      return null;
    }

    if (Math.floor(Date.now() / 1000) > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export interface UserCredentialRecord {
  identifier: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
}

export const userCredentialTable: UserCredentialRecord[] = [
  {
    identifier: "administrator@kopera.id",
    password: DEFAULT_PASSWORD,
    role: "administrator",
    name: "Administrator Koperasi",
    email: "administrator@kopera.id",
  },
  {
    identifier: "admin@kopera.id",
    password: DEFAULT_PASSWORD,
    role: "admin-koperasi",
    name: "Admin Koperasi",
    email: "admin@kopera.id",
  },
  {
    identifier: "pengurus@kopera.id",
    password: DEFAULT_PASSWORD,
    role: "pengurus-koperasi",
    name: "Pengurus Koperasi",
    email: "pengurus@kopera.id",
  },
  {
    identifier: "KPR-2024-001",
    password: DEFAULT_PASSWORD,
    role: "anggota",
    name: "Budi Santoso",
    email: "anggota@kopera.id",
  },
];

export const resolveUserByCredentials = (identifier: string, password: string) => {
  const normalizedIdentifier = identifier.trim();
  const matchedUser = userCredentialTable.find(
    (user) =>
      user.identifier.toLowerCase() === normalizedIdentifier.toLowerCase() &&
      user.password === password,
  );

  if (!matchedUser) {
    return null;
  }

  return matchedUser;
};

export const roleLandingPage: Record<UserRole, string> = {
  administrator: "/dashboard",
  "admin-koperasi": "/dashboard",
  "pengurus-koperasi": "/dashboard",
  anggota: "/dashboard",
};

export const roleMenus: Record<UserRole, MenuItem[]> = {
  administrator: [
    {
      label: "Master Data",
      href: "/master-data",
      icon: Settings,
      group: "Master Data",
      description: "Configuration dan data master koperasi",
      children: [
        { label: "Configuration", href: "/master-data/configuration", description: "Setting simpanan, pinjaman, jasa, formulir" },
        { label: "Setting Simpanan", href: "/master-data/configuration" },
        { label: "Setting Pinjaman/Kredit", href: "/master-data/configuration" },
        { label: "Setting Jenis Jasa", href: "/master-data/configuration" },
        { label: "Setting Formulir", href: "/master-data/configuration" },
        { label: "Department", href: "/master-data/department" },
        { label: "Anggota Jasa", href: "/master-data/anggota" },
        { label: "Anggota", href: "/master-data/anggota" },
      ],
    },
    {
      label: "Transaction",
      href: "/transaction",
      icon: CircleDollarSign,
      group: "Transaction",
      description: "Transaksi simpanan, pinjaman, jasa, dan SHU",
      children: [
        { label: "Simpanan", href: "/transaction/simpanan" },
        { label: "Input Simpanan Payroll", href: "/transaction/simpanan" },
        { label: "Pengambilan Simpanan Sukarela", href: "/transaction/simpanan" },
        { label: "Pengambilan Simpanan Resign", href: "/transaction/simpanan" },
        { label: "Input Simpanan Tunai", href: "/transaction/simpanan" },
        { label: "Log Simpanan", href: "/transaction/simpanan" },
        { label: "Pinjaman-Kredit", href: "/transaction/pinjaman-kredit" },
        { label: "Pembayaran Payroll", href: "/transaction/pinjaman-kredit" },
        { label: "Input Pinjaman/Kredit", href: "/transaction/pinjaman-kredit" },
        { label: "Pembayaran Tunai", href: "/transaction/pinjaman-kredit" },
        { label: "Approve Pengajuan", href: "/transaction/pinjaman-kredit" },
        { label: "Verifikasi Pengajuan", href: "/transaction/pinjaman-kredit" },
        { label: "Pelunasan", href: "/transaction/pinjaman-kredit" },
        { label: "Perubahan Lama Angsuran", href: "/transaction/pinjaman-kredit" },
        { label: "Log Pembayaran", href: "/transaction/pinjaman-kredit" },
        { label: "Jasa", href: "/transaction/jasa" },
        { label: "Posting Tagihan Air Listrik", href: "/transaction/jasa" },
        { label: "Posting Kredit Sembako", href: "/transaction/jasa" },
        { label: "Posting Kredit Waserda", href: "/transaction/jasa" },
        { label: "SHU", href: "/transaction/shu" },
        { label: "Posting SHU", href: "/transaction/shu" },
      ],
    },
    {
      label: "Report",
      href: "/report",
      icon: BookOpen,
      group: "Report",
      description: "Laporan simpanan, pinjaman, payroll, dan SHU",
      children: [
        { label: "Laporan Simpanan", href: "/report/simpanan" },
        { label: "Summary Simpanan Anggota", href: "/report/simpanan" },
        { label: "Mutasi Simpanan Anggota", href: "/report/simpanan" },
        { label: "Simpanan", href: "/report/simpanan" },
        { label: "Laporan Pinjaman/Kredit", href: "/report/pinjaman" },
        { label: "Data Pinjaman & Kredit", href: "/report/pinjaman" },
        { label: "Pembayaran Detail", href: "/report/pinjaman" },
        { label: "Pinjaman/Kredit", href: "/report/pinjaman" },
        { label: "Pembayaran", href: "/report/pinjaman" },
        { label: "Profit Lunas", href: "/report/pinjaman" },
        { label: "Piutang", href: "/report/pinjaman" },
        { label: "Profit Berjalan", href: "/report/pinjaman" },
        { label: "Profit Di Tangguhkan", href: "/report/pinjaman" },
        { label: "Balance Piutang - Profit", href: "/report/pinjaman" },
        { label: "Raw Data Pinjaman-Kredit", href: "/report/pinjaman" },
        { label: "Laporan Anggota", href: "/report/simpanan" },
        { label: "Laporan Data Anggota", href: "/report/simpanan" },
        { label: "Laporan Payroll", href: "/report/payroll" },
        { label: "Tagihan Payroll", href: "/report/payroll" },
        { label: "Potongan Payroll Bulan Ini", href: "/report/payroll" },
        { label: "Potongan Payroll History", href: "/report/payroll" },
        { label: "Laporan Pembayaran Jasa", href: "/report/payroll" },
        { label: "Data Pembayaran Listrik/Air/Telpon", href: "/report/payroll" },
        { label: "Summary Profit Listrik/Air/Telpon", href: "/report/payroll" },
        { label: "Tagihan Listrik/Air/Telpon", href: "/report/payroll" },
        { label: "Data Kredit Sembako", href: "/report/payroll" },
        { label: "Summary Profit Sembako", href: "/report/payroll" },
        { label: "Tagihan Kredit Sembako", href: "/report/payroll" },
        { label: "Laporan Profit Total", href: "/report/shu" },
        { label: "Profit Total", href: "/report/shu" },
        { label: "Formulir Koperasi", href: "/report/shu" },
        { label: "List Formulir", href: "/report/shu" },
        { label: "Laporan Kredit Waserda", href: "/report/shu" },
        { label: "Data Kredit Waserda", href: "/report/shu" },
        { label: "Tagihan Kredit Waserda", href: "/report/shu" },
        { label: "Laporan SHU", href: "/report/shu" },
        { label: "Pembagian SHU", href: "/report/shu" },
        { label: "Data Pembagian SHU", href: "/report/shu" },
      ],
    },
    {
      label: "User Account",
      href: "/user-account",
      icon: UserRound,
      group: "User Account",
      description: "Profil dan pengaturan akun pengguna",
      children: [
        { label: "Change My Profile", href: "/user-account/profile" },
        { label: "Change My Password", href: "/user-account/password" },
        { label: "Change Themes", href: "/user-account/theme" },
      ],
    },
  ],
  "admin-koperasi": [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      group: "Dashboard",
      description: "Ringkasan kerja harian",
      children: [
        { label: "Ringkasan harian", href: "/dashboard" },
        { label: "Target bulan", href: "/dashboard" },
      ],
    },
    {
      label: "Simpanan & Pinjaman",
      href: "/transaction",
      icon: CircleDollarSign,
      group: "Transaction",
      description: "Monitoring transaksi dan penagihan",
      children: [
        { label: "Input Simpanan Payroll", href: "/transaction/simpanan" },
        { label: "Pembayaran Payroll", href: "/transaction/pinjaman-kredit" },
        { label: "Pembayaran Tunai", href: "/transaction/pinjaman-kredit" },
        { label: "Approve Pengajuan", href: "/transaction/pinjaman-kredit" },
      ],
    },
    {
      label: "Anggota",
      href: "/master-data",
      icon: Users,
      group: "Master Data",
      description: "Data pemilik rekening dan status keanggotaan",
      children: [
        { label: "Daftar anggota", href: "/master-data/anggota" },
        { label: "Anggota Jasa", href: "/master-data/anggota" },
        { label: "Verifikasi akun", href: "/master-data/anggota" },
      ],
    },
    {
      label: "Laporan",
      href: "/report",
      icon: BookOpen,
      group: "Report",
      description: "Rekap data dan laporan bulanan",
      children: [
        { label: "Laporan bulanan", href: "/report/simpanan" },
        { label: "Rekap simpanan", href: "/report/simpanan" },
        { label: "Rekap pinjaman", href: "/report/pinjaman" },
      ],
    },
    {
      label: "User Account",
      href: "/user-account",
      icon: UserRound,
      group: "User Account",
      description: "Akun, profil, dan personalisasi",
      children: [
        { label: "Change My Profile", href: "/user-account/profile" },
        { label: "Change My Password", href: "/user-account/password" },
      ],
    },
  ],
  "pengurus-koperasi": [
    {
      label: "Monitoring",
      href: "/dashboard",
      icon: LayoutDashboard,
      group: "Dashboard",
      description: "Catatan dan aktivitas pengurus",
      children: [
        { label: "Kegiatan hari ini", href: "/dashboard" },
        { label: "Progress rapat", href: "/dashboard" },
      ],
    },
    {
      label: "Persetujuan",
      href: "/transaction",
      icon: Check,
      group: "Transaction",
      description: "Review transaksi dan persetujuan anggota",
      children: [
        { label: "Approval pinjaman", href: "/transaction/pinjaman-kredit" },
        { label: "Persetujuan simpanan", href: "/transaction/simpanan" },
        { label: "Verifikasi pengajuan", href: "/transaction/pinjaman-kredit" },
      ],
    },
    {
      label: "Keanggotaan",
      href: "/master-data",
      icon: Users,
      group: "Master Data",
      description: "Data anggota dan status kehadiran",
      children: [
        { label: "Data anggota", href: "/master-data/anggota" },
        { label: "Kehadiran", href: "/master-data/department" },
      ],
    },
    {
      label: "Laporan Pengurus",
      href: "/report",
      icon: FileText,
      group: "Report",
      description: "Catatan rapat dan evaluasi bulanan",
      children: [
        { label: "Catatan rapat", href: "/report/shu" },
        { label: "Evaluasi bulan", href: "/report/simpanan" },
      ],
    },
    {
      label: "User Account",
      href: "/user-account",
      icon: UserRound,
      group: "User Account",
      description: "Pengaturan profil dan preferensi",
      children: [
        { label: "Change My Profile", href: "/user-account/profile" },
        { label: "Change My Password", href: "/user-account/password" },
      ],
    },
  ],
  anggota: [
    {
      label: "Ringkasan",
      href: "/dashboard",
      icon: LayoutDashboard,
      group: "Dashboard",
      description: "Informasi keuangan pribadi",
      children: [
        { label: "Saldo saya", href: "/dashboard" },
        { label: "Keuangan", href: "/dashboard" },
      ],
    },
    {
      label: "Simpanan",
      href: "/transaction",
      icon: WalletCards,
      group: "Transaction",
      description: "Riwayat simpanan dan mutasi harian",
      children: [
        { label: "Simpanan wajib", href: "/transaction/simpanan" },
        { label: "Simpanan sukarela", href: "/transaction/simpanan" },
        { label: "Mutasi terbaru", href: "/transaction/simpanan" },
      ],
    },
    {
      label: "Pinjaman",
      href: "/transaction",
      icon: ArrowUpRight,
      group: "Transaction",
      description: "Informasi pinjaman dan angsuran",
      children: [
        { label: "Pinjaman aktif", href: "/transaction/pinjaman-kredit" },
        { label: "Jadwal angsuran", href: "/transaction/pinjaman-kredit" },
      ],
    },
    {
      label: "Profil",
      href: "/user-account",
      icon: UserRound,
      group: "User Account",
      description: "Detail personal dan keamanan akun",
      children: [
        { label: "Profil", href: "/user-account/profile" },
        { label: "Dokumen", href: "/user-account/profile" },
        { label: "Ubah password", href: "/user-account/password" },
      ],
    },
    {
      label: "Laporan",
      href: "/report",
      icon: FileText,
      group: "Report",
      description: "Mutasi, tagihan, dan riwayat aktivitas",
      children: [
        { label: "Mutasi buku anggota", href: "/report/simpanan" },
        { label: "Riwayat transaksi", href: "/report/pinjaman" },
        { label: "Tagihan anggota", href: "/report/payroll" },
      ],
    },
  ],
};

export const secondaryMenu = [
  { label: "Pengaturan", href: "/user-account/profile", icon: Settings },
  { label: "Keluar", href: "/login", icon: ArrowDownLeft },
];

export const getMenuByRole = (role: UserRole) => roleMenus[role] ?? roleMenus.anggota;

export const getSessionFromStorage = (): AuthSessionUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("koperasi_session");
    return raw ? (JSON.parse(raw) as AuthSessionUser) : null;
  } catch {
    return null;
  }
};

export const saveSessionToStorage = (user: AuthSessionUser) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("koperasi_session", JSON.stringify(user));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("koperasi_session");
  window.localStorage.removeItem("koperasi_token");
};

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "KS";

export const getDefaultRoleIdentity = (role: UserRole) => {
  const records: Record<UserRole, { email: string; name: string }> = {
    administrator: { email: "administrator@kopera.id", name: "Administrator Koperasi" },//programmer
    "admin-koperasi": { email: "admin@kopera.id", name: "Admin Koperasi" },
    "pengurus-koperasi": { email: "pengurus@kopera.id", name: "Pengurus Koperasi" },
    anggota: { email: "KPR-2024-001", name: "Budi Santoso" },
  };

  return records[role];
};

export const buildSessionUser = (
  role: UserRole,
  identifier: string,
  password: string,
): AuthSessionUser => {
  const identity = getDefaultRoleIdentity(role);
  const mustChangePassword = password === DEFAULT_PASSWORD;

  const rolePermissions: Record<UserRole, string[]> = {
    administrator: [
      "*",
      "dashboard.read",
      "members.manage",
      "transactions.manage",
      "reports.read",
      "settings.manage",
      "approval.manage",
      "members.read",
      "profile.read",
      "mutations.read",
    ],
    "admin-koperasi": [
      "dashboard.read",
      "members.manage",
      "transactions.manage",
      "reports.read",
    ],
    "pengurus-koperasi": [
      "dashboard.read",
      "approval.manage",
      "members.read",
      "reports.read",
    ],
    anggota: ["dashboard.read", "profile.read", "mutations.read"],
  };

  const roleIds: Record<UserRole, string> = {
    administrator: "ADM-001",
    "admin-koperasi": "AK-001",
    "pengurus-koperasi": "PK-001",
    anggota: "KPR-2024-001",
  };

  const roleGroups: Record<UserRole, { groupId: number; groupName: string }> = {
    administrator: { groupId: 1, groupName: "Administrator" },
    "admin-koperasi": { groupId: 2, groupName: "Admin Koperasi" },
    "pengurus-koperasi": { groupId: 3, groupName: "Pengurus Koperasi" },
    anggota: { groupId: 4, groupName: "Anggota" },
  };

  return {
    id: roleIds[role],
    name: identity.name,
    email: identity.email,
    role,
    groupId: roleGroups[role].groupId,
    groupName: roleGroups[role].groupName,
    permissions: rolePermissions[role],
    mustChangePassword,
    updatedAt: new Date().toISOString(),
  };
};
