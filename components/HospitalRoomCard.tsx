"use client";

import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "./ui/card";

interface HospitalRoomCardProps {
  room: HospitalRoom;
  patients: HospitalAdmission[];
  onPatientClick: (patient: HospitalAdmission) => void;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  cardiology: "Cardiologie",
  surgery: "Chirurgie",
  pediatrics: "Pediatrie",
  orthopedics: "Ortopedie",
  neurology: "Neurologie",
  general: "General",
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  private: "Privat",
  semi_private: "Semi-privat",
  isolation: "Izolare",
};

const STATUS_STYLES: Record<string, string> = {
  admitted: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  stable: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  improving: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300",
  ready_for_discharge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
};

const STATUS_LABELS: Record<string, string> = {
  admitted: "Internat",
  stable: "Stabil",
  improving: "În îmbunătățire",
  ready_for_discharge: "Gata externare",
};

export const HospitalRoomCard = ({ room, patients, onPatientClick }: HospitalRoomCardProps) => {
  const occupancyPercentage = room.maxCapacity > 0 ? (room.currentOccupancy / room.maxCapacity) * 100 : 0;
  const isFull = room.currentOccupancy >= room.maxCapacity;
  const availableBeds = room.maxCapacity - room.currentOccupancy;

  const allBeds = Array.from({ length: room.maxCapacity }, (_, i) => {
    const bedNumber = i + 1;
    const patient = patients.find((p) => p.bedNumber === bedNumber);
    return { bedNumber, patient };
  });

  const getStatusStyle = (status: string) =>
    STATUS_STYLES[status] ?? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;

  return (
    <Card
      className={`overflow-hidden border-2 shadow-sm dark:border-slate-800 ${
        isFull
          ? "border-amber-200/80 dark:border-amber-800/50"
          : "border-slate-200/80"
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Sala {room.roomNumber} — {DEPARTMENT_LABELS[room.department] || room.department}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Etaj {room.floor} · {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {room.currentOccupancy} / {room.maxCapacity} locuri ocupate
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isFull
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
              : "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300"
          }`}
        >
          {isFull ? "Complet" : `${availableBeds} libere`}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyPercentage >= 100
                  ? "bg-amber-500"
                  : occupancyPercentage >= 80
                    ? "bg-amber-400"
                    : "bg-teal-500"
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Paturi
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {allBeds.map(({ bedNumber, patient }) => (
              <button
                key={bedNumber}
                type="button"
                onClick={() => patient && onPatientClick(patient)}
                className={`rounded-lg border p-2 text-left text-xs transition ${
                  patient
                    ? "cursor-pointer border-teal-200 bg-teal-50/50 hover:border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:bg-teal-950/20 dark:hover:bg-teal-900/30"
                    : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50"
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">Pat {bedNumber}</div>
                {patient ? (
                  <div className="mt-1">
                    <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {patient.patientName}
                    </div>
                    <span
                      className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${getStatusStyle(patient.status)}`}
                    >
                      {getStatusLabel(patient.status)}
                    </span>
                    {patient.diagnosis && (
                      <div
                        className="mt-0.5 truncate text-slate-500 dark:text-slate-400"
                        title={patient.diagnosis}
                      >
                        {patient.diagnosis}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-slate-400 dark:text-slate-500">Liber</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
