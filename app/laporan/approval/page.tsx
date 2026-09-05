"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { getMenuByRole } from "@/lib/auth/navigation";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const initial = [
  {
    id: "APR-001",
    name: "Siti Aminah",
    type: "Pengajuan pinjaman",
    amount: 12000000,
    date: "Hari ini",
  },
  {
    id: "APR-002",
    name: "Dwi Lestari",
    type: "Penarikan simpanan",
    amount: 2500000,
    date: "Kemarin",
  },
  {
    id: "APR-003",
    name: "Riska Dewi",
    type: "Aset koperasi",
    amount: 4500000,
    date: "Kemarin",
  },
];
export default function ApprovalPage() {
  const [items, setItems] = useState(initial);
  const { logout, user } = useAuth();
  const menu = getMenuByRole(user?.role ?? "administrator", user?.menus);

  return (
    <DashboardShell
      title="Approval center"
      subtitle="Persetujuan"
      displayName={user?.name || "Administrator Koperasi"}
      groupName={user?.groupName || "Koperasi"}
      menu={menu}
      onLogout={logout}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Tinjau dan proses pengajuan yang membutuhkan persetujuan.
          </p>
        </div>
        <Badge variant="secondary">{items.length} menunggu review</Badge>
      </div>
      <Card className="px-4 py-2">
        <CardHeader>
          <CardTitle className="text-base">Pengajuan menunggu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.type}</p>
                    <Badge variant="outline">{item.id}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.name} · {item.date}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="font-semibold">{formatRupiah(item.amount)}</p>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Tolak"
                    onClick={() =>
                      setItems(items.filter((i) => i.id !== item.id))
                    }
                  >
                    <X />
                  </Button>
                  <Button
                    size="icon"
                    aria-label="Setujui"
                    onClick={() =>
                      setItems(items.filter((i) => i.id !== item.id))
                    }
                  >
                    <Check />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Semua pengajuan sudah diproses.
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
