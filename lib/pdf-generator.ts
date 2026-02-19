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
  }>;
  appointmentId?: string;
  date: Date | string;
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

export function generateAnalysisPDF(data: AnalysisPDFData): Buffer {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Raport Analize Medicale", 105, yPos, { align: "center" });
  yPos += 15;

  // Informații pacient
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Informații Pacient", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nume: ${data.patient.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Data nașterii: ${formatDateTime(data.patient.birthDate).date}`, 20, yPos);
  yPos += 6;
  doc.text(`Gen: ${data.patient.gender}`, 20, yPos);
  yPos += 6;
  if (data.patient.phone) {
    doc.text(`Telefon: ${data.patient.phone}`, 20, yPos);
    yPos += 6;
  }
  if (data.patient.email) {
    doc.text(`Email: ${data.patient.email}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Data analizelor
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Data Analizelor", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(formatDateTime(data.date).date, 20, yPos);
  yPos += 6;
  if (data.appointmentId) {
    doc.text(`Programare: #${data.appointmentId.slice(-6)}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Rezultate analize
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Rezultate Analize", 20, yPos);
  yPos += 10;

  const analysesWithResults = data.analyses.filter((a) => a.resultValue);
  const analysesPending = data.analyses.filter((a) => !a.resultValue);

  if (analysesWithResults.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    analysesWithResults.forEach((analysis, index) => {
      // Verifică dacă trebuie să adăugăm o pagină nouă
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${analysis.testName}`, 20, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      if (analysis.testCategory) {
        doc.text(`Categorie: ${analysis.testCategory}`, 20, yPos);
        yPos += 6;
      }
      doc.text(`Valoare: ${analysis.resultValue}${analysis.unit ? ` ${analysis.unit}` : ""}`, 20, yPos);
      yPos += 6;
      if (analysis.referenceRange) {
        doc.text(`Interval de referință: ${analysis.referenceRange}`, 20, yPos);
        yPos += 6;
      }
      if (analysis.notes) {
        const notesLines = doc.splitTextToSize(`Observații: ${analysis.notes}`, 170);
        doc.text(notesLines, 20, yPos);
        yPos += notesLines.length * 6;
      }
      yPos += 5;
    });
  }

  if (analysesPending.length > 0) {
    // Verifică dacă trebuie să adăugăm o pagină nouă
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Analize în procesare:", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    analysesPending.forEach((analysis) => {
      doc.text(`• ${analysis.testName}${analysis.testCategory ? ` (${analysis.testCategory})` : ""}`, 20, yPos);
      yPos += 6;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Document generat pe ${formatDateTime(new Date().toISOString()).dateTime} de către eHealth.ro`,
      105,
      285,
      { align: "center" }
    );
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
      doc.text(`• ${formatDateTime(apt.schedule).dateTime} - Dr. ${apt.primaryPhysician} (${statusText})${reasonText}`, margin + 5, yPos);
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
