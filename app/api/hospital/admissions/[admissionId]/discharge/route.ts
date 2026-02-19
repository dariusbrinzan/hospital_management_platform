import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const body = await request.json();
    const dischargeInstructions = body.dischargeInstructions;

    const admission = hospitalAdmissionHelpers.dischargePatient(
      params.admissionId,
      dischargeInstructions
    );

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Error discharging patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la externare" },
      { status: 400 }
    );
  }
}
