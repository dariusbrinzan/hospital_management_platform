"use client";

import { formatDateTime } from "@/lib/utils";
import { AnalysisResultDisplay } from "./AnalysisResultDisplay";

interface AnalysisCardProps {
  analysis: {
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
  };
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export const AnalysisCard = ({ analysis, patientInfo }: AnalysisCardProps) => {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-18-semibold text-dark-900">
            Analiză Medicală: {analysis.testName}
          </h3>
          {analysis.testCategory && (
            <p className="text-14-regular text-dark-600 mt-1">
              Categorie: {analysis.testCategory}
            </p>
          )}
        </div>
        <span className="text-12-regular text-dark-500">
          {formatDateTime(analysis.performedDate).date}
        </span>
      </div>

      {/* Afișează rezultatul analizei cu colorare */}
      {analysis.resultValue && (
        <div className="mt-4">
          <AnalysisResultDisplay
            result={{
              testName: analysis.testName,
              value: analysis.resultValue,
              unit: analysis.unit || undefined,
              referenceRange: analysis.referenceRange || undefined,
              notes: analysis.notes || undefined,
            }}
            patientInfo={patientInfo}
          />
        </div>
      )}

      {/* Dacă nu există rezultat încă */}
      {!analysis.resultValue && (
        <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-14-regular text-yellow-800">
            ⏳ Rezultatele analizei sunt în procesare
          </p>
        </div>
      )}
    </div>
  );
};
