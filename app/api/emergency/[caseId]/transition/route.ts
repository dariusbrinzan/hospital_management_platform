import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { newState, performedBy, skipReason } = body;

    const updatedCase = emergencyHelpers.updateState(
      caseId,
      newState,
      performedBy,
      skipReason
    );

    if (!updatedCase) {
      return NextResponse.json(
        { error: "Cazul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error("Error updating emergency case state:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea stării" },
      { status: 500 }
    );
  }
}
