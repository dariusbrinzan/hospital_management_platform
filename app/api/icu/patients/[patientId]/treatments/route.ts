import { NextRequest, NextResponse } from "next/server";
import { icuHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const treatments = icuHelpers.getTreatmentsByPatientId(params.patientId);
    return NextResponse.json(treatments);
  } catch (error: any) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea tratamentelor" },
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
      medicationName,
      dosage,
      frequency,
      route,
      administeredBy,
      notes,
    } = body;

    if (!medicationName || !dosage || !frequency) {
      return NextResponse.json(
        { error: "medicationName, dosage, și frequency sunt obligatorii" },
        { status: 400 }
      );
    }

    const treatment = icuHelpers.addTreatment({
      icuPatientId: params.patientId,
      medicationName,
      dosage,
      frequency,
      route,
      administeredBy,
      notes,
    });

    return NextResponse.json(treatment);
  } catch (error: any) {
    console.error("Error adding treatment:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea tratamentului" },
      { status: 500 }
    );
  }
}
