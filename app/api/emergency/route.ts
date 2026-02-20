import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers, doctorsOnDutyHelpers } from "@/lib/db-helpers";
import { notificationHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, patientName, patientPhone, patientAge, patientGender, triageLevel, priority, chiefComplaint, vitalSigns } = body;

    // Creează cazul de urgență
    const emergencyCase = emergencyHelpers.create({
      patientId: patientId || null,
      patientName: patientName || undefined,
      patientPhone: patientPhone || undefined,
      patientAge: patientAge || undefined,
      patientGender: patientGender || undefined,
      triageLevel,
      priority,
      chiefComplaint,
      vitalSigns,
    });

    // Găsește medic disponibil și alocă-l automat
    const availableDoctors = doctorsOnDutyHelpers.getAvailableDoctors();
    if (availableDoctors.length > 0 && emergencyCase) {
      const assignedDoctor = availableDoctors[0];
      emergencyHelpers.assignDoctor(emergencyCase.$id, assignedDoctor.doctorName);

      // Creează notificare pentru medic
      // TODO: Găsește userId-ul medicului pe baza numelui
      // notificationHelpers.create({
      //   userId: doctorUserId,
      //   type: "emergency",
      //   title: "Caz nou de urgență",
      //   message: `Ați fost alocat unui caz nou de urgență: ${chiefComplaint}`,
      // });
    }

    if (!emergencyCase) {
      return NextResponse.json({ error: "Failed to create emergency case" }, { status: 500 });
    }
    return NextResponse.json({ id: emergencyCase.$id, ...emergencyCase });
  } catch (error: any) {
    console.error("Error creating emergency case:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea cazului de urgență" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cases = emergencyHelpers.getAll();
    return NextResponse.json(cases);
  } catch (error: any) {
    console.error("Error fetching emergency cases:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea cazurilor" },
      { status: 500 }
    );
  }
}
