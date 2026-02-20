"use server";

import { labResultHelpers, medicalRecordHelpers, patientHelpers } from "../db-helpers";

export type LabImportRow = {
  testName: string;
  testCategory?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  status?: string;
  notes?: string;
};

/** Parsează un rând CSV (virgulă sau punct-virgulă). Suportă ghilimele pentru câmpuri cu separator în interior. */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," || c === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/** Detectează separatorul din prima linie (virgulă sau punct-virgulă). */
function detectSeparator(firstLine: string): "," | ";" {
  return firstLine.includes(";") ? ";" : ",";
}

/**
 * Parsează conținut CSV și returnează array de obiecte.
 * Header așteptat (în orice ordine, case-insensitive): testName, testCategory, resultValue, unit, referenceRange, status, notes.
 * Alias: denumire_test / testName, categorie / testCategory, valoare / resultValue, unitate / unit, interval_referinta / referenceRange, status, note / notes.
 */
export async function parseLabResultsCSV(content: string): Promise<{ rows: LabImportRow[]; errors: string[] }> {
  const errors: string[] = [];
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ["Fișierul trebuie să aibă cel puțin linia de header și un rând de date."] };
  }
  const headerLine = lines[0];
  const separator = detectSeparator(headerLine);
  const headers = parseCSVLine(headerLine).map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const col = (name: string, aliases: string[]) => {
    const idx = headers.findIndex((h) => h === name || aliases.includes(h));
    return idx >= 0 ? idx : -1;
  };
  const testNameCol = col("testname", ["denumire_test", "test", "analiza"]);
  if (testNameCol < 0) {
    return { rows: [], errors: ["Lipsește coloana pentru denumirea analizei (testName / denumire_test)."] };
  }
  const testCategoryCol = col("testcategory", ["categorie", "categoria", "tip"]);
  const resultValueCol = col("resultvalue", ["valoare", "result", "rezultat"]);
  const unitCol = col("unit", ["unitate", "um"]);
  const referenceRangeCol = col("referencerange", ["interval_referinta", "referinta", "interval"]);
  const statusCol = col("status", ["status", "stare"]);
  const notesCol = col("notes", ["note", "observatii"]);

  const rows: LabImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const get = (idx: number) => (idx >= 0 && parts[idx] !== undefined ? String(parts[idx]).replace(/^"|"$/g, "").trim() : "");
    const testName = get(testNameCol);
    if (!testName) {
      errors.push(`Rândul ${i + 1}: denumirea analizei este goală.`);
      continue;
    }
    rows.push({
      testName,
      testCategory: testCategoryCol >= 0 ? get(testCategoryCol) || undefined : undefined,
      resultValue: resultValueCol >= 0 ? get(resultValueCol) || undefined : undefined,
      unit: unitCol >= 0 ? get(unitCol) || undefined : undefined,
      referenceRange: referenceRangeCol >= 0 ? get(referenceRangeCol) || undefined : undefined,
      status: statusCol >= 0 ? (get(statusCol) || "normal") : "normal",
      notes: notesCol >= 0 ? get(notesCol) || undefined : undefined,
    });
  }
  return { rows, errors };
}

export type ImportLabResultsOptions = {
  patientId: string;
  appointmentId?: string | null;
  rows: LabImportRow[];
};

/** Inserează rândurile de analize pentru un pacient (și opțional programare). Returnează numărul de înregistrări create și eventuale erori. */
export async function importLabResults(options: ImportLabResultsOptions): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const patient = patientHelpers.getById(options.patientId);
  if (!patient) {
    return { success: false, imported: 0, errors: ["Pacientul nu a fost găsit."] };
  }
  const medicalRecordId = medicalRecordHelpers.getOrCreateForLabImport(
    options.patientId,
    options.appointmentId ?? undefined
  );
  let imported = 0;
  for (const row of options.rows) {
    try {
      labResultHelpers.create({
        medicalRecordId,
        appointmentId: options.appointmentId ?? undefined,
        testName: row.testName,
        testCategory: row.testCategory,
        resultValue: row.resultValue,
        unit: row.unit,
        referenceRange: row.referenceRange,
        status: row.status === "normal" || row.status === "abnormal" || row.status === "critical" ? row.status : "normal",
        notes: row.notes,
      });
      imported++;
    } catch (e: any) {
      errors.push(`${row.testName}: ${e?.message || "Eroare la inserare"}`);
    }
  }
  return { success: errors.length === 0, imported, errors };
}
