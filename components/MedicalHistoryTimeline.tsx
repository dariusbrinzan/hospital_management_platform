"use client";

import { formatDateTime } from "@/lib/utils";
import { Doctors } from "@/constants";
import Image from "next/image";
import { MedicalRecordCard } from "./MedicalRecordCard";
import { AnalysisGroupCard } from "./AnalysisGroupCard";

interface MedicalHistoryTimelineProps {
  medicalRecords: any[];
  allergies: any[];
  vaccinations: any[];
  familyHistory: any[];
  analysisGroups?: any[];
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export const MedicalHistoryTimeline = ({
  medicalRecords,
  allergies,
  vaccinations,
  familyHistory,
  analysisGroups = [],
  patientInfo,
}: MedicalHistoryTimelineProps) => {
  // Combină toate evenimentele și sortează după dată
  const allEvents: any[] = [
    ...medicalRecords.map((r) => ({ ...r, type: "record", date: r.visitDate })),
    ...allergies.map((a) => ({ ...a, type: "allergy", date: a.firstOccurrenceDate || a.createdAt })),
    ...vaccinations.map((v) => ({ ...v, type: "vaccination", date: v.administrationDate })),
    ...analysisGroups.map((g) => ({ ...g, type: "analysis-group", date: g.date })),
  ].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Sortare descendentă (cel mai recent primul)
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "record":
        return "/assets/icons/appointments.svg";
      case "allergy":
        return "/assets/icons/pending.svg";
      case "vaccination":
        return "/assets/icons/appointments.svg";
      case "analysis-group":
        return "/assets/icons/appointments.svg";
      default:
        return "/assets/icons/appointments.svg";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "record":
        return "bg-green-500";
      case "allergy":
        return "bg-red-500";
      case "vaccination":
        return "bg-blue-500";
      case "analysis-group":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-24-semibold text-dark-900">Cronologie Istoric Medical</h2>

      {allEvents.length === 0 ? (
        <div className="rounded-lg border border-dark-200 bg-white p-12 text-center">
          <p className="text-16-regular text-dark-600">
            Nu există înregistrări medicale încă.
          </p>
          <p className="text-14-regular text-dark-500 mt-2">
            Istoricul tău medical va apărea aici după prima consultație.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-dark-200" />

          {/* Events */}
          <div className="space-y-8">
            {allEvents.map((event, index) => {
              const doctor = event.doctorName
                ? Doctors.find((d) => d.name === event.doctorName)
                : null;

              return (
                <div key={`${event.type}-${event.$id || index}`} className="relative flex gap-6">
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full ${getEventColor(
                        event.type
                      )} border-4 border-white shadow-md`}
                    >
                      <Image
                        src={getEventIcon(event.type)}
                        height={24}
                        width={24}
                        alt={event.type}
                        className="h-6 w-6"
                      />
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-8">
                    {event.type === "record" ? (
                      <MedicalRecordCard record={event} doctor={doctor} patientInfo={patientInfo} />
                    ) : event.type === "allergy" ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-18-semibold text-dark-900">
                              Alergie: {event.allergenName}
                            </h3>
                            <p className="text-14-regular text-dark-600 mt-1">
                              Tip: {event.allergenType} • Severitate: {event.severity}
                            </p>
                            {event.symptoms && (
                              <p className="text-14-regular text-dark-500 mt-2">
                                Simptome: {event.symptoms}
                              </p>
                            )}
                          </div>
                          <span className="text-12-regular text-dark-500">
                            {formatDateTime(event.date).date}
                          </span>
                        </div>
                      </div>
                    ) : event.type === "vaccination" ? (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-18-semibold text-dark-900">
                              Vaccinare: {event.vaccineName}
                            </h3>
                            <p className="text-14-regular text-dark-600 mt-1">
                              {event.vaccineType && `Tip: ${event.vaccineType} • `}
                              {event.administeredBy && `Administrat de: ${event.administeredBy}`}
                            </p>
                            {event.nextDoseDate && (
                              <p className="text-14-regular text-blue-600 mt-2">
                                Următoarea doză: {formatDateTime(event.nextDoseDate).date}
                              </p>
                            )}
                          </div>
                          <span className="text-12-regular text-dark-500">
                            {formatDateTime(event.date).date}
                          </span>
                        </div>
                      </div>
                    ) : event.type === "analysis-group" ? (
                      <AnalysisGroupCard analysisGroup={event} patientInfo={patientInfo} />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
