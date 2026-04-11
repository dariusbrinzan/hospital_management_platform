"use client";

import {
  AlertCircle,
  BarChart3,
  Banknote,
  Building2,
  Calendar,
  CalendarDays,
  FileDown,
  FileSpreadsheet,
  FileWarning,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Package,
  Pill,
  ScanSearch,
  Shield,
  ShoppingCart,
  Scissors,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Programări", icon: Calendar },
  { href: "/admin/doctor-calendar", label: "Calendar Medici", icon: CalendarDays },
  { href: "/admin/emergency", label: "Urgențe", icon: AlertCircle },
  { href: "/admin/operating-room", label: "Bloc operator", icon: Scissors },
  { href: "/admin/medications", label: "Medicamente", icon: Pill },
  { href: "/admin/pharmacy", label: "Farmacie", icon: ShoppingCart },
  { href: "/admin/laborator", label: "Laborator", icon: FlaskConical },
  { href: "/admin/patients", label: "Pacienți", icon: Users },
  { href: "/admin/hospitalizations", label: "Spitalizări", icon: Building2 },
  { href: "/admin/cnas-reporting", label: "Raportare CNAS", icon: FileSpreadsheet },
  { href: "/admin/imaging", label: "Imagistică", icon: ScanSearch },
  { href: "/admin/finance", label: "Financiar", icon: Banknote },
  { href: "/admin/lab-import", label: "Import analize", icon: FileDown },
  { href: "/admin/reports", label: "Rapoarte", icon: BarChart3 },
  { href: "/admin/problem-reports", label: "Raportări probleme", icon: FileWarning },
  { href: "/admin/logistics", label: "Logistică", icon: Package },
] as const;

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/80 dark:bg-dark-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <Link href="/admin" prefetch={false} className="inline-flex items-center">
              <Image
                src="/assets/icons/logo-full.svg"
                height={1000}
                width={1000}
                alt="eHealth.ro logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/admin"
              prefetch={false}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 transition hover:border-teal-300 hover:bg-teal-50/60 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-teal-700 dark:hover:bg-teal-950/30 sm:flex"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <Shield className="size-4" />
              </div>
              <span className="max-w-[180px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                Panou Administrator
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Deconectare
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-16 lg:z-0 lg:flex lg:translate-x-0",
            "transition-transform duration-200 ease-out",
            mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full"
          )}
        >
          {mobileOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
          )}
          <div className="relative z-30 flex h-full flex-col overflow-y-auto px-4 py-6 lg:pl-6">
            <nav className="flex flex-col gap-0.5" aria-label="Navigare administrator">
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className="size-5 shrink-0 opacity-80" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} eHealth.ro
          </p>
        </div>
      </footer>
    </div>
  );
}
