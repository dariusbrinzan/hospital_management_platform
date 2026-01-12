import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { carePlan } = body;

    emergencyHelpers.updateCarePlan(caseId, carePlan);

    const updatedCase = emergencyHelpers.getById(caseId);
    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error("Error updating care plan:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea planului de îngrijire" },
      { status: 500 }
    );
  }
}
