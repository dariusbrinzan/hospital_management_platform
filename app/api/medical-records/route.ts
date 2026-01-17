import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers, patientHelpers, appointmentHelpers } from "@/lib/db-helpers";
import { createNotification } from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const records = medicalRecordHelpers.getByPatientId(patientId);
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea istoricului medical" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      appointmentId,
      doctorName,
      recordType,
      visitDate,
      chiefComplaint,
      subjectiveNotes,
      objectiveFindings,
      assessment,
      plan,
      notes,
    } = body;

    if (!patientId || !doctorName || !recordType || !visitDate) {
      return NextResponse.json(
        { error: "patientId, doctorName, recordType, and visitDate are required" },
        { status: 400 }
      );
    }

    const record = medicalRecordHelpers.create({
      patientId,
      appointmentId,
      doctorName,
      recordType,
      visitDate,
      chiefComplaint,
      subjectiveNotes,
      objectiveFindings,
      assessment,
      plan,
      notes,
    });

    // Obține userId-ul din patientId pentru a crea notificare
    const patient = patientHelpers.getById(patientId);
    if (patient && patient.userId) {
      // Obține informații despre programare dacă există
      let appointmentInfo = "";
      if (appointmentId) {
        const appointment = appointmentHelpers.getById(appointmentId);
        if (appointment) {
          appointmentInfo = ` pentru programarea din ${formatDateTime(appointment.schedule).dateTime}`;
        }
      }

      // Creează notificare pentru pacient că consultația a fost adăugată
      await createNotification({
        userId: patient.userId,
        type: "consultation_added",
        title: "Consultație medicală adăugată",
        message: `Dr. ${doctorName} a adăugat o consultație medicală${appointmentInfo}. Puteți vizualiza detaliile în istoricul medical.`,
        appointmentId: appointmentId || undefined,
      });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error creating medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea înregistrării medicale" },
      { status: 500 }
    );
  }
}
