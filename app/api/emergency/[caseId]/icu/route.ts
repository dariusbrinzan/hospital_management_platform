import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers, icuHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { diagnosis, assignedDoctorId } = body;

    // Obține cazul de urgență
    const emergencyCase = emergencyHelpers.getById(caseId);
    if (!emergencyCase) {
      return NextResponse.json(
        { error: "Cazul de urgență nu a fost găsit" },
        { status: 404 }
      );
    }

    // Internare în ATI
    const icuPatient = icuHelpers.admitPatient({
      emergencyCaseId: caseId,
      patientId: emergencyCase.patientId || null,
      patientName: emergencyCase.patientName || emergencyCase.patient?.name || null,
      patientPhone: emergencyCase.patientPhone || emergencyCase.patient?.phone || null,
      patientAge: emergencyCase.patientAge || null,
      patientGender: emergencyCase.patientGender || emergencyCase.patient?.gender || null,
      diagnosis: diagnosis || emergencyCase.chiefComplaint,
      assignedDoctorId: assignedDoctorId || emergencyCase.assignedDoctorId || null,
    });

    // Tranziție la starea ICU
    emergencyHelpers.updateState(caseId, "icu", assignedDoctorId || "System", undefined);

    return NextResponse.json({ success: true, icuPatient, emergencyCase: emergencyHelpers.getById(caseId) });
  } catch (error: any) {
    console.error("Error transferring to ICU:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la transferul în ATI" },
      { status: 500 }
    );
  }
}
