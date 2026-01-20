import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers } from "@/lib/db-helpers";
import { patientHelpers } from "@/lib/db-helpers";
import { generateConsultationPDF } from "@/lib/pdf-generator";
import { requireAuth } from "@/lib/actions/auth.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    // Verifică autentificarea
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { recordId } = params;
    const record = medicalRecordHelpers.getById(recordId);

    if (!record) {
      return NextResponse.json({ error: "Consultația nu a fost găsită" }, { status: 404 });
    }

    // Verifică dacă pacientul are acces la această consultație
    const patient = patientHelpers.getById(record.patientId);
    if (!patient || patient.userId !== session.$id) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Obține informațiile doctorului
    const { Doctors } = require("@/constants");
    const doctor = Doctors.find((d: any) => d.name === record.doctorName);

    // Generează PDF
    const pdfBuffer = generateConsultationPDF({
      patient: {
        name: patient.name,
        birthDate: patient.birthDate,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
      },
      doctor: {
        name: record.doctorName,
        specialty: doctor?.specialty,
      },
      record: {
        visitDate: record.visitDate,
        chiefComplaint: record.chiefComplaint,
        assessment: record.assessment,
        plan: record.plan,
        diagnoses: record.diagnoses,
        prescriptions: record.prescriptions,
        vitalSigns: record.vitalSigns,
      },
    });

    // Returnează PDF-ul
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="consultatie-${recordId.slice(-6)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating consultation PDF:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea PDF-ului" },
      { status: 500 }
    );
  }
}
