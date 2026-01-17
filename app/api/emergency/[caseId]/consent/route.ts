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

    // Obține starea curentă a cazului
    const currentCase = emergencyHelpers.getById(caseId);
    if (!currentCase) {
      return NextResponse.json(
        { error: "Cazul de urgență nu a fost găsit" },
        { status: 404 }
      );
    }

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

    // Tranziție la starea consent doar dacă nu este deja în acea stare
    if (currentCase.currentState !== "consent") {
      emergencyHelpers.updateState(caseId, "consent", signedBy, undefined);
    } else {
      // Dacă este deja în consent, doar adaugă o înregistrare în istoric pentru actualizare
      emergencyHelpers.addStateTransition(
        caseId,
        "consent",
        "consent",
        "Actualizare consimțământ",
        signedBy
      );
    }

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
