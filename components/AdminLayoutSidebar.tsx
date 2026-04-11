"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Doctor {
  image: string;
  name: string;
  specialty?: string;
}

type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  primary?: boolean;
};

const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/appointments", label: "Programări", icon: "📅" },
  { href: "/admin/doctor-calendar", label: "Calendar Medici", icon: "🗓️" },
  { href: "/admin/emergency", label: "Urgențe", icon: "🚨", primary: true },
  { href: "/admin/medications", label: "Medicamente", icon: "💊" },
  { href: "/admin/pharmacy", label: "Farmacie", icon: "📦" },
  { href: "/admin/laborator", label: "Laborator", icon: "🔬" },
  { href: "/admin/patients", label: "Pacienți", icon: "👥" },
  { href: "/admin/hospitalizations", label: "Spitalizări", icon: "🏥" },
  { href: "/admin/cnas-reporting", label: "Raportare CNAS", icon: "🧾" },
  { href: "/admin/imaging", label: "Imagistică", icon: "🩻" },
  { href: "/admin/finance", label: "Financiar", icon: "💰" },
  { href: "/admin/lab-import", label: "Import analize", icon: "📋" },
  { href: "/admin/reports", label: "Rapoarte", icon: "📊" },
  { href: "/admin/problem-reports", label: "Raportări probleme", icon: "📝" },
  { href: "/admin/logistics", label: "Logistică", icon: "📦" },
] as const;

interface AdminLayoutSidebarProps {
  doctors: Doctor[];
}

export function AdminLayoutSidebar({ doctors }: AdminLayoutSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedSpecialty = searchParams.get("specialty") || "";
  const selectedDoctor = searchParams.get("doctor") || "all";

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean))).sort() as string[],
    [doctors]
  );
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty || selectedSpecialty === "all") return doctors;
    return doctors.filter((d) => d.specialty === selectedSpecialty);
  }, [doctors, selectedSpecialty]);

  const showDashboardFilters = false;

  const handleSpecialtyChange = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("specialty", value);
    router.push(params.toString() ? `/admin?${params.toString()}` : "/admin");
  };
  const handleDoctorChange = (value: string) => {
    const params = new URLSearchParams();
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (value !== "all") params.set("doctor", value);
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={`fixed bottom-4 right-4 z-30 flex size-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 lg:hidden ${mobileOpen ? "invisible" : ""}`}
        aria-label="Deschide meniul"
      >
        <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:z-auto lg:translate-x-0 lg:shadow-none",
          "shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex flex-col p-4 lg:p-5">
          <div className="flex items-center justify-between pb-3 lg:hidden">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Meniul</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Închide meniul"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="mb-4 flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <Image
              src="/assets/icons/logo-full.svg"
              height={28}
              width={180}
              alt="eHealth.ro"
              className="h-7 w-auto"
            />
          </Link>

          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Panou Administrator
            </p>
          </div>

          <nav className="flex flex-col gap-0.5" aria-label="Navigare administrator">
            {ADMIN_NAV.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
                    ${isActive
                      ? item.primary
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-900/40"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}
                  `}
                >
                  <span className="flex size-6 items-center justify-center text-base leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {showDashboardFilters && (
            <div className="mt-6 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Filtre dashboard
              </h3>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Specializare</label>
                <Select value={selectedSpecialty || "all"} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger className="w-full rounded-lg border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Specializare">
                      {!selectedSpecialty || selectedSpecialty === "all" ? "Toate" : selectedSpecialty}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Medic</label>
                <Select
                  value={selectedDoctor}
                  onValueChange={handleDoctorChange}
                  disabled={!selectedSpecialty || selectedSpecialty === "all"}
                >
                  <SelectTrigger className="w-full rounded-lg border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Medic">
                      {selectedDoctor === "all" || !selectedDoctor ? "Toți doctorii" : selectedDoctor}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toți doctorii</SelectItem>
                    {filteredDoctors.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={d.image}
                            alt=""
                            width={20}
                            height={20}
                            className="rounded-full object-cover"
                          />
                          <span>{d.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
