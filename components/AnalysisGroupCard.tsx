"use client";

import { formatDateTime } from "@/lib/utils";
import { AnalysisResultDisplay } from "./AnalysisResultDisplay";

interface AnalysisGroupCardProps {
  analysisGroup: {
    $id: string;
    appointmentId?: string | null;
    analyses: Array<{
      $id: string;
      testName: string;
      testCategory?: string | null;
      resultValue?: string | null;
      unit?: string | null;
      referenceRange?: string | null;
      status?: string | null;
      notes?: string | null;
      performedDate: Date | string;
      createdAt: Date | string;
    }>;
    date: Date | string;
    fromAppointment?: boolean;
  };
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export const AnalysisGroupCard = ({ analysisGroup, patientInfo }: AnalysisGroupCardProps) => {
  const analysesWithResults = analysisGroup.analyses.filter((a) => a.resultValue);
  const analysesPending = analysisGroup.analyses.filter((a) => !a.resultValue);

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-18-semibold text-dark-900">
            Set de Analize Medicale
          </h3>
          <p className="text-14-regular text-dark-600 mt-1">
            {analysisGroup.analyses.length} {analysisGroup.analyses.length === 1 ? "analiză" : "analize"}
            {analysisGroup.fromAppointment && analysisGroup.appointmentId && (
              <span className="ml-2 text-12-regular text-dark-500">
                (Programare #{analysisGroup.appointmentId.slice(-6)})
              </span>
            )}
          </p>
        </div>
        <span className="text-12-regular text-dark-500">
          {formatDateTime(analysisGroup.date).date}
        </span>
      </div>

      {/* Afișează analizele cu rezultate */}
      {analysesWithResults.length > 0 && (
        <div className="mt-4 space-y-4">
          <h4 className="text-16-semibold text-dark-900">Rezultate analize:</h4>
          {analysesWithResults.map((analysis) => (
            <AnalysisResultDisplay
              key={analysis.$id}
              result={{
                testName: analysis.testName,
                value: analysis.resultValue || "",
                unit: analysis.unit || undefined,
                referenceRange: analysis.referenceRange || undefined,
                notes: analysis.notes || undefined,
              }}
              patientInfo={patientInfo}
            />
          ))}
        </div>
      )}

      {/* Afișează analizele în procesare */}
      {analysesPending.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-16-semibold text-dark-900">Analize în procesare:</h4>
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
            <ul className="list-disc list-inside space-y-1">
              {analysesPending.map((analysis) => (
                <li key={analysis.$id} className="text-14-regular text-yellow-800">
                  {analysis.testName}
                  {analysis.testCategory && (
                    <span className="text-12-regular text-yellow-700 ml-2">
                      ({analysis.testCategory})
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-12-regular text-yellow-700 mt-2">
              ⏳ Rezultatele acestor analize sunt în procesare
            </p>
          </div>
        </div>
      )}

      {/* Dacă nu există niciun rezultat */}
      {analysesWithResults.length === 0 && analysesPending.length === 0 && (
        <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-14-regular text-yellow-800">
            ⏳ Rezultatele analizelor sunt în procesare
          </p>
        </div>
      )}
    </div>
  );
};
