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

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/emergency", label: "Urgente", icon: "🚨", primary: true },
  { href: "/admin/medications", label: "Medicamente", icon: "💊" },
  { href: "/admin/patients", label: "Pacienți", icon: "👥" },
  { href: "/admin/hospitalizations", label: "Spitalizări", icon: "🏥" },
  { href: "/admin/imaging", label: "Imagistică", icon: "🩻" },
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

  const showDashboardFilters = pathname === "/admin";

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
        className={`fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 lg:hidden ${mobileOpen ? "invisible" : ""}`}
        aria-label="Deschide meniul"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-72 flex-shrink-0 flex-col overflow-y-auto border-r border-dark-200 bg-white shadow-lg
          transition-transform duration-200 ease-out lg:sticky lg:z-auto lg:translate-x-0 lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col p-4 lg:p-5">
          <div className="flex items-center justify-between pb-3 lg:hidden">
            <span className="text-16-semibold text-dark-900">Meniul</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-dark-500 hover:bg-dark-100"
              aria-label="Închide meniul"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="mb-4 flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <Image
              src="/assets/icons/logo-full.svg"
              height={28}
              width={180}
              alt="eHealth.ro"
              className="h-7 w-auto"
            />
          </Link>

          <div className="mb-4 rounded-lg border border-dark-200 bg-dark-50 px-3 py-2">
            <p className="text-12-semibold text-dark-500">Panou Administrator</p>
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
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-14-medium transition-colors
                    focus-visible:outline focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
                    ${isActive
                      ? item.primary
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-green-50 text-green-800 hover:bg-green-100"
                      : "text-dark-700 hover:bg-dark-100"}
                  `}
                >
                  <span className="flex h-6 w-6 items-center justify-center text-base" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {showDashboardFilters && (
            <div className="mt-6 space-y-4 border-t border-dark-200 pt-4">
              <h3 className="text-12-semibold uppercase tracking-wide text-dark-500">
                Filtre dashboard
              </h3>
              <div>
                <label className="mb-1.5 block text-12-semibold text-dark-600">Specializare</label>
                <Select value={selectedSpecialty || "all"} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger className="w-full">
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
                <label className="mb-1.5 block text-12-semibold text-dark-600">Medic</label>
                <Select
                  value={selectedDoctor}
                  onValueChange={handleDoctorChange}
                  disabled={!selectedSpecialty || selectedSpecialty === "all"}
                >
                  <SelectTrigger className="w-full">
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
