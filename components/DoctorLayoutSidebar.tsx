"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutDoctor } from "@/lib/actions/auth.actions";

const DOCTOR_NAV = [
  { href: "/doctor", label: "Programări", icon: "📅" },
  { href: "/doctor/messages", label: "Mesaje", icon: "✉️" },
] as const;

interface DoctorLayoutSidebarProps {
  doctorName: string;
}

export function DoctorLayoutSidebar({ doctorName }: DoctorLayoutSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutDoctor();
    window.location.href = "/";
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
            href="/doctor"
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
            <p className="text-12-semibold text-dark-500">Panou Medic</p>
            <p className="truncate text-14-semibold text-dark-900">{doctorName}</p>
          </div>

          <nav className="flex flex-col gap-0.5" aria-label="Navigare medic">
            {DOCTOR_NAV.map((item) => {
              const isActive = item.href === "/doctor" ? pathname === "/doctor" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-14-medium transition-colors
                    focus-visible:outline focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
                    ${isActive ? "bg-green-50 text-green-800 hover:bg-green-100" : "text-dark-700 hover:bg-dark-100"}
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

          <div className="mt-auto border-t border-dark-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-14-medium text-dark-600 hover:bg-red-50 hover:text-red-700"
            >
              <span aria-hidden>🚪</span>
              <span>Deconectare</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
