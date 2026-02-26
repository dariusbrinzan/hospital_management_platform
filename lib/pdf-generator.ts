import { jsPDF } from "jspdf";
import { formatDateTime } from "./utils";

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

interface DoctorInfo {
  name: string;
  specialty?: string;
}

interface ConsultationPDFData {
  patient: PatientInfo;
  doctor: DoctorInfo;
  record: {
    visitDate: Date | string;
    chiefComplaint?: string;
    subjectiveNotes?: string;
    objectiveFindings?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
    diagnoses?: Array<{ diagnosisName: string; diagnosisCode?: string; status: string; notes?: string }>;
    prescriptions?: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      route?: string;
      quantity?: string;
      instructions?: string;
      startDate?: Date | string;
      endDate?: Date | string;
    }>;
    vitalSigns?: {
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      pulse?: number;
      temperature?: number;
      oxygenSaturation?: number;
      respiratoryRate?: number;
      weight?: number;
      height?: number;
      bmi?: number;
      glucoseLevel?: number;
    };
    labResults?: Array<{
      testName: string;
      resultValue?: string;
      unit?: string;
      referenceRange?: string;
      status?: string;
    }>;
    procedures?: Array<{
      procedureName: string;
      procedureDate?: Date | string;
      performedBy?: string;
      outcome?: string;
      notes?: string;
    }>;
  };
}

/** Date pentru raport PDF de analize medicale (layout profesional, conform practicilor laboratoarelor acreditate) */
interface AnalysisPDFData {
  patient: PatientInfo;
  analyses: Array<{
    testName: string;
    testCategory?: string;
    resultValue?: string;
    unit?: string;
    referenceRange?: string;
    notes?: string;
    performedDate: Date | string;
    /** normal | high | low | critical – pentru flag în raport (H/L/*) */
    status?: string;
  }>;
  appointmentId?: string;
  date: Date | string;
  /** Medic solicitant / medic curant */
  physicianName?: string;
}

// Colors as RGB arrays
const PRIMARY = [34, 139, 34];     // green
const DARK = [30, 30, 30];         // near-black
const GRAY = [100, 100, 100];      // medium gray
const LIGHT_GRAY = [200, 200, 200];
const ACCENT_BG = [245, 250, 245]; // very light green
const WHITE = [255, 255, 255];

