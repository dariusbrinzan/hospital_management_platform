import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers, patientHelpers } from "@/lib/db-helpers";
import { generateConsultationPDF } from "@/lib/pdf-generator";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const doctorName = await getDoctorSession();
    if (!doctorName) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { recordId } = params;
    const record = medicalRecordHelpers.getById(recordId);

    if (!record) {
      return NextResponse.json({ error: "Consultația nu a fost găsită" }, { status: 404 });
    }

    if (record.doctorName !== doctorName) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const patient = record.patientId
      ? patientHelpers.getById(record.patientId)
      : null;
    const doctor = Doctors.find((d: any) => d.name === record.doctorName);

    const pdfBuffer = generateConsultationPDF({
      patient: patient
        ? {
            name: patient.name,
            birthDate: (patient as any).birthDate,
            gender: (patient as any).gender,
            phone: (patient as any).phone,
            email: (patient as any).email,
            address: (patient as any).address,
            insuranceProvider: (patient as any).insuranceProvider,
            insurancePolicyNumber: (patient as any).insurancePolicyNumber,
          }
        : {
            name: "Pacient",
            birthDate: "",
            gender: "",
          },
      doctor: {
        name: record.doctorName,
        specialty: doctor?.specialty,
      },
      record: {
        visitDate: record.visitDate,
        chiefComplaint: record.chiefComplaint,
        subjectiveNotes: record.subjectiveNotes,
        objectiveFindings: record.objectiveFindings,
        assessment: record.assessment,
        plan: record.plan,
        notes: record.notes,
        diagnoses: record.diagnoses?.map((d: any) => ({
          diagnosisName: d.diagnosisName,
          diagnosisCode: d.diagnosisCode,
          status: d.status,
          notes: d.notes,
        })),
        prescriptions: record.prescriptions?.map((rx: any) => ({
          medicationName: rx.medicationName,
          dosage: rx.dosage,
          frequency: rx.frequency,
          route: rx.route,
          quantity: rx.quantity,
          instructions: rx.instructions,
          startDate: rx.startDate,
          endDate: rx.endDate,
        })),
        vitalSigns: record.vitalSigns
          ? {
              bloodPressureSystolic: record.vitalSigns.bloodPressureSystolic,
              bloodPressureDiastolic: record.vitalSigns.bloodPressureDiastolic,
              pulse: record.vitalSigns.pulse,
              temperature: record.vitalSigns.temperature,
              oxygenSaturation: record.vitalSigns.oxygenSaturation,
              respiratoryRate: record.vitalSigns.respiratoryRate,
              weight: record.vitalSigns.weight,
              height: record.vitalSigns.height,
              bmi: record.vitalSigns.bmi,
              glucoseLevel: record.vitalSigns.glucoseLevel,
            }
          : undefined,
        labResults: record.labResults?.map((lab: any) => ({
          testName: lab.testName,
          resultValue: lab.resultValue,
          unit: lab.unit,
          referenceRange: lab.referenceRange,
          status: lab.status,
        })),
        procedures: record.procedures?.map((proc: any) => ({
          procedureName: proc.procedureName,
          procedureDate: proc.procedureDate,
          performedBy: proc.performedBy,
          outcome: proc.outcome,
          notes: proc.notes,
        })),
      },
    });

    const dateStr = new Date(record.visitDate?.toString() || "")
      .toISOString()
      .split("T")[0];
    const fileName = `raport-medical-${dateStr}-${String(record.doctorName).replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating doctor consultation PDF:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la generarea PDF-ului" },
      { status: 500 }
    );
  }
}
