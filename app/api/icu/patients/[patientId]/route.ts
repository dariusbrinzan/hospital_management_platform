import { NextRequest, NextResponse } from "next/server";
import { icuHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const patient = icuHelpers.getPatientById(params.patientId);
    if (!patient) {
      return NextResponse.json(
        { error: "Pacientul nu a fost găsit" },
        { status: 404 }
      );
    }
    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Error fetching ICU patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea pacientului" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (status) {
      const updated = icuHelpers.updatePatientStatus(params.patientId, status);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid update provided" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating ICU patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea pacientului" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const discharged = icuHelpers.dischargePatient(params.patientId);
    if (!discharged) {
      return NextResponse.json(
        { error: "Pacientul nu a fost găsit" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, patient: discharged });
  } catch (error: any) {
    console.error("Error discharging ICU patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la externarea pacientului" },
      { status: 500 }
    );
  }
}
