import { NextRequest, NextResponse } from "next/server";
import { emergencyHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { dischargeLetter } = body;

    // Actualizează scrisoarea de externare
    emergencyHelpers.updateDischargeLetter(caseId, dischargeLetter);

    // Creează documentul de externare
    const docId = (await import("@/lib/db-helpers")).generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO emergency_documents (
        id, emergencyCaseId, documentType, content, createdAt
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      docId,
      caseId,
      "discharge_letter",
      dischargeLetter,
      now
    );

    // Tranziție la starea discharge
    emergencyHelpers.updateState(caseId, "discharge", "System", undefined);

    const updatedCase = emergencyHelpers.getById(caseId);
    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error("Error updating discharge:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea externării" },
      { status: 500 }
    );
  }
}
