"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { HospitalRoomCard } from "./HospitalRoomCard";
import { HospitalAdmissionModal } from "./HospitalAdmissionModal";
import { DoorOpen, BedDouble, Users, Percent } from "lucide-react";

interface HospitalRoomsDashboardProps {
  rooms: HospitalRoom[];
  patients: HospitalAdmission[];
  departments: string[];
}

const DEPARTMENT_LABELS: Record<string, string> = {
  cardiology: "Cardiologie",
  surgery: "Chirurgie",
  pediatrics: "Pediatrie",
  orthopedics: "Ortopedie",
  neurology: "Neurologie",
  general: "General",
};

export const HospitalRoomsDashboard = ({ rooms, patients, departments }: HospitalRoomsDashboardProps) => {
  const [selectedPatient, setSelectedPatient] = useState<HospitalAdmission | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const filteredRooms =
    selectedDepartment === "all"
      ? rooms
      : rooms.filter((r) => r.department === selectedDepartment);

  const patientsByRoom = patients.reduce((acc, patient) => {
    if (!acc[patient.roomId]) acc[patient.roomId] = [];
    acc[patient.roomId].push(patient);
    return acc;
  }, {} as Record<string, HospitalAdmission[]>);

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + r.maxCapacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : "0";

  const tabs = [
    { id: "all", label: "Toate", count: rooms.length },
    ...departments.map((dept) => ({
      id: dept,
      label: DEPARTMENT_LABELS[dept] || dept,
      count: rooms.filter((r) => r.department === dept).length,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
              <DoorOpen className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalRooms}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total săli</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <BedDouble className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalBeds}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total paturi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{occupiedBeds}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Paturi ocupate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400">
              <Percent className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{occupancyRate}%</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata ocupare</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Filtrează după secție
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selectați o secție pentru a vedea doar sălile din acel departament.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedDepartment(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDepartment === tab.id
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredRooms.length === 0 ? (
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu există săli pentru secția selectată.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <HospitalRoomCard
              key={room.$id}
              room={room}
              patients={patientsByRoom[room.$id] || []}
              onPatientClick={(patient) => setSelectedPatient(patient)}
            />
          ))}
        </div>
      )}

      {selectedPatient && (
        <HospitalAdmissionModal
          admission={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};
