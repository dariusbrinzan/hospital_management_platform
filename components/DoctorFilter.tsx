"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

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

  const handleDoctorChange = (value: string) => {
    if (value === "all") {
      router.push("/admin");
    } else {
      router.push(`/admin?doctor=${encodeURIComponent(value)}`);
    }
  };

  const selectedDoctorData = doctors.find((d) => d.name === selectedDoctor);

  return (
    <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
      <SelectTrigger className="w-[280px] shad-select-trigger">
        <SelectValue placeholder="Selectează un doctor">
          <div className="flex items-center gap-2">
            {selectedDoctor !== "all" && selectedDoctorData && (
              <Image
                src={selectedDoctorData.image}
                alt={selectedDoctorData.name}
                width={24}
                height={24}
                className="size-6 rounded-full"
              />
            )}
            <span>
              {selectedDoctor === "all"
                ? "Toți doctorii"
                : selectedDoctorData?.specialty
                ? `${selectedDoctor} (${selectedDoctorData.specialty})`
                : selectedDoctor}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="shad-select-content">
        <SelectItem value="all">Toți doctorii</SelectItem>
        {doctors.map((doctor) => (
          <SelectItem key={doctor.name} value={doctor.name}>
            {doctor.specialty ? `${doctor.name} (${doctor.specialty})` : doctor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
