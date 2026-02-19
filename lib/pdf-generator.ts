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
