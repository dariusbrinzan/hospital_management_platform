"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";
import { Doctors } from "@/constants";
import { formatEmergencyCaseNumber, getWaitingMinutes, formatWaitingTime } from "@/lib/utils";

interface EmergencyCaseCardProps {
  emergencyCase: EmergencyCase;
}

export const EmergencyCaseCard = ({ emergencyCase }: EmergencyCaseCardProps) => {
  const doctor = emergencyCase.assignedDoctorId
    ? Doctors.find((d) => d.name === emergencyCase.assignedDoctorId)
    : null;
  const isCritical = emergencyCase.priority === 1 || emergencyCase.triageLevel === "critic";
  const waitingMinutes =
    emergencyCase.currentState !== "discharge" && emergencyCase.arrivalTime
      ? getWaitingMinutes(emergencyCase.arrivalTime)
      : null;

  const priorityColors: Record<number, string> = {
    1: "bg-red-600 text-white",
    2: "bg-orange-500 text-white",
    3: "bg-amber-500 text-white",
    4: "bg-slate-500 text-white",
    5: "bg-slate-400 text-white",
  };
  const triageLabels: Record<string, string> = {
    critic: "Critic",
    urgent: "Urgent",
    normal: "Normal",
  };

  return (
    <Link
      href={`/admin/emergency/${emergencyCase.$id}`}
      className={`block rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:border-slate-700 ${
        isCritical ? "ring-2 ring-red-400/80 border-red-300 dark:ring-red-500/50 dark:border-red-800" : "border-slate-200/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatEmergencyCaseNumber(emergencyCase.$id)}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {emergencyCase.patient?.name || (emergencyCase as any).patientName || "Pacient necunoscut"}
          </p>
          <p className="truncate text-xs text-slate-600 dark:text-slate-400" title={emergencyCase.chiefComplaint}>
            {emergencyCase.chiefComplaint}
          </p>
          {!emergencyCase.patient && (emergencyCase as any).patientPhone && (
            <p className="mt-0.5 truncate text-xs text-slate-500">Tel: {(emergencyCase as any).patientPhone}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColors[emergencyCase.priority as keyof typeof priorityColors] ?? priorityColors[5]}`}
        >
          P{emergencyCase.priority}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
            emergencyCase.triageLevel === "critic"
              ? "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
              : emergencyCase.triageLevel === "urgent"
              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {triageLabels[emergencyCase.triageLevel] ?? "Normal"}
        </span>
        {waitingMinutes !== null && waitingMinutes > 0 && (
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="size-3" />
            {formatWaitingTime(waitingMinutes)}
          </span>
        )}
      </div>

      {doctor && (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-slate-600">
            <Image src={doctor.image} width={24} height={24} alt="" className="object-cover" />
          </div>
          <p className="truncate text-xs text-slate-600 dark:text-slate-400">{doctor.name}</p>
        </div>
      )}
      {!doctor && (
        <p className="mt-2 text-xs italic text-slate-400 dark:text-slate-500">Fără medic asignat</p>
      )}

      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <User className="size-3" />
        {emergencyCase.arrivalTime
          ? new Date(emergencyCase.arrivalTime).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
          : "—"}
      </p>
    </Link>
  );
};
