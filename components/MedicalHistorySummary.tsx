"use client";

import Image from "next/image";

interface MedicalHistorySummaryProps {
  patient: any;
  medicalRecords: any[];
  allergies: any[];
  vaccinations: any[];
  vitalSignsHistory: any[];
}

export const MedicalHistorySummary = ({
  patient,
  medicalRecords,
  allergies,
  vaccinations,
  vitalSignsHistory,
}: MedicalHistorySummaryProps) => {
  const activeAllergies = allergies.filter((a) => a.status === "active");
  const latestVitals = vitalSignsHistory[0];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Consultații */}
      <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-green-100 p-3">
            <Image
              src="/assets/icons/appointments.svg"
              height={24}
              width={24}
              alt="consultations"
              className="h-6 w-6"
            />
          </div>
          <div>
            <p className="text-32-bold text-dark-900">{medicalRecords.length}</p>
            <p className="text-14-regular text-dark-600">Consultații totale</p>
          </div>
        </div>
      </div>

      {/* Alergii Active */}
      <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-red-100 p-3">
            <Image
              src="/assets/icons/pending.svg"
              height={24}
              width={24}
              alt="allergies"
              className="h-6 w-6"
            />
          </div>
          <div>
            <p className="text-32-bold text-dark-900">{activeAllergies.length}</p>
            <p className="text-14-regular text-dark-600">Alergii active</p>
          </div>
        </div>
      </div>

      {/* Vaccinări */}
      <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Image
              src="/assets/icons/appointments.svg"
              height={24}
              width={24}
              alt="vaccinations"
              className="h-6 w-6"
            />
          </div>
          <div>
            <p className="text-32-bold text-dark-900">{vaccinations.length}</p>
            <p className="text-14-regular text-dark-600">Vaccinări</p>
          </div>
        </div>
      </div>

      {/* Ultimele Semne Vitale */}
      <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-purple-100 p-3">
            <Image
              src="/assets/icons/appointments.svg"
              height={24}
              width={24}
              alt="vitals"
              className="h-6 w-6"
            />
          </div>
          <div>
            {latestVitals ? (
              <>
                <p className="text-20-semibold text-dark-900">
                  {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                </p>
                <p className="text-14-regular text-dark-600">Tensiune (ultima măsurătoare)</p>
              </>
            ) : (
              <>
                <p className="text-20-semibold text-dark-900">-</p>
                <p className="text-14-regular text-dark-600">Fără măsurători</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
