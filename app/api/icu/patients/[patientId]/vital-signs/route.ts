import { NextRequest, NextResponse } from "next/server";
import { icuHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    
    const vitalSigns = icuHelpers.getVitalSignsByPatientId(params.patientId, limit);
    return NextResponse.json(vitalSigns);
  } catch (error: any) {
    console.error("Error fetching vital signs:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea semnelor vitale" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const body = await request.json();
    const {
      bloodPressureSystolic,
      bloodPressureDiastolic,
      pulse,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      glucoseLevel,
      consciousnessLevel,
      notes,
      recordedBy,
    } = body;

    const vitalSigns = icuHelpers.addVitalSigns({
      icuPatientId: params.patientId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      pulse,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      glucoseLevel,
      consciousnessLevel,
      notes,
      recordedBy,
    });

    return NextResponse.json(vitalSigns);
  } catch (error: any) {
    console.error("Error adding vital signs:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea semnelor vitale" },
      { status: 500 }
    );
  }
}
