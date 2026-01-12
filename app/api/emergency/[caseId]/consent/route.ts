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
    const { consentGiven, consentType, signedBy } = body;

    // Actualizează consimțământul
    emergencyHelpers.updateConsent(caseId, consentGiven);

    // Creează documentul de consimțământ
    const docId = (await import("@/lib/db-helpers")).generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO emergency_documents (
        id, emergencyCaseId, documentType, content, signedBy, signedAt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      caseId,
      "consent",
      `Tip consimțământ: ${consentType}\nSemnat de: ${signedBy}\nData: ${now}`,
      signedBy,
      now,
      now
    );

    // Tranziție la starea consent
    emergencyHelpers.updateState(caseId, "consent", signedBy, undefined);

    const updatedCase = emergencyHelpers.getById(caseId);
    return NextResponse.json(updatedCase);
  } catch (error: any) {
    console.error("Error updating consent:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea consimțământului" },
      { status: 500 }
    );
  }
}
