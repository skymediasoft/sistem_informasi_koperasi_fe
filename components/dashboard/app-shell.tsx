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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        className={[
          "fixed inset-y-0 left-0 z-40 flex h-dvh flex-col",
          "border-r bg-card py-6",
          "transition-[width,transform] duration-200",
          "lg:translate-x-0",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
          sidebarCollapsed
            ? "w-20 px-3"
            : "w-72 px-5",
        ].join(" ")}
      >
        {/* LOGO */}
        <div
          className={[
            "flex shrink-0 items-center",
            sidebarCollapsed
              ? "justify-center"
              : "justify-between",
          ].join(" ")}
        >
          <Link
            href="/"
            className={[
              "flex items-center",
              sidebarCollapsed
                ? "justify-center"
                : "gap-2 px-3",
            ].join(" ")}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </span>

            {!sidebarCollapsed && (
              <span className="font-semibold">
                kopera
                <span className="text-accent-foreground">.</span>
              </span>
            )}
          </Link>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            className="ml-auto lg:hidden"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="size-5" />
            </span>
          </button>
        </div>

        {/* USER */}
        <div
          className={[
            "mt-10 flex shrink-0 items-center rounded-2xl bg-secondary p-3",
            sidebarCollapsed
              ? "justify-center"
              : "gap-3",
          ].join(" ")}
        >
          {/* Avatar / Initial */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {displayName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {groupName || "Koperasi"}
              </p>
            </div>
          )}
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

            const hasChildren = Boolean(children?.length);

            const isActive =
              pathname === href ||
              Boolean(
                children?.some((child) =>
                  pathname.startsWith(child.href)
                )
              );

            const isOpen = activeMenu === label;

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
                    aria-label={
                      sidebarCollapsed
                        ? label
                        : undefined
                    }
                    title={
                      sidebarCollapsed
                        ? label
                        : undefined
                    }
                    onClick={() => {
                      if (sidebarCollapsed) {
                        setSidebarCollapsed(false);
                        setActiveMenu(label);
                        return;
                      }

                      setActiveMenu((current) =>
                        current === label
                          ? null
                          : label
                      );
                    }}
                    className={[
                      "flex w-full items-center rounded-xl py-3 text-sm font-medium transition-colors",
                      sidebarCollapsed
                        ? "justify-center px-0"
                        : "justify-between gap-3 px-3",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex items-center",
                        sidebarCollapsed
                          ? "justify-center"
                          : "gap-3",
                      ].join(" ")}
                    >
                      <Icon className="size-4 shrink-0" />

                      {!sidebarCollapsed && (
                        <span>{label}</span>
                      )}
                    </span>

                    {!sidebarCollapsed && (
                      <ChevronDown
                        className={[
                          "size-4 transition-transform",
                          isOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={href}
                    title={
                      sidebarCollapsed
                        ? label
                        : undefined
                    }
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={[
                      "flex w-full items-center rounded-xl py-3 text-sm font-medium transition-colors",
                      sidebarCollapsed
                        ? "justify-center px-0"
                        : "gap-3 px-3",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="size-4 shrink-0" />

                    {!sidebarCollapsed && (
                      <span>{label}</span>
                    )}
                  </Link>
                )}

                {/* SECONDARY MENU */}
                {hasChildren &&
                  isOpen &&
                  !sidebarCollapsed && (
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
                            className={[
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-secondary font-medium text-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            ].join(" ")}
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
        <div className="mt-auto shrink-0 border-t pt-4">
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar"
            title="Keluar"
            className={[
              "flex w-full items-center rounded-xl py-3 text-sm font-medium text-muted-foreground transition-colors",
              sidebarCollapsed
                ? "justify-center px-0"
                : "gap-3 px-3 text-left",
              "hover:bg-destructive/10 hover:text-destructive",
            ].join(" ")}
          >
            <LogOut className="size-4 shrink-0" />

            {!sidebarCollapsed && (
              <span>Keluar</span>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CONTENT */}
      <div
        className={[
          "transition-[padding] duration-200",
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-72",
        ].join(" ")}
      >
        <header className="flex items-center justify-between border-b bg-card px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* MOBILE TOGGLE */}
            <button
              type="button"
              className="inline-flex lg:hidden"
              aria-label={
                sidebarOpen
                  ? "Tutup sidebar"
                  : "Buka sidebar"
              }
              onClick={() =>
                setSidebarOpen((current) => !current)
              }
            >
              <span className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {sidebarOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </span>
            </button>

            {/* DESKTOP TOGGLE */}
            <button
              type="button"
              className="hidden lg:inline-flex"
              aria-label={
                sidebarCollapsed
                  ? "Buka sidebar"
                  : "Tutup sidebar"
              }
              onClick={() =>
                setSidebarCollapsed(
                  (current) => !current
                )
              }
            >
              <span className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {sidebarCollapsed ? (
                  <Menu className="size-5" />
                ) : (
                  <X className="size-5" />
                )}
              </span>
            </button>

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
  const [pageInfo, setPageInfo] = useState<
    Parameters<
      DashboardShellContextValue["setPageInfo"]
    >[0]
  >({
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
      groupName={groupName || "Koperasi"}
      menu={menu}
      onLogout={onLogout}
      actionLabel={pageInfo.actionLabel}
      onAction={pageInfo.onAction}
    >
      <DashboardShellContext.Provider
        value={shellContextValue}
      >
        {children}
      </DashboardShellContext.Provider>
    </DashboardShell>
  );
}

