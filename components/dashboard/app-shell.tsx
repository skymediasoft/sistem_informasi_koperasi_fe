"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Landmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/auth/navigation";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  displayName: string;
  groupName?: string;
  initials: string;
  menu: MenuItem[];
  secondaryMenu: Array<{ label: string; href: string; icon: any }>;
  onLogout: () => void;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  displayName,
  groupName,
  initials,
  menu,
  secondaryMenu,
  onLogout,
  actionLabel,
  onAction,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(() =>
    menu.find((item) => item.children?.some((child) => pathname.startsWith(child.href)))?.label ?? null,
  );

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col overflow-hidden border-r bg-card px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 px-3 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </span>
            kopera<span className="text-accent-foreground">.</span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </Button>
        </div>

        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{groupName || "Koperasi"}</p>
          </div>
        </div>

        <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {menu.map(({ href, icon: Icon, label, children, description }) => {
            const hasChildren = Boolean(children?.length);
            const isOpen = activeMenu === label;
            const isActive = pathname === href || children?.some((child) => pathname.startsWith(child.href));

            return (
              <div key={label} className="relative">
                {hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setActiveMenu((current) => (current === label ? null : label))}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4" />
                      {label}
                    </span>
                    <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <a
                    href={href}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                )}

                {children && isOpen ? (
                  <div className="mt-1 rounded-xl border border-border/70 bg-background p-2 shadow-sm">
                    <div className="mb-2 px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {description || label}
                    </div>
                    {children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-5 flex flex-none flex-col gap-1 border-t pt-4">
          {secondaryMenu.map(({ label, href, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => (label === "Keluar" ? onLogout() : (window.location.hash = href.replace("#", "")))}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="flex items-center justify-between border-b bg-card px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Notifikasi">
              <Bell />
            </Button>
            {actionLabel && onAction ? (
              <Button onClick={onAction}>{actionLabel}</Button>
            ) : null}
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">{children}</section>
      </div>
    </main>
  );
}