export function generateConsultationPDF(data: ConsultationPDFData): Buffer {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 18; // margin
  const cw = pageW - 2 * m; // content width
  let y = 0;

  const setColor = (rgb: number[]) => {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  };
  const setDrawColor = (rgb: number[]) => {
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  };
  const setFillColor = (rgb: number[]) => {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  };

  const pageBreak = (need: number = 25) => {
    if (y + need > pageH - 25) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  const wrappedText = (text: string, x: number, maxW: number, fontSize: number = 9.5, lineH: number = 4.5): number => {
    doc.setFontSize(fontSize);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    lines.forEach((line: string) => {
      pageBreak(lineH + 2);
      doc.text(line, x, y);
      y += lineH;
    });
    return lines.length * lineH;
  };

  const sectionTitle = (title: string) => {
    pageBreak(18);
    setFillColor(PRIMARY);
    doc.roundedRect(m, y - 4, cw, 9, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor(WHITE);
    doc.text(title.toUpperCase(), m + 4, y + 2);
    setColor(DARK);
    y += 12;
  };

  const fieldLabel = (label: string, value: string, x: number, maxW: number) => {
  doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(GRAY);
    doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
    setColor(DARK);
    const lines: string[] = doc.splitTextToSize(value, maxW - doc.getTextWidth(label) - 2);
    doc.text(lines[0] || "", x + doc.getTextWidth(label) + 2, y);
    y += 5;
    if (lines.length > 1) {
      for (let i = 1; i < lines.length; i++) {
        doc.text(lines[i], x + doc.getTextWidth(label) + 2, y);
        y += 5;
      }
    }
  };

  // ============ HEADER BAR ============
  setFillColor(PRIMARY);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setColor(WHITE);
  doc.text("eHealth.ro", m, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Raport Consultație Medicală", m, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(formatDateTime(data.record.visitDate).dateTime, pageW - m, 14, { align: "right" });
  doc.text(`Nr. consultație: ${Date.now().toString(36).toUpperCase()}`, pageW - m, 22, { align: "right" });
  setColor(DARK);

  y = 40;

  // ============ PATIENT + DOCTOR INFO (2 columns) ============
  const colW = (cw - 8) / 2;

  // Patient box
  setFillColor(ACCENT_BG);
  setDrawColor(LIGHT_GRAY);
  doc.roundedRect(m, y - 4, colW, 42, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(PRIMARY);
  doc.text("PACIENT", m + 4, y + 2);
  y += 8;
  setColor(DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.patient.name, m + 4, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(GRAY);
  doc.text(`Data nașterii: ${formatDateTime(data.patient.birthDate).dateOnly}`, m + 4, y);
  y += 4.5;
  doc.text(`Gen: ${data.patient.gender}`, m + 4, y);
  y += 4.5;
  if (data.patient.phone) {
    doc.text(`Tel: ${data.patient.phone}`, m + 4, y);
    y += 4.5;
  }
  if (data.patient.email) {
    doc.text(`Email: ${data.patient.email}`, m + 4, y);
    y += 4.5;
  }
  if (data.patient.insuranceProvider) {
    doc.text(`Asigurare: ${data.patient.insuranceProvider}`, m + 4, y);
    y += 4.5;
  }

  // Doctor box
  const docX = m + colW + 8;
  let yDoc = 40;
  setFillColor(ACCENT_BG);
  doc.roundedRect(docX, yDoc - 4, colW, 42, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(PRIMARY);
  doc.text("MEDIC", docX + 4, yDoc + 2);
  yDoc += 8;
  setColor(DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.doctor.name, docX + 4, yDoc);
  yDoc += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(GRAY);
  if (data.doctor.specialty) {
    doc.text(`Specializare: ${data.doctor.specialty}`, docX + 4, yDoc);
    yDoc += 4.5;
  }
  doc.text(`Data: ${formatDateTime(data.record.visitDate).dateOnly}`, docX + 4, yDoc);
  yDoc += 4.5;
  doc.text(`Ora: ${formatDateTime(data.record.visitDate).timeOnly}`, docX + 4, yDoc);

  y = Math.max(y, yDoc) + 12;
  setColor(DARK);

  // ============ VITAL SIGNS (horizontal row of boxes) ============
  if (data.record.vitalSigns) {
    const vs = data.record.vitalSigns;
    const vitals: Array<{ label: string; value: string; unit: string }> = [];

    if (vs.bloodPressureSystolic) vitals.push({ label: "Tensiune", value: `${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`, unit: "mmHg" });
    if (vs.pulse) vitals.push({ label: "Puls", value: `${vs.pulse}`, unit: "bpm" });
    if (vs.temperature) vitals.push({ label: "Temp.", value: `${vs.temperature}`, unit: "°C" });
    if (vs.oxygenSaturation) vitals.push({ label: "SpO2", value: `${vs.oxygenSaturation}`, unit: "%" });
    if (vs.respiratoryRate) vitals.push({ label: "Resp.", value: `${vs.respiratoryRate}`, unit: "/min" });
    if (vs.weight) vitals.push({ label: "Greutate", value: `${vs.weight}`, unit: "kg" });
    if (vs.height) vitals.push({ label: "Înălțime", value: `${vs.height}`, unit: "cm" });
    if (vs.bmi) vitals.push({ label: "IMC", value: `${vs.bmi}`, unit: "" });
    if (vs.glucoseLevel) vitals.push({ label: "Glicemie", value: `${vs.glucoseLevel}`, unit: "mg/dL" });

    if (vitals.length > 0) {
      sectionTitle("Semne Vitale");
      const boxW = Math.min((cw - (vitals.length - 1) * 3) / vitals.length, 35);
      let xBox = m;
      vitals.forEach((v) => {
        pageBreak(22);
        setFillColor([240, 248, 240]);
        setDrawColor(PRIMARY);
        doc.roundedRect(xBox, y - 4, boxW, 18, 2, 2, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        setColor(GRAY);
        doc.text(v.label, xBox + boxW / 2, y, { align: "center" });
        doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
        setColor(DARK);
        doc.text(v.value, xBox + boxW / 2, y + 7, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        setColor(GRAY);
        doc.text(v.unit, xBox + boxW / 2, y + 12, { align: "center" });
        xBox += boxW + 3;
      });
      y += 20;
      setColor(DARK);
      setDrawColor(LIGHT_GRAY);
    }
  }

  // ============ MOTIV CONSULTAȚIE ============
  if (data.record.chiefComplaint) {
    sectionTitle("Motiv Consultație");
    doc.setFont("helvetica", "normal");
    setColor(DARK);
    wrappedText(data.record.chiefComplaint, m + 2, cw - 4);
    y += 4;
  }

  // ============ SIMPTOME RAPORTATE (Subjective) ============
  if (data.record.subjectiveNotes) {
    sectionTitle("Simptome Raportate de Pacient");
    doc.setFont("helvetica", "normal");
    setColor(DARK);
    wrappedText(data.record.subjectiveNotes, m + 2, cw - 4);
    y += 4;
  }

  // ============ EXAMEN CLINIC (Objective) ============
  if (data.record.objectiveFindings) {
    sectionTitle("Examen Clinic");
    doc.setFont("helvetica", "normal");
    setColor(DARK);
    wrappedText(data.record.objectiveFindings, m + 2, cw - 4);
    y += 4;
  }

  // ============ EVALUARE / CONCLUZII ============
  if (data.record.assessment) {
    sectionTitle("Evaluare și Concluzii");
    setFillColor([255, 252, 240]);
    setDrawColor([220, 200, 120]);
    pageBreak(20);
    const assessLines: string[] = doc.splitTextToSize(data.record.assessment, cw - 12);
    const boxH = assessLines.length * 5 + 8;
    doc.roundedRect(m, y - 4, cw, boxH, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setColor(DARK);
    assessLines.forEach((line: string) => {
      doc.text(line, m + 5, y + 1);
      y += 5;
    });
    y += 6;
    setDrawColor(LIGHT_GRAY);
  }

  // ============ DIAGNOSTICURI ============
  if (data.record.diagnoses && data.record.diagnoses.length > 0) {
    sectionTitle("Diagnosticuri");

    data.record.diagnoses.forEach((diag, idx) => {
      pageBreak(16);
      const statusText = diag.status === "active" ? "ACTIV" : diag.status === "resolved" ? "REZOLVAT" : diag.status === "chronic" ? "CRONIC" : "ISTORIC";
      const statusColor = diag.status === "active" ? [220, 50, 50] : diag.status === "resolved" ? [34, 139, 34] : [140, 140, 140];

      setFillColor([250, 250, 250]);
      setDrawColor(LIGHT_GRAY);
      doc.roundedRect(m, y - 4, cw, diag.notes ? 16 : 11, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      setColor(DARK);
      doc.text(`${idx + 1}. ${diag.diagnosisName}`, m + 4, y + 1);

      if (diag.diagnosisCode) {
  doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setColor(GRAY);
        doc.text(`(${diag.diagnosisCode})`, m + 4 + doc.getTextWidth(`${idx + 1}. ${diag.diagnosisName}  `), y + 1);
      }

      // Status badge
      const badgeW = doc.getTextWidth(statusText) + 6;
      setFillColor(statusColor);
      doc.roundedRect(pageW - m - badgeW - 2, y - 3, badgeW, 7, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setColor(WHITE);
      doc.text(statusText, pageW - m - badgeW / 2 - 2, y + 1.5, { align: "center" });

      if (diag.notes) {
        y += 7;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        setColor(GRAY);
        doc.text(diag.notes, m + 8, y);
      }
      y += diag.notes ? 11 : 10;
      setColor(DARK);
    });
    y += 2;
  }

  // ============ MEDICAMENTE PRESCRISE ============
  if (data.record.prescriptions && data.record.prescriptions.length > 0) {
    sectionTitle("Medicamente Prescrise");

    data.record.prescriptions.forEach((rx, idx) => {
      pageBreak(24);
      setFillColor([248, 250, 255]);
      setDrawColor([180, 200, 240]);
      const rxLines: string[] = [];
      rxLines.push(`${rx.dosage} — ${rx.frequency}`);
      if (rx.route) rxLines.push(`Cale de administrare: ${rx.route}`);
      if (rx.quantity) rxLines.push(`Cantitate: ${rx.quantity}`);
      if (rx.instructions) rxLines.push(`Instrucțiuni: ${rx.instructions}`);
      if (rx.startDate) {
        const endText = rx.endDate ? ` pana la ${formatDateTime(rx.endDate).dateOnly}` : "";
        rxLines.push(`Perioada: din ${formatDateTime(rx.startDate).dateOnly}${endText}`);
      }

      const boxH = 10 + rxLines.length * 4.5;
      doc.roundedRect(m, y - 4, cw, boxH, 2, 2, "FD");

      // Pill icon circle
      setFillColor([60, 130, 240]);
      doc.circle(m + 6, y + 1, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setColor(WHITE);
      doc.text(`${idx + 1}`, m + 6, y + 2, { align: "center" });

      doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
      setColor(DARK);
      doc.text(rx.medicationName, m + 12, y + 2);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setColor(GRAY);
      rxLines.forEach((line) => {
        doc.text(line, m + 12, y);
        y += 4.5;
      });
      y += 4;
      setColor(DARK);
      setDrawColor(LIGHT_GRAY);
    });
    y += 2;
  }

  // ============ REZULTATE ANALIZE ============
  if (data.record.labResults && data.record.labResults.length > 0) {
    sectionTitle("Rezultate Analize");

    // Table header
    pageBreak(10);
    setFillColor([230, 230, 230]);
    doc.rect(m, y - 3.5, cw, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(DARK);
    doc.text("Analiză", m + 3, y);
    doc.text("Rezultat", m + 80, y);
    doc.text("Unitate", m + 115, y);
    doc.text("Referință", m + 140, y);
    y += 6;

    data.record.labResults.forEach((lab, idx) => {
      pageBreak(7);
      if (idx % 2 === 0) {
        setFillColor([250, 252, 250]);
        doc.rect(m, y - 3.5, cw, 6.5, "F");
      }
    doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      const isAbnormal = lab.status === "abnormal" || lab.status === "critical";
      setColor(isAbnormal ? [200, 50, 50] : DARK);
      doc.setFont("helvetica", isAbnormal ? "bold" : "normal");
      doc.text(lab.testName || "", m + 3, y);
      doc.text(lab.resultValue || "-", m + 80, y);
      setColor(GRAY);
      doc.setFont("helvetica", "normal");
      doc.text(lab.unit || "", m + 115, y);
      doc.text(lab.referenceRange || "", m + 140, y);
      y += 6;
      setColor(DARK);
    });
    y += 4;
  }

  // ============ PROCEDURI MEDICALE ============
  if (data.record.procedures && data.record.procedures.length > 0) {
    sectionTitle("Proceduri Medicale");

    data.record.procedures.forEach((proc) => {
      pageBreak(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      setColor(DARK);
      doc.text(`• ${proc.procedureName}`, m + 2, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setColor(GRAY);
      if (proc.performedBy) { doc.text(`Efectuată de: ${proc.performedBy}`, m + 8, y); y += 4.5; }
      if (proc.outcome) { doc.text(`Rezultat: ${proc.outcome}`, m + 8, y); y += 4.5; }
      if (proc.notes) { doc.text(`Note: ${proc.notes}`, m + 8, y); y += 4.5; }
      y += 3;
      setColor(DARK);
    });
    y += 2;
  }

  // ============ PLAN DE TRATAMENT ============
  if (data.record.plan) {
    sectionTitle("Plan de Tratament");
    setFillColor([240, 255, 240]);
    setDrawColor(PRIMARY);
    pageBreak(20);
    const planLines: string[] = doc.splitTextToSize(data.record.plan, cw - 12);
    const boxH = planLines.length * 5 + 8;
    doc.roundedRect(m, y - 4, cw, boxH, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setColor(DARK);
    planLines.forEach((line: string) => {
      doc.text(line, m + 5, y + 1);
      y += 5;
    });
    y += 6;
    setDrawColor(LIGHT_GRAY);
  }

  // ============ NOTE ADIȚIONALE ============
  if (data.record.notes) {
    sectionTitle("Note");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    setColor(GRAY);
    wrappedText(data.record.notes, m + 2, cw - 4, 9, 4.5);
    y += 4;
    setColor(DARK);
  }

  // ============ SEMNĂTURĂ ============
  pageBreak(30);
  y += 8;
  setDrawColor(LIGHT_GRAY);
  doc.line(pageW - m - 70, y, pageW - m, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(GRAY);
  doc.text("Semnătura medicului", pageW - m - 35, y + 5, { align: "center" });
    doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(DARK);
  doc.text(data.doctor.name, pageW - m - 35, y + 10, { align: "center" });

  // ============ FOOTER PE TOATE PAGINILE ============
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Bottom line
    setDrawColor(PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(m, pageH - 14, pageW - m, pageH - 14);
    doc.setLineWidth(0.2);
    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setColor(GRAY);
    doc.text("eHealth.ro — Platformă de Management Medical", m, pageH - 9);
    doc.text(
      `Generat: ${formatDateTime(new Date().toISOString()).dateTime}  |  Pagina ${i} din ${pageCount}`,
      pageW - m,
      pageH - 9,
      { align: "right" }
    );
  }

  setColor(DARK);
  return Buffer.from(doc.output("arraybuffer"));
}

/** Returnează flag pentru valoare anormală: H = high, L = low, * = critical */
function getAbnormalFlag(status?: string): string {
  if (!status) return "";
  const s = String(status).toLowerCase();
  if (s === "critical") return "*";
  if (s === "high" || s === "above") return "H";
  if (s === "low" || s === "below") return "L";
  return "";
}

/** Dată/ora formatată pentru PDF (ro, scurt) */
function formatDateForPDF(d: Date | string): string {
  const date = new Date(d);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const h = date.getHours();
  const m = date.getMinutes();
  const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  return `${day}.${month}.${year}, ${time}`;
}

/** Nume medic fără dublura "Dr." */
function formatPhysicianName(name?: string): string {
  if (!name) return "";
  const t = name.trim();
  if (t.toLowerCase().startsWith("dr.") || t.toLowerCase().startsWith("dr ")) return t;
  return `Dr. ${t}`;
}

/** Inlocuieste diacriticele românesti cu ASCII pentru fonturile standard jsPDF (Helvetica nu suporta UTF-8). */
function pdfAscii(s: string): string {
  if (!s) return s;
  const map: Record<string, string> = {
    ă: "a", â: "a", î: "i", ș: "s", ț: "t",
    Ă: "A", Â: "A", Î: "I", Ș: "S", Ț: "T",
  };
  return String(s).replace(/[ăâîșțĂÂÎȘȚ]/g, (c) => map[c] ?? c);
}

export function generateAnalysisPDF(data: AnalysisPDFData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const M = 18;
  const W = pageWidth - 2 * M;
  const col1 = M + 2;           // Denumire
  const col2 = M + 75;          // Rezultat
  const col3 = M + 95;         // UM
  const col4 = M + 115;        // Interval referinta
  let y = 20;

  const age = data.patient.birthDate
    ? Math.floor((Date.now() - new Date(data.patient.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;
  const dateStr = formatDateForPDF(data.date);
  const physician = formatPhysicianName(data.physicianName);
  const genderShort = data.patient.gender === "Femeie" ? "F" : /barbat/i.test(String(data.patient.gender)) ? "M" : "F";

  const t = (s: string) => pdfAscii(s);
  const setGray = (v: number) => doc.setTextColor(v, v, v);

  const needPage = (need: number) => {
    if (y + need > pageHeight - 20) {
    doc.addPage();
      y = 20;
      drawHeader();
    }
  };

  function drawHeader() {
    doc.setFillColor(0, 102, 102);
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("eHealth.ro - Laborator de Analize Medicale", pageWidth / 2, 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(220, 220, 220);
    doc.text("Str. Sanatati nr. 1, Bucuresti  |  Tel: 021 000 0000", pageWidth / 2, 11.5, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  drawHeader();
  y = 18;

  // Bloc pacient
  doc.setFontSize(8);
  setGray(90);
  doc.text("Nume:", M, y);
  doc.text("Trimitator:", M + 90, y);
  y += 5;
    doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(t(data.patient.name), col1 + 14, y - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setGray(40);
  doc.text(t(physician || "-"), M + 102, y - 5);
  doc.setFontSize(8);
  setGray(80);
  doc.text(`Varsta: ${age ?? "-"} ani   Sex: ${genderShort}`, M, y + 1);
  doc.text(`Data - ora recoltare: ${dateStr}`, M + 90, y + 1);
  y += 6;
  if (data.patient.phone) doc.text(`Telefon: ${data.patient.phone}`, M, y + 1);
  if (data.appointmentId) doc.text(`Cod programare: ${data.appointmentId.slice(-8)}`, M + 90, y + 1);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(M, y, M + W, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Buletin de analize medicale", pageWidth / 2, y + 4, { align: "center" });
  y += 10;
  doc.line(M, y, M + W, y);
  y += 6;

  // Header tabel
  doc.setFillColor(240, 240, 240);
  doc.rect(M, y, W, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setGray(50);
  doc.text("Denumire", col1, y + 5.5);
  doc.text("Rezultat", col2, y + 5.5);
  doc.text("UM", col3, y + 5.5);
  doc.text("Interval referinta", col4, y + 5.5);
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setGray(100);
  doc.text("Rezultatele analizelor trebuie interpretate de catre medicul dumneavoastra curant in context clinic.", M + 2, y + 3);
  y += 8;

  const analysesWithResults = data.analyses.filter((a) => a.resultValue);
  const analysesPending = data.analyses.filter((a) => !a.resultValue);

  const grouped = new Map<string, typeof analysesWithResults>();
  analysesWithResults.forEach((a) => {
    const cat = a.testCategory || "ANALIZE";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(a);
  });

  grouped.forEach((items, category) => {
    needPage(14);
    doc.setFillColor(232, 232, 232);
    doc.rect(M, y, W, 6, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setGray(40);
    doc.text(t(category.toUpperCase()), col1, y + 4);
    y += 7;

    items.forEach((a) => {
      needPage(8);
      const flag = getAbnormalFlag(a.status);
      const isAbnormal = !!flag;
      const resultStr = String(a.resultValue ?? "-");
      const unitStr = (a.unit || "").trim() || "-";
      const refStr = a.referenceRange || "-";
      const testName = t(a.testName || "-");

      if (isAbnormal) {
        doc.setFillColor(255, 235, 235);
        doc.rect(M, y - 2, W, 7, "F");
      }

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", isAbnormal ? "bold" : "normal");
      const maxW1 = col2 - col1 - 4;
      const lines = doc.splitTextToSize(testName, maxW1);
      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], col1, y + (i * 4));
      }
      if (isAbnormal) doc.setTextColor(180, 0, 0);
      doc.text(resultStr, col2, y + 4);
      doc.setFont("helvetica", "normal");
      setGray(60);
      doc.setFontSize(8);
      doc.text(t(unitStr), col3, y + 4);
      doc.text(t(refStr), col4, y + 4);

      const rowH = Math.max(6, lines.length * 4) + 2;
      y += rowH;
    });
    y += 4;
  });

  if (analysesPending.length > 0) {
    needPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setGray(40);
    doc.text("ANALIZE IN PROCESARE", col1, y + 4);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setGray(60);
    analysesPending.forEach((a) => {
      doc.text("- " + t(a.testName || "") + (a.testCategory ? " (" + t(a.testCategory) + ")" : ""), col1, y + 3);
      y += 6;
    });
    y += 4;
  }

  const notesItems = analysesWithResults.filter((a) => a.notes);
  if (notesItems.length > 0) {
    needPage(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(M, y, M + W, y);
    y += 6;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    setGray(90);
    notesItems.forEach((a) => {
      const txt = `Observatii (${t(a.testName || "")}): ${t(a.notes || "")}`;
      const noteLines = doc.splitTextToSize(txt, W - 6);
      noteLines.forEach((line: string) => {
        doc.text(line, M + 4, y + 3);
        y += 3.5;
      });
      y += 2;
    });
  }

  const totalPages = doc.getNumberOfPages();
  const now = formatDateForPDF(new Date());
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(M, pageHeight - 14, M + W, pageHeight - 14);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setGray(110);
    doc.text(`Pagina ${i} din ${totalPages}`, M, pageHeight - 8);
    doc.text(`Eliberat la ${now}`, M + W, pageHeight - 8, { align: "right" });
    doc.setFontSize(6);
    setGray(130);
    doc.text("Raport generat electronic de eHealth.ro. Rezultatele trebuie interpretate de medicul curant.", pageWidth / 2, pageHeight - 4, { align: "center" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

interface FullMedicalRecordPDFData {
  patient: {
    name: string;
    birthDate: string;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    bloodType?: string;
    height?: number;
    weight?: number;
  };
  allergies?: Array<{
    allergenName: string;
    allergenType: string;
    severity: string;
    status: string;
  }>;
  vaccinations?: Array<{
    vaccineName: string;
    administrationDate: Date | string;
    nextDoseDate?: Date | string;
  }>;
  familyHistory?: Array<{
    relation: string;
    condition: string;
    ageOfOnset?: number;
  }>;
  activePrescriptions?: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: Date | string;
    endDate?: Date | string;
  }>;
  medicalRecords?: Array<{
    visitDate: Date | string;
    doctorName: string;
    chiefComplaint?: string;
    assessment?: string;
    diagnoses?: Array<{ diagnosisName: string; status: string }>;
    prescriptions?: Array<{ medicationName: string; dosage: string; frequency: string }>;
  }>;
  labResults?: Array<{
    testName: string;
    resultValue?: string;
    unit?: string;
    referenceRange?: string;
    performedDate: Date | string;
  }>;
  appointments?: Array<{
    schedule: Date | string;
    primaryPhysician: string;
    reason?: string;
    status: string;
  }>;
  documents?: Array<{
    documentType: string;
    fileName: string;
    uploadedAt: Date | string;
  }>;
}

export function generateFullMedicalRecordPDF(data: FullMedicalRecordPDFData): Buffer {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper pentru adăugare pagină nouă dacă e necesar
  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > 270) {
    doc.addPage();
    yPos = 20;
      return true;
    }
    return false;
  };

  // Helper pentru text wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4 + 2);
  };

  // Header
  doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
  doc.text("DOSAR MEDICAL COMPLET", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
  doc.text(`Generat pe ${formatDateTime(new Date().toISOString()).dateTime}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // ========== SECȚIUNEA 1: INFORMATII PERSONALE ==========
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. INFORMATII PERSONALE", margin, yPos);
  yPos += 8;
    doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Nume complet: ${data.patient.name}`, margin, yPos);
      yPos += 6;
  doc.text(`Data nașterii: ${formatDateTime(data.patient.birthDate).dateOnly}`, margin, yPos);
      yPos += 6;
  doc.text(`Gen: ${data.patient.gender}`, margin, yPos);
      yPos += 6;
  if (data.patient.phone) {
    doc.text(`Telefon: ${data.patient.phone}`, margin, yPos);
    yPos += 6;
  }
  if (data.patient.email) {
    doc.text(`Email: ${data.patient.email}`, margin, yPos);
    yPos += 6;
  }
  if (data.patient.address) {
    const addressHeight = addText(`Adresă: ${data.patient.address}`, margin, yPos, contentWidth);
    yPos += addressHeight;
  }
  if (data.patient.bloodType) {
    doc.text(`Grupa sanguină: ${data.patient.bloodType}`, margin, yPos);
    yPos += 6;
  }
  if (data.patient.height && data.patient.weight) {
    const bmi = (data.patient.weight / ((data.patient.height / 100) ** 2)).toFixed(1);
    doc.text(`Înălțime: ${data.patient.height} cm | Greutate: ${data.patient.weight} kg | IMC: ${bmi}`, margin, yPos);
    yPos += 6;
  }
  yPos += 5;
  checkPageBreak();

  // ========== SECȚIUNEA 2: ALERGII ==========
  if (data.allergies && data.allergies.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. ALERGII ȘI REACȚII ADVERSE", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    data.allergies.forEach((allergy) => {
      checkPageBreak(8);
      const severityText = allergy.severity === "mild" ? "Ușoară" : allergy.severity === "moderate" ? "Moderată" : allergy.severity === "severe" ? "Severă" : "Critică";
      const statusText = allergy.status === "active" ? "Activă" : allergy.status === "resolved" ? "Rezolvată" : "Istoric";
      doc.text(`• ${allergy.allergenName} (${allergy.allergenType}) - ${severityText} - ${statusText}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 3: VACCINĂRI ==========
  if (data.vaccinations && data.vaccinations.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. VACCINĂRI", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    data.vaccinations.forEach((vac) => {
      checkPageBreak(8);
      const nextDose = vac.nextDoseDate ? ` | Următoarea doză: ${formatDateTime(vac.nextDoseDate).dateOnly}` : "";
      doc.text(`• ${vac.vaccineName} - ${formatDateTime(vac.administrationDate).dateOnly}${nextDose}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 4: ISTORIC FAMILIAL ==========
  if (data.familyHistory && data.familyHistory.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. ISTORIC MEDICAL FAMILIAL", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    data.familyHistory.forEach((fh) => {
      checkPageBreak(8);
      const ageText = fh.ageOfOnset ? ` (vârstă debut: ${fh.ageOfOnset} ani)` : "";
      doc.text(`• ${fh.relation}: ${fh.condition}${ageText}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 5: REȚETE ACTIVE ==========
  if (data.activePrescriptions && data.activePrescriptions.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. REȚETE ACTIVE", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    data.activePrescriptions.forEach((rx) => {
      checkPageBreak(12);
      doc.text(`• ${rx.medicationName}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`  Doză: ${rx.dosage} | Frecvență: ${rx.frequency}`, margin + 10, yPos);
      yPos += 6;
      const endDateText = rx.endDate ? ` | Expiră: ${formatDateTime(rx.endDate).dateOnly}` : " | Fără dată de expirare";
      doc.text(`  Început: ${formatDateTime(rx.startDate).dateOnly}${endDateText}`, margin + 10, yPos);
      yPos += 8;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 6: CONSULTAȚII MEDICALE ==========
  if (data.medicalRecords && data.medicalRecords.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("6. CONSULTAȚII MEDICALE", margin, yPos);
    yPos += 8;
    
    data.medicalRecords.forEach((record, index) => {
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Consultația ${index + 1} - ${formatDateTime(record.visitDate).dateOnly}`, margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Medic: ${record.doctorName}`, margin + 5, yPos);
      yPos += 6;
      
      if (record.chiefComplaint) {
        const complaintHeight = addText(`Motiv: ${record.chiefComplaint}`, margin + 5, yPos, contentWidth - 10);
        yPos += complaintHeight + 2;
      }
      
      if (record.assessment) {
        const assessmentHeight = addText(`Evaluare: ${record.assessment}`, margin + 5, yPos, contentWidth - 10);
        yPos += assessmentHeight + 2;
      }
      
      if (record.diagnoses && record.diagnoses.length > 0) {
        doc.text("Diagnosticuri:", margin + 5, yPos);
      yPos += 6;
        record.diagnoses.forEach((diag) => {
          const statusText = diag.status === "active" ? "Activ" : diag.status === "resolved" ? "Rezolvat" : diag.status === "chronic" ? "Cronic" : "Istoric";
          doc.text(`  - ${diag.diagnosisName} (${statusText})`, margin + 10, yPos);
          yPos += 6;
          checkPageBreak(6);
        });
      }
      
      if (record.prescriptions && record.prescriptions.length > 0) {
        doc.text("Medicamente prescrise:", margin + 5, yPos);
      yPos += 6;
        record.prescriptions.forEach((presc) => {
          doc.text(`  - ${presc.medicationName} (${presc.dosage}, ${presc.frequency})`, margin + 10, yPos);
          yPos += 6;
          checkPageBreak(6);
        });
    }
      
    yPos += 5;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 7: REZULTATE ANALIZE ==========
  if (data.labResults && data.labResults.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("7. REZULTATE ANALIZE", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Grupează analizele după dată
    const groupedByDate = new Map<string, typeof data.labResults>();
    data.labResults.forEach((lab) => {
      const dateKey = formatDateTime(lab.performedDate).dateOnly;
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(lab);
    });
    
    groupedByDate.forEach((labs, date) => {
      checkPageBreak(15);
    doc.setFont("helvetica", "bold");
      doc.text(`Data: ${date}`, margin, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
      
      labs.forEach((lab) => {
        checkPageBreak(10);
        doc.text(`• ${lab.testName}`, margin + 5, yPos);
        yPos += 6;
        if (lab.resultValue) {
          doc.text(`  Valoare: ${lab.resultValue}${lab.unit ? ` ${lab.unit}` : ""}`, margin + 10, yPos);
          yPos += 6;
        }
        if (lab.referenceRange) {
          doc.text(`  Interval referință: ${lab.referenceRange}`, margin + 10, yPos);
          yPos += 6;
        }
        yPos += 2;
      });
      yPos += 5;
    });
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 8: PROGRAMĂRI ==========
  if (data.appointments && data.appointments.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("8. ISTORIC PROGRAMĂRI", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Sortează după dată (cele mai recente primele)
    const sortedAppointments = [...data.appointments].sort((a, b) => 
      new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
    );
    
    sortedAppointments.slice(0, 20).forEach((apt) => {
      checkPageBreak(8);
      const statusText = apt.status === "scheduled" ? "Confirmată" : apt.status === "pending" ? "În așteptare" : "Anulată";
      const reasonText = apt.reason ? ` - ${apt.reason}` : "";
      doc.text(`• ${formatDateTime(apt.schedule).dateTime} - ${formatPhysicianName(apt.primaryPhysician)} (${statusText})${reasonText}`, margin + 5, yPos);
      yPos += 6;
    });
    
    if (sortedAppointments.length > 20) {
      doc.text(`... și încă ${sortedAppointments.length - 20} programări`, margin + 5, yPos);
      yPos += 6;
    }
    yPos += 5;
    checkPageBreak();
  }

  // ========== SECȚIUNEA 9: DOCUMENTE MEDICALE ==========
  if (data.documents && data.documents.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("9. DOCUMENTE MEDICALE", margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    data.documents.forEach((docItem) => {
      checkPageBreak(8);
      const typeText = docItem.documentType === "analysis" ? "Analiză" : 
                      docItem.documentType === "image" ? "Imagine" :
                      docItem.documentType === "report" ? "Raport" :
                      docItem.documentType === "consent" ? "Consimțământ" :
                      docItem.documentType === "certificate" ? "Certificat" : "Alt tip";
      doc.text(`• ${docItem.fileName} (${typeText}) - ${formatDateTime(docItem.uploadedAt).dateOnly}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // Footer pe toate paginile
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Document generat pe ${formatDateTime(new Date().toISOString()).dateTime} de către eHealth.ro | Pagina ${i} din ${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

// ========== RAPOARTE (dashboard) ==========
export interface ReportsPDFData {
  period: string;
  generatedAt: string;
  appointmentsByDay: Array<{ date: string; count: number }>;
  appointmentsByDoctor: Array<{ name: string; count: number }>;
  emergenciesByDay: Array<{ date: string; count: number }>;
  imagingByDay: Array<{ date: string; count: number }>;
}

export function generateReportsPDF(data: ReportsPDFData): Buffer {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  const checkPageBreak = (required: number = 15) => {
    if (yPos + required > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RAPOARTE - Panou Administrator", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Perioadă: ultimele ${data.period} zile | Generat: ${data.generatedAt}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. Programări pe zile", margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.appointmentsByDay.slice(0, 25).forEach((r) => {
    checkPageBreak(6);
    doc.text(`${r.date}: ${r.count} programări`, margin + 5, yPos);
  yPos += 6;
  });
  if (data.appointmentsByDay.length > 25) {
    doc.text(`... și încă ${data.appointmentsByDay.length - 25} zile`, margin + 5, yPos);
    yPos += 6;
  }
  yPos += 5;
  checkPageBreak();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. Ocupare medici (nr. programări)", margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.appointmentsByDoctor.forEach((r) => {
    checkPageBreak(6);
    doc.text(`${r.name}: ${r.count}`, margin + 5, yPos);
    yPos += 6;
  });
  yPos += 5;
  checkPageBreak();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. Urgențe pe zile", margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.emergenciesByDay.slice(0, 25).forEach((r) => {
    checkPageBreak(6);
    doc.text(`${r.date}: ${r.count} cazuri`, margin + 5, yPos);
  yPos += 6;
  });
  if (data.emergenciesByDay.length > 25) {
    doc.text(`... și încă ${data.emergenciesByDay.length - 25} zile`, margin + 5, yPos);
    yPos += 6;
  }
  yPos += 5;
  checkPageBreak();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("4. Investigații imagistice pe zile", margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  data.imagingByDay.slice(0, 25).forEach((r) => {
    checkPageBreak(6);
    doc.text(`${r.date}: ${r.count} investigații`, margin + 5, yPos);
    yPos += 6;
  });
  if (data.imagingByDay.length > 25) {
    doc.text(`... și încă ${data.imagingByDay.length - 25} zile`, margin + 5, yPos);
    yPos += 6;
  }

  return Buffer.from(doc.output("arraybuffer"));
}

// ========== SCRISOARE MEDICALĂ ==========
export interface MedicalLetterPDFData {
  patient: { name: string; birthDate?: string; identificationNumber?: string };
  doctor: { name: string; specialty?: string };
  date: string;
  title: string;
  body: string;
}

export function generateMedicalLetterPDF(data: MedicalLetterPDFData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 20;

  const addWrapped = (text: string, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * (fontSize * 0.4 + 2);
  };

  doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
  doc.text(data.title, pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
  doc.text(`Data: ${formatDateTime(data.date).dateOnly}`, margin, yPos);
        yPos += 6;
  doc.text(`Pacient: ${data.patient.name}`, margin, yPos);
      yPos += 6;
  if (data.patient.birthDate) {
    doc.text(`Data nașterii: ${formatDateTime(data.patient.birthDate).dateOnly}`, margin, yPos);
        yPos += 6;
      }
  if (data.patient.identificationNumber) {
    doc.text(`CNP: ${data.patient.identificationNumber}`, margin, yPos);
    yPos += 6;
  }
  doc.text(`Medic: ${data.doctor.name}${data.doctor.specialty ? ` (${data.doctor.specialty})` : ""}`, margin, yPos);
  yPos += 12;

  addWrapped(data.body);
  return Buffer.from(doc.output("arraybuffer"));
}

// ========== LISTĂ PROGRAMĂRI (export) ==========
export interface AppointmentsListPDFData {
  title: string;
  generatedAt: string;
  appointments: Array<{
    schedule: Date | string;
    primaryPhysician: string;
    reason?: string;
    status: string;
    patientName?: string;
  }>;
}

export function generateAppointmentsListPDF(data: AppointmentsListPDFData): Buffer {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
  doc.text(data.title, pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
    doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generat: ${data.generatedAt}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  data.appointments.slice(0, 50).forEach((apt, i) => {
    if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
    const statusRo = apt.status === "scheduled" ? "Confirmată" : apt.status === "pending" ? "În așteptare" : "Anulată";
    const line = `${i + 1}. ${formatDateTime(apt.schedule).dateTime} - ${formatPhysicianName(apt.primaryPhysician)} (${statusRo})${apt.patientName ? ` - ${apt.patientName}` : ""}${apt.reason ? ` - ${apt.reason}` : ""}`;
    const lines = doc.splitTextToSize(line, pageWidth - 2 * margin);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 6 + 2;
  });
  if (data.appointments.length > 50) {
    doc.text(`... și încă ${data.appointments.length - 50} programări`, margin, yPos);
  }
  return Buffer.from(doc.output("arraybuffer"));
}
