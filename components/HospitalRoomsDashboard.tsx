"use client";

import { useState } from "react";
import { HospitalRoomCard } from "./HospitalRoomCard";
import { HospitalAdmissionModal } from "./HospitalAdmissionModal";

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

  // Filtrează sălile după departament
  const filteredRooms = selectedDepartment === "all"
    ? rooms
    : rooms.filter((r) => r.department === selectedDepartment);

  // Grupează pacienții pe săli
  const patientsByRoom = patients.reduce((acc, patient) => {
    if (!acc[patient.roomId]) {
      acc[patient.roomId] = [];
    }
    acc[patient.roomId].push(patient);
    return acc;
  }, {} as Record<string, HospitalAdmission[]>);

  // Statistici generale
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + r.maxCapacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Statistici */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-dark-200 p-4">
          <p className="text-12-regular text-dark-500">Total Săli</p>
          <p className="text-24-bold text-dark-900">{totalRooms}</p>
        </div>
        <div className="bg-white rounded-lg border border-dark-200 p-4">
          <p className="text-12-regular text-dark-500">Total Paturi</p>
          <p className="text-24-bold text-dark-900">{totalBeds}</p>
        </div>
        <div className="bg-white rounded-lg border border-dark-200 p-4">
          <p className="text-12-regular text-dark-500">Paturi Ocupate</p>
          <p className="text-24-bold text-dark-900">{occupiedBeds}</p>
        </div>
        <div className="bg-white rounded-lg border border-dark-200 p-4">
          <p className="text-12-regular text-dark-500">Rata Ocupare</p>
          <p className="text-24-bold text-dark-900">{occupancyRate}%</p>
        </div>
      </div>

      {/* Filtru departament */}
      <div className="bg-white rounded-lg border border-dark-200 p-4">
        <label className="text-14-semibold text-dark-700 mb-2 block">Filtrează după secție:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment("all")}
            className={`px-4 py-2 rounded-lg text-13-medium transition ${
              selectedDepartment === "all"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-dark-600 hover:bg-gray-200"
            }`}
          >
            Toate ({rooms.length})
          </button>
          {departments.map((dept) => {
            const deptRooms = rooms.filter((r) => r.department === dept);
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg text-13-medium transition ${
                  selectedDepartment === dept
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-dark-600 hover:bg-gray-200"
                }`}
              >
                {DEPARTMENT_LABELS[dept] || dept} ({deptRooms.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid săli */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-lg border border-dark-200 p-8 text-center">
          <p className="text-16-regular text-dark-600">
            Nu există săli pentru secția selectată.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Modal detalii pacient */}
      {selectedPatient && (
        <HospitalAdmissionModal
          admission={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};
