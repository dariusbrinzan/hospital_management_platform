import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import {
  patientHelpers,
  allergyHelpers,
  vaccinationHelpers,
  familyHistoryHelpers,
  prescriptionHelpers,
  medicalRecordHelpers,
  labResultHelpers,
  medicalDocumentHelpers,
} from "@/lib/db-helpers";
import { generateFullMedicalRecordPDF } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { patientId } = params;
    const patient = patientHelpers.getById(patientId);

    if (!patient) {
      return NextResponse.json({ error: "Pacientul nu a fost găsit" }, { status: 404 });
    }

    // Verifică dacă pacientul are acces (doar propriul dosar sau admin)
    if (patient.userId !== session.$id) {
      // Aici poți adăuga verificare pentru admin dacă e necesar
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Obține toate datele pentru dosarul complet
    const allergies = allergyHelpers.getByPatientId(patientId);
    const vaccinations = vaccinationHelpers.getByPatientId(patientId);
    const familyHistory = familyHistoryHelpers.getByPatientId(patientId);
    const activePrescriptions = prescriptionHelpers.getActiveByPatientId(patientId);
    const medicalRecords = medicalRecordHelpers.getByPatientId(patientId);
    const labResults = labResultHelpers.getByPatientId(patientId);
    const appointments = await getPatientAppointments(patient.userId);
    const documents = medicalDocumentHelpers.getByPatientId(patientId);

    // Pregătește datele pentru PDF
    const pdfData = {
      patient: {
        name: patient.name,
        birthDate: patient.birthDate,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        bloodType: patient.bloodType || undefined,
        height: patient.height || undefined,
        weight: patient.weight || undefined,
      },
      allergies: allergies.map((a: any) => ({
        allergenName: a.allergenName,
        allergenType: a.allergenType,
        severity: a.severity,
        status: a.status,
      })),
      vaccinations: vaccinations.map((v: any) => ({
        vaccineName: v.vaccineName,
        administrationDate: v.administrationDate,
        nextDoseDate: v.nextDoseDate || undefined,
      })),
      familyHistory: familyHistory.map((fh: any) => ({
        relation: fh.relation,
        condition: fh.condition,
        ageOfOnset: fh.ageOfOnset || undefined,
      })),
      activePrescriptions: activePrescriptions.map((rx: any) => ({
        medicationName: rx.medicationName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        startDate: rx.startDate,
        endDate: rx.endDate || undefined,
      })),
      medicalRecords: medicalRecords.map((mr: any) => ({
        visitDate: mr.visitDate,
        doctorName: mr.doctorName,
        chiefComplaint: mr.chiefComplaint || undefined,
        assessment: mr.assessment || undefined,
        diagnoses: mr.diagnoses?.map((d: any) => ({
          diagnosisName: d.diagnosisName,
          status: d.status,
        })) || [],
        prescriptions: mr.prescriptions?.map((p: any) => ({
          medicationName: p.medicationName,
          dosage: p.dosage,
          frequency: p.frequency,
        })) || [],
      })),
      labResults: labResults.map((lr: any) => ({
        testName: lr.testName,
        resultValue: lr.resultValue || undefined,
        unit: lr.unit || undefined,
        referenceRange: lr.referenceRange || undefined,
        performedDate: lr.performedDate,
      })),
      appointments: appointments.all.map((apt: any) => ({
        schedule: apt.schedule,
        primaryPhysician: apt.primaryPhysician,
        reason: apt.reason || undefined,
        status: apt.status,
      })),
      documents: documents.map((doc: any) => ({
        documentType: doc.documentType,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
      })),
    };

    // Generează PDF
    const pdfBuffer = generateFullMedicalRecordPDF(pdfData);

    // Returnează PDF-ul
    const fileName = `dosar-medical-${patient.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating full medical record PDF:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea PDF-ului" },
      { status: 500 }
    );
  }
}
