import { NextRequest, NextResponse } from "next/server";
import { vaccinationHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const vaccinations = vaccinationHelpers.getByPatientId(params.patientId);
    return NextResponse.json(vaccinations);
  } catch (error: any) {
    console.error("Error fetching vaccinations:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea vaccinărilor" },
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
    const vaccination = vaccinationHelpers.create({
      patientId: params.patientId,
      ...body,
    });

    return NextResponse.json(vaccination);
  } catch (error: any) {
    console.error("Error creating vaccination:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea vaccinării" },
      { status: 500 }
    );
  }
}
