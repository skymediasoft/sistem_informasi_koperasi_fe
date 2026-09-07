"use client";

import Swal, { type SweetAlertResult } from "sweetalert2";

export type AlertType = "success" | "danger" | "warning" | "info" | "question";

const alertTitles: Record<AlertType, string> = {
  success: "Berhasil",
  danger: "Gagal",
  warning: "Peringatan",
  info: "Informasi",
  question: "Konfirmasi",
};

export function showAlert(type: AlertType, message: string, title?: string) {
  return Swal.fire({
    icon: type === "danger" ? "error" : type,
    title: title ?? alertTitles[type],
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#247a4d",
  });
}

export function showConfirm(message: string, title = "Yakin ingin melanjutkan?"): Promise<SweetAlertResult> {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#247a4d",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });
}