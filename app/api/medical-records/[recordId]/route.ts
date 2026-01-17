import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers, patientHelpers, appointmentHelpers } from "@/lib/db-helpers";
import { createNotification } from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const record = medicalRecordHelpers.getById(params.recordId);
    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error fetching medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea înregistrării medicale" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await request.json();
    const record = medicalRecordHelpers.update(params.recordId, body);
    
    if (record) {
      // Obține userId-ul din patientId pentru a crea notificare
      const patient = patientHelpers.getById(record.patientId);
      if (patient && patient.userId) {
        // Obține informații despre programare dacă există
        let appointmentInfo = "";
        if (record.appointmentId) {
          const appointment = appointmentHelpers.getById(record.appointmentId);
          if (appointment) {
            appointmentInfo = ` pentru programarea din ${formatDateTime(appointment.schedule).dateTime}`;
          }
        }

        // Creează notificare pentru pacient că consultația a fost actualizată
        await createNotification({
          userId: patient.userId,
          type: "consultation_added",
          title: "Consultație medicală actualizată",
          message: `Dr. ${record.doctorName} a actualizat consultația medicală${appointmentInfo}. Puteți vizualiza detaliile în istoricul medical.`,
          appointmentId: record.appointmentId || undefined,
        });
      }
    }
    
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error updating medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea înregistrării medicale" },
      { status: 500 }
    );
  }
}
