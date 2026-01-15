/**
 * Sisteme de referință pentru valori normale ale analizelor medicale
 * Bazat pe vârstă, gen și greutate
 */

interface PatientInfo {
  age: number;
  gender: "Bărbat" | "Femeie";
  weight?: number; // în kg
}

interface ReferenceRange {
  min: number;
  max: number;
  unit: string;
  note?: string;
}

/**
 * Obține intervalul de referință pentru o analiză specifică
 */
export function getReferenceRange(
  testName: string,
  patientInfo: PatientInfo
): ReferenceRange | null {
  const normalizedTestName = testName.toLowerCase().trim();

  // Hemoleucogramă
  if (normalizedTestName.includes("hemoleucogram") || normalizedTestName.includes("hemoglobin")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 13.5, max: 17.5, unit: "g/dL" };
    } else {
      return { min: 12.0, max: 15.5, unit: "g/dL" };
    }
  }

  if (normalizedTestName.includes("hematocrit")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 40, max: 50, unit: "%" };
    } else {
      return { min: 36, max: 46, unit: "%" };
    }
  }

  if (normalizedTestName.includes("leucocite") || normalizedTestName.includes("wbc")) {
    return { min: 4.0, max: 11.0, unit: "x10³/μL" };
  }

  if (normalizedTestName.includes("trombocite") || normalizedTestName.includes("platelet")) {
    return { min: 150, max: 450, unit: "x10³/μL" };
  }

  // Glicemie
  if (normalizedTestName.includes("glicemie") || normalizedTestName.includes("glucose")) {
    if (patientInfo.age < 18) {
      return { min: 70, max: 100, unit: "mg/dL", note: "Copii și adolescenți" };
    } else if (patientInfo.age >= 65) {
      return { min: 70, max: 110, unit: "mg/dL", note: "Vârstă avansată" };
    } else {
      return { min: 70, max: 100, unit: "mg/dL" };
    }
  }

  // Colesterol
  if (normalizedTestName.includes("colesterol total")) {
    return { min: 0, max: 200, unit: "mg/dL" };
  }

  if (normalizedTestName.includes("hdl") || normalizedTestName.includes("colesterol hdl")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 40, max: 60, unit: "mg/dL" };
    } else {
      return { min: 50, max: 60, unit: "mg/dL" };
    }
  }

  if (normalizedTestName.includes("ldl") || normalizedTestName.includes("colesterol ldl")) {
    return { min: 0, max: 100, unit: "mg/dL", note: "Optimal < 100" };
  }

  if (normalizedTestName.includes("trigliceride")) {
    return { min: 0, max: 150, unit: "mg/dL" };
  }

  // Funcție renală
  if (normalizedTestName.includes("creatinină") || normalizedTestName.includes("creatinine")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 0.7, max: 1.3, unit: "mg/dL" };
    } else {
      return { min: 0.6, max: 1.1, unit: "mg/dL" };
    }
  }

  if (normalizedTestName.includes("uree") || normalizedTestName.includes("urea")) {
    return { min: 10, max: 50, unit: "mg/dL" };
  }

  // Funcție hepatică
  if (normalizedTestName.includes("alt") || normalizedTestName.includes("gpt")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 7, max: 56, unit: "U/L" };
    } else {
      return { min: 7, max: 40, unit: "U/L" };
    }
  }

  if (normalizedTestName.includes("ast") || normalizedTestName.includes("got")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 10, max: 40, unit: "U/L" };
    } else {
      return { min: 9, max: 32, unit: "U/L" };
    }
  }

  if (normalizedTestName.includes("bilirubin")) {
    return { min: 0.1, max: 1.2, unit: "mg/dL" };
  }

  // Funcție tiroidiană
  if (normalizedTestName.includes("tsh")) {
    return { min: 0.4, max: 4.0, unit: "mIU/L" };
  }

  if (normalizedTestName.includes("ft4") || normalizedTestName.includes("t4 liber")) {
    return { min: 0.8, max: 1.8, unit: "ng/dL" };
  }

  if (normalizedTestName.includes("ft3") || normalizedTestName.includes("t3 liber")) {
    return { min: 2.3, max: 4.2, unit: "pg/mL" };
  }

  // Vitamine
  if (normalizedTestName.includes("vitamina d") || normalizedTestName.includes("25-oh vitamin d")) {
    return { min: 30, max: 100, unit: "ng/mL", note: "Deficit < 20, Insuficiență 20-30" };
  }

  if (normalizedTestName.includes("vitamina b12")) {
    return { min: 200, max: 900, unit: "pg/mL" };
  }

  if (normalizedTestName.includes("acid folic") || normalizedTestName.includes("folat")) {
    return { min: 3.0, max: 17.0, unit: "ng/mL" };
  }

  // Ferritină
  if (normalizedTestName.includes("ferritină") || normalizedTestName.includes("ferritin")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 20, max: 300, unit: "ng/mL" };
    } else {
      return { min: 10, max: 150, unit: "ng/mL" };
    }
  }

  // PSA (doar bărbați)
  if (normalizedTestName.includes("psa")) {
    if (patientInfo.gender === "Bărbat") {
      if (patientInfo.age < 50) {
        return { min: 0, max: 2.5, unit: "ng/mL" };
      } else if (patientInfo.age < 60) {
        return { min: 0, max: 3.5, unit: "ng/mL" };
      } else {
        return { min: 0, max: 4.5, unit: "ng/mL" };
      }
    }
  }

  // Testosteron (doar bărbați)
  if (normalizedTestName.includes("testosteron")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 300, max: 1000, unit: "ng/dL" };
    }
  }

  // Estradiol (doar femei)
  if (normalizedTestName.includes("estradiol")) {
    if (patientInfo.gender === "Femeie") {
      // Variază în funcție de ciclu, dar valori generale
      return { min: 30, max: 400, unit: "pg/mL", note: "Variază în funcție de faza ciclului" };
    }
  }

  // D-dimere
  if (normalizedTestName.includes("d-dimere") || normalizedTestName.includes("d-dimer")) {
    return { min: 0, max: 0.5, unit: "mg/L FEU" };
  }

  // VSH (Viteză de sedimentare)
  if (normalizedTestName.includes("vsh") || normalizedTestName.includes("vs")) {
    if (patientInfo.gender === "Bărbat") {
      return { min: 0, max: 15, unit: "mm/h" };
    } else {
      return { min: 0, max: 20, unit: "mm/h" };
    }
  }

  // CRP (Proteina C reactivă)
  if (normalizedTestName.includes("crp") || normalizedTestName.includes("proteina c reactivă")) {
    return { min: 0, max: 3.0, unit: "mg/L" };
  }

  return null;
}

/**
 * Verifică dacă o valoare este în intervalul normal
 */
export function isValueInRange(
  value: string | number,
  referenceRange: ReferenceRange | null
): boolean | null {
  if (!referenceRange) return null;

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return null;

  return numValue >= referenceRange.min && numValue <= referenceRange.max;
}

/**
 * Formatează intervalul de referință pentru afișare
 */
export function formatReferenceRange(referenceRange: ReferenceRange | null): string {
  if (!referenceRange) return "N/A";
  
  let range = `${referenceRange.min}-${referenceRange.max} ${referenceRange.unit}`;
  if (referenceRange.note) {
    range += ` (${referenceRange.note})`;
  }
  return range;
}

/**
 * Calculează vârsta din data nașterii
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
