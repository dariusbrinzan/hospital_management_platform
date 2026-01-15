"use client";

import {
  getReferenceRange,
  formatReferenceRange,
  isValueInRange,
  calculateAge,
} from "@/lib/analysis-reference-ranges";

interface AnalysisResultDisplayProps {
  result: {
    testName: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    notes?: string;
  };
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export const AnalysisResultDisplay = ({
  result,
  patientInfo,
}: AnalysisResultDisplayProps) => {
  // Calculează intervalul de referință automat dacă nu este furnizat
  const autoReferenceRange = patientInfo
    ? getReferenceRange(result.testName, patientInfo)
    : null;

  // Folosește intervalul furnizat sau cel calculat automat
  const referenceRange = result.referenceRange || (autoReferenceRange ? formatReferenceRange(autoReferenceRange) : null);

  // Verifică dacă valoarea este în interval (folosind autoReferenceRange dacă există)
  let valueInRange: boolean | null = null;
  if (result.value && autoReferenceRange) {
    const checkResult = isValueInRange(result.value, autoReferenceRange);
    valueInRange = checkResult;
  }

  // Parsează intervalul manual dacă nu avem autoReferenceRange sau ca fallback
  let manualInRange: boolean | null = null;
  // Verifică și dacă avem referenceRange manual, chiar dacă avem autoReferenceRange (pentru a verifica dacă doctorul a introdus alt interval)
  if (result.referenceRange && result.value) {
    try {
      // Încearcă să parseze intervalul (ex: "3.5-5.5 g/dL" sau "70-100 mg/dL")
      // Suportă și formate precum "70-100", "3.5 - 5.5", etc.
      const rangeMatch = result.referenceRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        const value = parseFloat(result.value);
        if (!isNaN(value) && !isNaN(min) && !isNaN(max)) {
          manualInRange = value >= min && value <= max;
        }
      }
    } catch {
      // Ignoră erorile de parsing
    }
  }

  // Folosește autoReferenceRange dacă există, altfel folosește manualInRange
  // IMPORTANT: false = anormal (roșu), true = normal (verde), null = necunoscut (gri)
  // Dacă avem ambele, preferăm autoReferenceRange (mai precis)
  const isNormal = valueInRange !== null ? valueInRange : (manualInRange !== null ? manualInRange : null);
  
  // DEBUG: Log pentru a verifica logica
  // console.log("Analysis Result:", {
  //   testName: result.testName,
  //   value: result.value,
  //   referenceRange: result.referenceRange,
  //   autoReferenceRange,
  //   valueInRange,
  //   manualInRange,
  //   isNormal,
  // });
  
  // Colorare: verde pentru normal (true), roșu pentru anormal (false), gri pentru necunoscut (null)
  const statusColor = isNormal === true 
    ? "text-green-600" 
    : isNormal === false 
    ? "text-red-600" 
    : "text-dark-600";
  
  const statusBg = isNormal === true 
    ? "bg-green-50 border-green-200" 
    : isNormal === false 
    ? "bg-red-50 border-red-200" 
    : "bg-white border-dark-200";
  
  const statusIcon = isNormal === true ? "✓" : isNormal === false ? "⚠" : "";

  return (
    <div className={`rounded-lg border p-4 ${statusBg}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-16-semibold text-dark-900">{result.testName}</p>
        {statusIcon && (
          <span className={`text-18-semibold ${statusColor}`}>{statusIcon}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <div>
          <p className="text-12-medium text-dark-500 mb-1">Valoare</p>
          <p className={`text-16-semibold ${statusColor}`}>
            {result.value} {result.unit || ""}
          </p>
        </div>
        {referenceRange && (
          <div>
            <p className="text-12-medium text-dark-500 mb-1">Interval de referință</p>
            <p className="text-14-regular text-dark-700">
              {referenceRange}
            </p>
            {autoReferenceRange && autoReferenceRange.note && (
              <p className="text-12-regular text-dark-500 mt-1">
                {autoReferenceRange.note}
              </p>
            )}
          </div>
        )}
      </div>

      {isNormal === false && (
        <div className="mt-2 p-2 bg-red-100 rounded-md">
          <p className="text-12-semibold text-red-700">
            ⚠ Valoare în afara intervalului normal
          </p>
        </div>
      )}

      {isNormal === true && (
        <div className="mt-2 p-2 bg-green-100 rounded-md">
          <p className="text-12-semibold text-green-700">
            ✓ Valoare în interval normal
          </p>
        </div>
      )}

      {result.notes && (
        <div className="mt-2">
          <p className="text-12-medium text-dark-500 mb-1">Observații</p>
          <p className="text-14-regular text-dark-600">{result.notes}</p>
        </div>
      )}
    </div>
  );
};
