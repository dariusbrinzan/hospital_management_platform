"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  FileText,
  FlaskConical,
  MapPin,
  MessageSquare,
  PenLine,
  Pill,
  User,
  Bell,
  Stethoscope,
  HelpCircle,
  AlertCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "dashboard", label: "Dashboard", icon: Stethoscope },
  { href: "medical-history", label: "Istoric Medical", icon: FileText },
  { href: "prescriptions", label: "Rețete", icon: Pill },
  { href: "medication-requests", label: "Cereri medicamente", icon: ClipboardList },
  { href: "lab-results", label: "Analize Medicale", icon: FlaskConical },
  { href: "calendar", label: "Calendar", icon: Calendar },
  { href: "signature", label: "Consimțământ Pacient", icon: PenLine },
  { href: "profile", label: "Profil Medical", icon: User },
  { href: "hospital-map", label: "Hartă Spital", icon: MapPin },
  { href: "messages", label: "Mesaje", icon: MessageSquare },
  { href: "report-problem", label: "Raportează o problemă", icon: AlertCircle },
];

export function PatientLayoutClient({
  userId,
  patientName,
  children,
}: {
  userId: string;
  patientName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = `/patients/${userId}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/80 dark:bg-dark-800">
      {/* Top bar - always visible */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <Link
              href={`${base}/dashboard`}
              prefetch={false}
              className="inline-flex items-center"
            >
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
            <Link
              href={`${base}/new-appointment`}
              prefetch={false}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Calendar className="size-4" />
              Programare nouă
            </Link>
            <Link href="/faq" prefetch={false} className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <HelpCircle className="size-4" />
              FAQ
            </Link>
            <NotificationsDropdown userId={userId} />
            <ThemeToggle />
            <Link
              href={`${base}/profile`}
              prefetch={false}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 transition-colors hover:bg-slate-100 hover:border-teal-200 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:hover:border-teal-800"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <User className="size-4" />
              </div>
              <span className="max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {patientName}
              </span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - desktop always visible, mobile as overlay */}
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
          <div className="relative z-30 flex h-full flex-col overflow-y-auto py-6 pl-4 pr-4 lg:pl-6">
            <nav className="flex flex-col gap-0.5" aria-label="Navigare pacient">
              {navItems.map(({ href, label, icon: Icon }) => {
                const fullHref = href === "dashboard" ? `${base}/dashboard` : `${base}/${href}`;
                const isActive =
                  href === "dashboard"
                    ? pathname === `${base}/dashboard`
                    : pathname.startsWith(fullHref);
                return (
                  <Link
                    key={href}
                    href={fullHref}
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
            <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
              <Link
                href={`${base}/new-appointment`}
                prefetch={false}
                className="flex items-center gap-3 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 lg:hidden"
              >
                <Calendar className="size-5" />
                Programare nouă
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
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
