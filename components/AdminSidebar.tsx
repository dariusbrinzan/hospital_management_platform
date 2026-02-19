"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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

interface AdminSidebarProps {
  doctors: Doctor[];
  selectedDoctor: string;
}

export const AdminSidebar = ({ doctors, selectedDoctor }: AdminSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSpecialty = searchParams.get("specialty") || "";
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Obține toate specializările unice
  const specialties = useMemo(() => {
    const uniqueSpecialties = Array.from(
      new Set(doctors.map((d) => d.specialty).filter(Boolean))
    ).sort();
    return uniqueSpecialties;
  }, [doctors]);

  // Filtrează doctorii după specializarea selectată
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty || selectedSpecialty === "all") {
      return doctors;
    }
    return doctors.filter((d) => d.specialty === selectedSpecialty);
  }, [doctors, selectedSpecialty]);

  const handleSpecialtyChange = (value: string) => {
    if (value === "all") {
      router.push("/admin");
    } else {
      router.push(`/admin?specialty=${encodeURIComponent(value)}`);
    }
  };

  const handleDoctorChange = (value: string) => {
    if (value === "all") {
      if (selectedSpecialty) {
        router.push(`/admin?specialty=${encodeURIComponent(selectedSpecialty)}`);
      } else {
        router.push("/admin");
      }
    } else {
      const params = new URLSearchParams();
      if (selectedSpecialty) {
        params.set("specialty", selectedSpecialty);
      }
      params.set("doctor", value);
      router.push(`/admin?${params.toString()}`);
    }
  };

  const selectedDoctorData = doctors.find((d) => d.name === selectedDoctor);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 lg:z-auto w-64 flex-shrink-0 bg-white border-r border-dark-200 p-6 space-y-6 h-screen overflow-y-auto transition-transform duration-300`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-16-semibold text-dark-900">Filtre</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <h2 className="text-16-semibold text-dark-900 mb-4 hidden lg:block">Filtre</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-12-semibold text-dark-600 mb-2">
              Specializare
            </label>
            <Select
              value={selectedSpecialty || "all"}
              onValueChange={handleSpecialtyChange}
            >
              <SelectTrigger className="w-full shad-select-trigger">
                <SelectValue placeholder="Selectează specializarea">
                  {selectedSpecialty === "all" || !selectedSpecialty
                    ? "Toate specializările"
                    : selectedSpecialty}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="shad-select-content">
                <SelectItem value="all">Toate specializările</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty || ""} value={specialty || ""}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-12-semibold text-dark-600 mb-2">
              Medic
            </label>
            <Select
              value={selectedDoctor}
              onValueChange={handleDoctorChange}
              disabled={!selectedSpecialty || selectedSpecialty === "all"}
            >
              <SelectTrigger className="w-full shad-select-trigger">
                <SelectValue placeholder="Selectează un doctor">
                  <div className="flex items-center gap-2">
                    {selectedDoctor !== "all" && selectedDoctorData && (
                      <div className="relative flex-shrink-0">
                        <div className="size-6 overflow-hidden rounded-full">
                          <Image
                            src={selectedDoctorData.image}
                            alt={selectedDoctorData.name}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>
                    )}
                    <span className="truncate">
                      {selectedDoctor === "all"
                        ? "Toți doctorii"
                        : selectedDoctorData?.name || selectedDoctor}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="shad-select-content">
                <SelectItem value="all">Toți doctorii</SelectItem>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.name} value={doctor.name}>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <div className="size-6 overflow-hidden rounded-full">
                          <Image
                            src={doctor.image}
                            alt={doctor.name}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      </div>
                      <span>{doctor.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Info box */}
      {selectedSpecialty && selectedSpecialty !== "all" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-12-semibold text-green-800 mb-1">Specializare activă</p>
          <p className="text-14-semibold text-green-900">{selectedSpecialty}</p>
          {selectedDoctor !== "all" && selectedDoctorData && (
            <div className="mt-2 pt-2 border-t border-green-200">
              <p className="text-12-regular text-green-700">Medic selectat:</p>
              <p className="text-13-semibold text-green-900">{selectedDoctorData.name}</p>
            </div>
          )}
        </div>
      )}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-30 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Deschide filtre"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
      </button>
    </>
  );
};
