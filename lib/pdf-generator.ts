import { jsPDF } from "jspdf";
import { formatDateTime } from "./utils";

interface PatientInfo {
  name: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
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
    assessment?: string;
    plan?: string;
    diagnoses?: Array<{ diagnosisName: string; diagnosisCode?: string; status: string }>;
    prescriptions?: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      instructions?: string;
    }>;
    vitalSigns?: {
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      pulse?: number;
      temperature?: number;
      weight?: number;
    };
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

export function generateConsultationPDF(data: ConsultationPDFData): Buffer {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Raport Consultație Medicală", 105, yPos, { align: "center" });
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

  // Informații doctor
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Informații Medic", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nume: ${data.doctor.name}`, 20, yPos);
  yPos += 6;
  if (data.doctor.specialty) {
    doc.text(`Specialitate: ${data.doctor.specialty}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Data consultației
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Data Consultației", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(formatDateTime(data.record.visitDate).dateTime, 20, yPos);
  yPos += 10;

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Motiv consultație
  if (data.record.chiefComplaint) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Motiv Consultație", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const complaintLines = doc.splitTextToSize(data.record.chiefComplaint, 170);
    doc.text(complaintLines, 20, yPos);
    yPos += complaintLines.length * 6 + 5;
  }

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Evaluare
  if (data.record.assessment) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Evaluare", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const assessmentLines = doc.splitTextToSize(data.record.assessment, 170);
    doc.text(assessmentLines, 20, yPos);
    yPos += assessmentLines.length * 6 + 5;
  }

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Diagnosticuri
  if (data.record.diagnoses && data.record.diagnoses.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosticuri", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.record.diagnoses.forEach((diagnosis) => {
      const statusText = diagnosis.status === "active" ? "Activ" : diagnosis.status === "resolved" ? "Rezolvat" : "Cronic";
      doc.text(`• ${diagnosis.diagnosisName}${diagnosis.diagnosisCode ? ` (${diagnosis.diagnosisCode})` : ""} - ${statusText}`, 20, yPos);
      yPos += 6;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    yPos += 3;
  }

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Prescripții
  if (data.record.prescriptions && data.record.prescriptions.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Medicamente Prescrise", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.record.prescriptions.forEach((prescription) => {
      doc.text(`• ${prescription.medicationName}`, 20, yPos);
      yPos += 6;
      doc.text(`  Doză: ${prescription.dosage}`, 25, yPos);
      yPos += 6;
      doc.text(`  Frecvență: ${prescription.frequency}`, 25, yPos);
      yPos += 6;
      if (prescription.instructions) {
        const instructionLines = doc.splitTextToSize(`  Instrucțiuni: ${prescription.instructions}`, 165);
        doc.text(instructionLines, 25, yPos);
        yPos += instructionLines.length * 6;
      }
      yPos += 3;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    yPos += 3;
  }

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Semne vitale
  if (data.record.vitalSigns) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Semne Vitale", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (data.record.vitalSigns.bloodPressureSystolic) {
      doc.text(`Tensiune arterială: ${data.record.vitalSigns.bloodPressureSystolic}/${data.record.vitalSigns.bloodPressureDiastolic} mmHg`, 20, yPos);
      yPos += 6;
    }
    if (data.record.vitalSigns.pulse) {
      doc.text(`Puls: ${data.record.vitalSigns.pulse} bpm`, 20, yPos);
      yPos += 6;
    }
    if (data.record.vitalSigns.temperature) {
      doc.text(`Temperatură: ${data.record.vitalSigns.temperature}°C`, 20, yPos);
      yPos += 6;
    }
    if (data.record.vitalSigns.weight) {
      doc.text(`Greutate: ${data.record.vitalSigns.weight} kg`, 20, yPos);
      yPos += 6;
    }
    yPos += 5;
  }

  // Verifică dacă trebuie să adăugăm o pagină nouă
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Plan de tratament
  if (data.record.plan) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Plan de Tratament", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const planLines = doc.splitTextToSize(data.record.plan, 170);
    doc.text(planLines, 20, yPos);
    yPos += planLines.length * 6 + 5;
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
