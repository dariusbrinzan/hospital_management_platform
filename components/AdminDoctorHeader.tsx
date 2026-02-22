"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutDoctor } from "@/lib/actions/auth.actions";
import { DoctorNotificationsDropdown } from "./DoctorNotificationsDropdown";

interface AdminDoctorHeaderProps {
  doctorName: string;
}

export const AdminDoctorHeader = ({ doctorName }: AdminDoctorHeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutDoctor();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-dark-200 shadow-sm">
      <div className="flex h-14 min-h-14 items-center px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="flex flex-shrink-0 items-center gap-3">
            <Link href="/admin" className="cursor-pointer" aria-label="Acasă">
              <Image
                src="/assets/icons/logo-full.svg"
                height={32}
                width={200}
                alt="eHealth.ro logo"
                className="h-8 w-fit"
              />
            </Link>
            <span className="hidden border-l border-dark-200 pl-3 text-sm font-medium text-dark-500 lg:block">
              Panou Medic — {doctorName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/messages"
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Mesaje
            </Link>
            <DoctorNotificationsDropdown />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-dark-200 bg-white px-4 py-2 text-sm font-medium text-dark-600 hover:bg-gray-50"
            >
              Deconectare
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
