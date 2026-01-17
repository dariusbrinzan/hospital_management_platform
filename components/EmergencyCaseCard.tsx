"use client";

import Image from "next/image";
import Link from "next/link";
import { EmergencyCase } from "@/types";
import { Doctors } from "@/constants";

interface EmergencyCaseCardProps {
  emergencyCase: EmergencyCase;
}

export const EmergencyCaseCard = ({ emergencyCase }: EmergencyCaseCardProps) => {
  const doctor = emergencyCase.assignedDoctorId
    ? Doctors.find((d) => d.name === emergencyCase.assignedDoctorId)
    : null;

  const priorityColors = {
    1: "bg-red-500 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-yellow-500 text-white",
    4: "bg-blue-500 text-white",
    5: "bg-gray-500 text-white",
  };

  const triageColors = {
    critic: "bg-red-100 text-red-800 border-red-300",
    urgent: "bg-orange-100 text-orange-800 border-orange-300",
    normal: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <Link
      href={`/admin/emergency/${emergencyCase.$id}`}
      className="block bg-white rounded-lg border border-dark-200 p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-14-semibold text-dark-700 truncate">
            {emergencyCase.patient?.name || (emergencyCase as any).patientName || "Pacient necunoscut"}
          </p>
          <p className="text-12-regular text-dark-500 truncate">
            {emergencyCase.chiefComplaint}
          </p>
          {!emergencyCase.patient && (emergencyCase as any).patientPhone && (
            <p className="text-11-regular text-dark-400 truncate">
              Tel: {(emergencyCase as any).patientPhone}
            </p>
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${priorityColors[emergencyCase.priority as keyof typeof priorityColors] || priorityColors[5]}`}
        >
          P{emergencyCase.priority}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${triageColors[emergencyCase.triageLevel] || triageColors.normal}`}
        >
          {emergencyCase.triageLevel === "critic"
            ? "Critic"
            : emergencyCase.triageLevel === "urgent"
            ? "Urgent"
            : "Normal"}
        </span>
      </div>

      {doctor && (
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-shrink-0">
            <div className="size-6 overflow-hidden rounded-full border border-dark-300">
              <Image
                src={doctor.image}
                width={24}
                height={24}
                alt="doctor"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
          <p className="text-xs text-dark-600 truncate">{doctor.name}</p>
        </div>
      )}

      {!doctor && (
        <p className="text-xs text-dark-400 italic mt-2">Fără medic asignat</p>
      )}

      <div className="mt-2 text-xs text-dark-500">
        {new Date(emergencyCase.arrivalTime).toLocaleTimeString("ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </Link>
  );
};
