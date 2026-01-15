import { NextRequest, NextResponse } from "next/server";
import { allergyHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const allergies = allergyHelpers.getByPatientId(params.patientId);
    return NextResponse.json(allergies);
  } catch (error: any) {
    console.error("Error fetching allergies:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea alergiilor" },
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
    const allergy = allergyHelpers.create({
      patientId: params.patientId,
      ...body,
    });

    return NextResponse.json(allergy);
  } catch (error: any) {
    console.error("Error creating allergy:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea alergiei" },
      { status: 500 }
    );
  }
}
