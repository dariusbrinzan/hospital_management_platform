"use client";

import { Button } from "./ui/button";

interface ICURoomCardProps {
  room: ICURoom;
  patients: ICUPatient[];
  onPatientClick: (patient: ICUPatient) => void;
}

export const ICURoomCard = ({ room, patients, onPatientClick }: ICURoomCardProps) => {
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
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "deteriorating":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "stable":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "improving":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-dark-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-18-semibold">Sală ATI {room.roomNumber}</h3>
          <p className="text-12-regular text-dark-500">
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
                  <div className="truncate font-medium">{patient.patientName || "Pacient necunoscut"}</div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs mt-1 ${getStatusColor(patient.status)}`}>
                    {patient.status === "critical" ? "Critic" :
                     patient.status === "deteriorating" ? "În agravare" :
                     patient.status === "stable" ? "Stabil" :
                     "În îmbunătățire"}
                  </span>
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
