import { NextRequest, NextResponse } from "next/server";
import { medicalDocumentHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const body = await request.json();
    const approvedBy = body.approvedBy || "System";

    const document = medicalDocumentHelpers.getById(params.documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Documentul nu a fost găsit" },
        { status: 404 }
      );
    }

    const approved = medicalDocumentHelpers.approve(params.documentId, approvedBy);

    // Log acces
    medicalDocumentHelpers.logAccess(params.documentId, approvedBy, "approve");

    return NextResponse.json(approved);
  } catch (error: any) {
    console.error("Error approving document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la aprobarea documentului" },
      { status: 500 }
    );
  }
}
