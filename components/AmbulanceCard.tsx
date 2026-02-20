"use client";

import { formatDateTime } from "@/lib/utils";

interface AmbulanceCardProps {
  ambulance: Ambulance;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  available: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  on_mission: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  at_hospital: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  maintenance: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  out_of_service: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const statusLabels: Record<string, string> = {
  available: "Disponibilă",
  on_mission: "În Misiune",
  at_hospital: "La Spital",
  maintenance: "Întreținere",
  out_of_service: "În afara serviciului",
};

export const AmbulanceCard = ({ ambulance }: AmbulanceCardProps) => {
  const statusColor = statusColors[ambulance.status] || statusColors.available;

  return (
    <div className={`rounded-lg border ${statusColor.border} ${statusColor.bg} p-6 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-18-semibold text-dark-900">{ambulance.ambulanceNumber}</h3>
          <p className="text-14-regular text-dark-600">{ambulance.licensePlate}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-12-semibold ${statusColor.text} ${statusColor.bg} border ${statusColor.border}`}>
          {statusLabels[ambulance.status] || ambulance.status}
        </span>
      </div>

      {/* Echipaj */}
      <div className="mb-4">
        <p className="text-14-semibold text-dark-700 mb-2">Echipaj:</p>
        <div className="space-y-1 text-12-regular text-dark-600">
          <p>🚗 Șofer: {ambulance.crew.driver}</p>
          {ambulance.crew.medic && <p>👨‍⚕️ Medic: {ambulance.crew.medic}</p>}
          {ambulance.crew.assistant && <p>👩‍⚕️ Asistent: {ambulance.crew.assistant}</p>}
        </div>
      </div>

      {/* Echipamente */}
      <div className="mb-4">
        <p className="text-14-semibold text-dark-700 mb-2">Echipamente:</p>
        <div className="flex flex-wrap gap-2">
          {ambulance.equipment.defibrillator && (
            <span className="px-2 py-1 bg-white rounded text-11-regular text-dark-600">Defibrilator</span>
          )}
          {ambulance.equipment.oxygen && (
            <span className="px-2 py-1 bg-white rounded text-11-regular text-dark-600">Oxigen</span>
          )}
          {ambulance.equipment.ventilator && (
            <span className="px-2 py-1 bg-white rounded text-11-regular text-dark-600">Ventilator</span>
          )}
          {ambulance.equipment.monitor && (
            <span className="px-2 py-1 bg-white rounded text-11-regular text-dark-600">Monitor</span>
          )}
        </div>
      </div>

      {/* Locație */}
      {ambulance.currentLocation && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-1">Locație:</p>
          <p className="text-12-regular text-dark-600">{ambulance.currentLocation.address}</p>
        </div>
      )}

      {/* Întreținere */}
      {ambulance.nextMaintenanceDate && (
        <div>
          <p className="text-12-regular text-dark-500">
            Următoarea întreținere: {formatDateTime(ambulance.nextMaintenanceDate).dateOnly}
          </p>
        </div>
      )}
    </div>
  );
};
