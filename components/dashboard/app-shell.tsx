"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Landmark,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/lib/auth/navigation";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  displayName: string;
  groupName?: string;
  initials?: string;
  menu: MenuItem[];
  secondaryMenu?: MenuItem[];
  onLogout: () => void;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

interface DashboardShellContextValue {
  setPageInfo: (info: {
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => void;
}

const DashboardShellContext =
  createContext<DashboardShellContextValue | null>(null);

export function DashboardShell({
  title,
  subtitle,
  displayName,
  groupName,
  menu,
  onLogout,
  actionLabel,
  onAction,
  children,
}: DashboardShellProps) {
  const shellContext = useContext(DashboardShellContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const [activeMenu, setActiveMenu] = useState<string | null>(() =>
    menu.find((item) =>
      item.children?.some((child) =>
        pathname.startsWith(child.href)
      )
    )?.label ?? null
  );

  useEffect(() => {
    if (!shellContext) {
      return;
    }

    shellContext.setPageInfo({
      title,
      subtitle,
      actionLabel,
      onAction,
    });
  }, [actionLabel, onAction, shellContext, subtitle, title]);

  if (shellContext) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col overflow-hidden border-r bg-card px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 font-semibold"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </span>

            kopera
            <span className="text-accent-foreground">
              .
            </span>
          </Link>

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

        {/* USER */}
        <div className="mt-10 flex items-center gap-3 rounded-2xl bg-secondary p-3">

          <div>
            <p className="text-sm font-semibold">
              {displayName}
            </p>

            <p className="text-xs text-muted-foreground">
              {groupName || "Koperasi"}
            </p>
          </div>
        </div>

        {/* MAIN MENU */}
        <nav className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {menu.map((item) => {
            const {
              href,
              icon: Icon,
              label,
              children,
              description,
            } = item;

            const hasChildren =
              Boolean(children?.length);

            const isActive =
              pathname === href ||
              Boolean(
                children?.some((child) =>
                  pathname.startsWith(child.href)
                )
              );

            const isOpen =
              activeMenu === label;

            return (
              <div
                key={`${label}-${href}`}
                className="relative"
              >
                {/* MENU UTAMA */}
                {hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setActiveMenu((current) =>
                        current === label
                          ? null
                          : label
                      )
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </span>

                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={href}
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                )}

                {/* SECONDARY MENU */}
                {hasChildren && isOpen && (
                  <div className="mt-1 ml-4 rounded-xl border border-border/70 bg-background p-2 shadow-sm">
                    <div className="mb-2 px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {description || label}
                    </div>

                    {children!.map((child) => {
                      const childActive =
                        pathname === child.href ||
                        pathname.startsWith(
                          `${child.href}/`
                        );

                      return (
                        <Link
                          key={`${child.label}-${child.href}`}
                          href={child.href}
                          onClick={() =>
                            setSidebarOpen(false)
                          }
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            childActive
                              ? "bg-secondary font-medium text-foreground"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto border-t pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* CONTENT */}
      <div className="lg:pl-72">
        <header className="flex items-center justify-between border-b bg-card px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Buka menu"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu />
            </Button>

            <div>
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>

              <h1 className="text-xl font-semibold tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifikasi"
            >
              <Bell />
            </Button>

            {actionLabel && onAction ? (
              <Button onClick={onAction}>
                {actionLabel}
              </Button>
            ) : null}
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}

interface DashboardLayoutProps {
  displayName: string;
  groupName?: string;
  menu: MenuItem[];
  onLogout: () => void;
  children: React.ReactNode;
}

export function DashboardLayout({
  displayName,
  groupName,
  menu,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [pageInfo, setPageInfo] = useState<Parameters<DashboardShellContextValue["setPageInfo"]>[0]>({
    title: "Dashboard",
    subtitle: "Koperasi",
  });
  const shellContextValue = useMemo(
    () => ({ setPageInfo }),
    [setPageInfo],
  );

  return (
    <DashboardShell
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      displayName={displayName}
      groupName={groupName}
      menu={menu}
      onLogout={onLogout}
      actionLabel={pageInfo.actionLabel}
      onAction={pageInfo.onAction}
    >
      <DashboardShellContext.Provider value={shellContextValue}>
        {children}
      </DashboardShellContext.Provider>
    </DashboardShell>
  );
}