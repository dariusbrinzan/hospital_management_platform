import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const treatments = hospitalAdmissionHelpers.getTreatments(params.admissionId);
    return NextResponse.json(treatments);
  } catch (error: any) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea tratamentelor" },
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

    const treatment = hospitalAdmissionHelpers.addTreatment(params.admissionId, {
      medicationName: body.medicationName,
      dosage: body.dosage,
      frequency: body.frequency,
      route: body.route,
      administeredBy: body.administeredBy,
      notes: body.notes,
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error: any) {
    console.error("Error adding treatment:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea tratamentului" },
      { status: 400 }
    );
  }
}
