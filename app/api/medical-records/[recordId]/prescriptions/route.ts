import { NextRequest, NextResponse } from "next/server";
import { prescriptionHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await request.json();
    const {
      medicationName,
      dosage,
      frequency,
      route,
      quantity,
      startDate,
      endDate,
      instructions,
      refills,
      status,
    } = body;

    if (!medicationName || !dosage || !frequency || !startDate) {
      return NextResponse.json(
        { error: "medicationName, dosage, frequency, and startDate are required" },
        { status: 400 }
      );
    }

    const prescription = prescriptionHelpers.create({
      medicalRecordId: params.recordId,
      medicationName,
      dosage,
      frequency,
      route,
      quantity,
      startDate,
      endDate,
      instructions,
      refills,
      status,
    });

    return NextResponse.json(prescription);
  } catch (error: any) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea rețetei" },
      { status: 500 }
    );
  }
}
