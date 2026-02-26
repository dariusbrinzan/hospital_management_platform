"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, FileText, Menu, MessageSquare, Pill, ScanSearch, Stethoscope, Users, X } from "lucide-react";
import { useState } from "react";

import { logoutDoctor } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";
import { DoctorNotificationsDropdown } from "@/components/DoctorNotificationsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/doctor", label: "Programări", icon: Stethoscope },
  { href: "/doctor/calendar", label: "Calendar", icon: Calendar },
  { href: "/doctor/patients", label: "Istoric pacienți", icon: Users },
  { href: "/doctor/consultations", label: "Consultații / Rapoarte", icon: FileText },
  { href: "/doctor/prescriptions", label: "Rețete emise", icon: Pill },
  { href: "/doctor/imaging", label: "Imagistică", icon: ScanSearch },
  { href: "/doctor/messages", label: "Mesaje", icon: MessageSquare },
];

export function DoctorLayoutClient({
  doctorName,
  children,
}: {
  doctorName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutDoctor();
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
              aria-label={mobileOpen ? "Inchide meniul" : "Deschide meniul"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <Link href="/doctor" prefetch={false} className="inline-flex items-center">
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
            <DoctorNotificationsDropdown />
            <ThemeToggle />
            <Link
              href="/doctor/profile"
              prefetch={false}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 transition hover:border-teal-300 hover:bg-teal-50/60 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-teal-700 dark:hover:bg-teal-950/30"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <Stethoscope className="size-4" />
              </div>
              <span className="max-w-[180px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {doctorName}
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
          <div className="relative z-30 flex h-full flex-col overflow-y-auto py-6 pl-4 pr-4 lg:pl-6">
            <nav className="flex flex-col gap-0.5" aria-label="Navigare medic">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = href === "/doctor" ? pathname === "/doctor" : pathname.startsWith(href);
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
