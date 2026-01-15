import { NextRequest, NextResponse } from "next/server";
import { diagnosisHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await request.json();
    const {
      diagnosisCode,
      diagnosisName,
      diagnosisType,
      status,
      onsetDate,
      resolvedDate,
      notes,
    } = body;

    if (!diagnosisName || !diagnosisType || !status) {
      return NextResponse.json(
        { error: "diagnosisName, diagnosisType, and status are required" },
        { status: 400 }
      );
    }

    const diagnosis = diagnosisHelpers.create({
      medicalRecordId: params.recordId,
      diagnosisCode,
      diagnosisName,
      diagnosisType,
      status,
      onsetDate,
      resolvedDate,
      notes,
    });

    return NextResponse.json(diagnosis);
  } catch (error: any) {
    console.error("Error creating diagnosis:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea diagnosticului" },
      { status: 500 }
    );
  }
}
