"use client";

import { HospitalRoom, HospitalAdmission } from "@/types";
import { formatDateTime } from "@/lib/utils";

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

export const HospitalRoomCard = ({ room, patients, onPatientClick }: HospitalRoomCardProps) => {
  const occupancyPercentage = (room.currentOccupancy / room.maxCapacity) * 100;
  const isFull = room.currentOccupancy >= room.maxCapacity;
  const availableBeds = room.maxCapacity - room.currentOccupancy;

  // Creează array cu toate paturile (ocupate și libere)
  const allBeds = Array.from({ length: room.maxCapacity }, (_, i) => {
    const bedNumber = i + 1;
    const patient = patients.find((p) => p.bedNumber === bedNumber);
    return { bedNumber, patient };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "admitted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "stable":
        return "bg-green-100 text-green-800 border-green-300";
      case "improving":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "ready_for_discharge":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "admitted":
        return "Internat";
      case "stable":
        return "Stabil";
      case "improving":
        return "În îmbunătățire";
      case "ready_for_discharge":
        return "Gata externare";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-dark-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-18-semibold">
            Sala {room.roomNumber} - {DEPARTMENT_LABELS[room.department] || room.department}
          </h3>
          <p className="text-12-regular text-dark-500">
            Etaj {room.floor} • {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
          </p>
          <p className="text-12-regular text-dark-500 mt-1">
            {room.currentOccupancy} / {room.maxCapacity} locuri ocupate
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isFull ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}>
          {isFull ? "Complet" : `${availableBeds} locuri libere`}
        </div>
      </div>

      {/* Bară de progres ocupare */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              occupancyPercentage >= 100
                ? "bg-red-500"
                : occupancyPercentage >= 80
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Lista de paturi */}
      <div className="space-y-2">
        <h4 className="text-14-semibold mb-2">Paturi:</h4>
        <div className="grid grid-cols-2 gap-2">
          {allBeds.map(({ bedNumber, patient }) => (
            <div
              key={bedNumber}
              className={`p-2 rounded border text-xs ${
                patient
                  ? "border-dark-300 bg-blue-50 cursor-pointer hover:bg-blue-100"
                  : "border-gray-200 bg-gray-50"
              }`}
              onClick={() => patient && onPatientClick(patient)}
            >
              <div className="font-semibold">Pat {bedNumber}</div>
              {patient ? (
                <div className="mt-1">
                  <div className="truncate font-medium">{patient.patientName}</div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs mt-1 ${getStatusColor(patient.status)}`}>
                    {getStatusLabel(patient.status)}
                  </span>
                  {patient.diagnosis && (
                    <div className="text-gray-600 mt-0.5 truncate" title={patient.diagnosis}>
                      {patient.diagnosis}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 mt-1">Liber</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
