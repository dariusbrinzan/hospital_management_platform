"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMemo } from "react";

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

export const DoctorFilter = ({
  doctors,
  selectedDoctor,
}: {
  doctors: Doctor[];
  selectedDoctor: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSpecialty = searchParams.get("specialty") || "";

  // Obține toate specializările unice
  const specialties = useMemo(() => {
    const uniqueSpecialties = Array.from(
      new Set(doctors.map((d) => d.specialty).filter((s): s is string => Boolean(s)))
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
    <div className="flex items-center gap-2">
      <Select
        value={selectedSpecialty || "all"}
        onValueChange={handleSpecialtyChange}
      >
        <SelectTrigger className="w-[200px] shad-select-trigger">
          <SelectValue placeholder="Selectează specializarea">
            {selectedSpecialty === "all" || !selectedSpecialty
              ? "Toate specializările"
              : selectedSpecialty}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="shad-select-content">
          <SelectItem value="all">Toate specializările</SelectItem>
          {specialties.map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDoctor}
        onValueChange={handleDoctorChange}
        disabled={!selectedSpecialty || selectedSpecialty === "all"}
      >
        <SelectTrigger className="w-[280px] shad-select-trigger">
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
              <span>
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
  );
};
