"use client";

import { useState } from "react";
import { ICURoom, ICUPatient } from "@/types";
import { ICURoomCard } from "./ICURoomCard";
import { ICUPatientModal } from "./ICUPatientModal";

interface ICURoomsDashboardProps {
  rooms: ICURoom[];
  patients: ICUPatient[];
}

export const ICURoomsDashboard = ({ rooms, patients }: ICURoomsDashboardProps) => {
  const [selectedPatient, setSelectedPatient] = useState<ICUPatient | null>(null);

  // Grupează pacienții pe săli
  const patientsByRoom = patients.reduce((acc, patient) => {
    if (!acc[patient.roomId]) {
      acc[patient.roomId] = [];
    }
    acc[patient.roomId].push(patient);
    return acc;
  }, {} as Record<string, ICUPatient[]>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <ICURoomCard
            key={room.$id}
            room={room}
            patients={patientsByRoom[room.$id] || []}
            onPatientClick={(patient) => setSelectedPatient(patient)}
          />
        ))}
      </div>

      {selectedPatient && (
        <ICUPatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};
