"use client";

import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { Doctor } from "@/types";
import { AnalysisResultDisplay } from "./AnalysisResultDisplay";

interface MedicalRecordCardProps {
  record: any;
  doctor: Doctor | undefined;
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export const MedicalRecordCard = ({ record, doctor, patientInfo }: MedicalRecordCardProps) => {
  const hasDiagnoses = record.diagnoses && record.diagnoses.length > 0;
  const hasPrescriptions = record.prescriptions && record.prescriptions.length > 0;
  const hasVitalSigns = record.vitalSigns;
  const hasLabResults = record.labResults && record.labResults.length > 0;

  return (
    <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {doctor && (
            <div className="relative flex-shrink-0">
              <div className="size-12 overflow-hidden rounded-full border-2 border-green-500">
                <Image
                  src={doctor.image}
                  width={48}
                  height={48}
                  alt="doctor"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}
          <div>
            <h3 className="text-18-semibold text-dark-900">
              {record.recordType === "consultation" ? "Consultație Medicală" : record.recordType}
            </h3>
            <p className="text-14-regular text-dark-600">
              {doctor?.name || record.doctorName} • {doctor?.specialty}
            </p>
          </div>
        </div>
        <span className="text-12-regular text-dark-500 whitespace-nowrap">
          {formatDateTime(record.visitDate).dateTime}
        </span>
      </div>

      {/* Chief Complaint */}
      {record.chiefComplaint && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-1">Motiv consultație:</p>
          <p className="text-14-regular text-dark-600">{record.chiefComplaint}</p>
        </div>
      )}

      {/* Assessment */}
      {record.assessment && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-1">Evaluare:</p>
          <p className="text-14-regular text-dark-600">{record.assessment}</p>
        </div>
      )}

      {/* Diagnoses */}
      {hasDiagnoses && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-2">Diagnosticuri:</p>
          <div className="flex flex-wrap gap-2">
            {record.diagnoses.map((diagnosis: any) => (
              <span
                key={diagnosis.$id}
                className={`inline-flex items-center rounded-full px-3 py-1 text-12-semibold ${
                  diagnosis.status === "active"
                    ? "bg-red-100 text-red-700"
                    : diagnosis.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {diagnosis.diagnosisName}
                {diagnosis.diagnosisCode && ` (${diagnosis.diagnosisCode})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {hasPrescriptions && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-2">Medicamente prescrise:</p>
          <div className="space-y-2">
            {record.prescriptions.map((prescription: any) => (
              <div
                key={prescription.$id}
                className="rounded-md bg-blue-50 p-3 border border-blue-200"
              >
                <p className="text-14-semibold text-dark-900">
                  {prescription.medicationName}
                </p>
                <p className="text-12-regular text-dark-600">
                  {prescription.dosage} • {prescription.frequency}
                  {prescription.instructions && ` • ${prescription.instructions}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vital Signs */}
      {hasVitalSigns && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-2">Semne vitale:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {record.vitalSigns.bloodPressureSystolic && (
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-12-regular text-dark-500">Tensiune</p>
                <p className="text-14-semibold text-dark-900">
                  {record.vitalSigns.bloodPressureSystolic}/
                  {record.vitalSigns.bloodPressureDiastolic} mmHg
                </p>
              </div>
            )}
            {record.vitalSigns.pulse && (
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-12-regular text-dark-500">Puls</p>
                <p className="text-14-semibold text-dark-900">
                  {record.vitalSigns.pulse} bpm
                </p>
              </div>
            )}
            {record.vitalSigns.temperature && (
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-12-regular text-dark-500">Temperatură</p>
                <p className="text-14-semibold text-dark-900">
                  {record.vitalSigns.temperature}°C
                </p>
              </div>
            )}
            {record.vitalSigns.weight && (
              <div className="rounded-md bg-gray-50 p-2">
                <p className="text-12-regular text-dark-500">Greutate</p>
                <p className="text-14-semibold text-dark-900">
                  {record.vitalSigns.weight} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lab Results */}
      {hasLabResults && (
        <div className="mb-4">
          <p className="text-14-semibold text-dark-700 mb-2">Rezultate analize:</p>
          <div className="space-y-3">
            {record.labResults.map((lab: any) => (
              <AnalysisResultDisplay
                key={lab.$id}
                result={{
                  testName: lab.testName,
                  value: lab.resultValue || "",
                  unit: lab.unit || "",
                  referenceRange: lab.referenceRange || "",
                  notes: lab.notes || "",
                }}
                patientInfo={patientInfo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Plan */}
      {record.plan && (
        <div>
          <p className="text-14-semibold text-dark-700 mb-1">Plan de tratament:</p>
          <p className="text-14-regular text-dark-600">{record.plan}</p>
        </div>
      )}
    </div>
  );
};
