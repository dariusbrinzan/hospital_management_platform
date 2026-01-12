import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { triageLevel, priority, vitalSigns, observations } = body;

    const now = new Date().toISOString();
    const db = (await import("@/lib/db")).default;

    // Actualizează cazul cu datele de triaj
    db.prepare(`
      UPDATE emergency_cases 
      SET triageLevel = ?, priority = ?, vitalSigns = ?, triageTime = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      triageLevel,
      priority,
      vitalSigns ? JSON.stringify(vitalSigns) : null,
      now,
      now,
      caseId
    );

    // Tranziție la starea triage
    emergencyHelpers.updateState(caseId, "triage", "System", undefined);

    const updatedCase = emergencyHelpers.getById(caseId);
    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error("Error updating triage:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea triajului" },
      { status: 500 }
    );
  }
}
