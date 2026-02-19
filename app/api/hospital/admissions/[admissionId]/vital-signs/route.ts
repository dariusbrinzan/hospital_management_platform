import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const vitalSigns = hospitalAdmissionHelpers.getVitalSigns(params.admissionId);
    return NextResponse.json(vitalSigns);
  } catch (error: any) {
    console.error("Error fetching vital signs:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea semnelor vitale" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const body = await request.json();

    const vitalSigns = hospitalAdmissionHelpers.addVitalSigns(params.admissionId, {
      bloodPressureSystolic: body.bloodPressureSystolic,
      bloodPressureDiastolic: body.bloodPressureDiastolic,
      pulse: body.pulse,
      temperature: body.temperature,
      oxygenSaturation: body.oxygenSaturation,
      respiratoryRate: body.respiratoryRate,
      glucoseLevel: body.glucoseLevel,
      weight: body.weight,
      notes: body.notes,
      recordedBy: body.recordedBy,
    });

    return NextResponse.json(vitalSigns, { status: 201 });
  } catch (error: any) {
    console.error("Error adding vital signs:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea semnelor vitale" },
      { status: 400 }
    );
  }
}
