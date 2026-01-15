import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";

/**
 * Endpoint de debug pentru a obține patientId
 * Utilizare: GET /api/debug/patient-id
 * 
 * Returnează userId și patientId pentru utilizatorul autentificat
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const patient = await getPatient(session.$id);

    if (!patient) {
      return NextResponse.json(
        { 
          userId: session.$id,
          patientId: null,
          message: "Pacientul nu este înregistrat. Completează formularul de înregistrare."
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      userId: session.$id,
      patientId: patient.id,
      patientName: patient.name,
      message: "Folosește acest patientId în scriptul de testare"
    });
  } catch (error: any) {
    console.error("Error getting patient ID:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la obținerea patientId" },
      { status: 500 }
    );
  }
}
