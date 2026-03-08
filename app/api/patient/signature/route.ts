import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { patientHelpers, patientSignatureHelpers } from "@/lib/db-helpers";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
    }
    const patient = patientHelpers.getByUserId(session.$id);
    if (!patient) {
      return NextResponse.json({ signatures: [] });
    }
    const signatures = patientSignatureHelpers.getByPatientId(patient.$id, 20);
    return NextResponse.json({ signatures });
  } catch {
    return NextResponse.json({ signatures: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
    }

    const patient = patientHelpers.getByUserId(session.$id);
    if (!patient) {
      return NextResponse.json({ error: "Pacient negăsit." }, { status: 404 });
    }

    const body = await request.json();
    const { documentType, documentId, signatureData } = body as {
      documentType: string;
      documentId?: string | null;
      signatureData?: string;
    };

    if (!documentType || typeof documentType !== "string" || documentType.trim() === "") {
      return NextResponse.json(
        { error: "documentType este obligatoriu." },
        { status: 400 }
      );
    }

    if (!signatureData || typeof signatureData !== "string") {
      return NextResponse.json(
        { error: "signatureData (imagine semnătură) este obligatoriu." },
        { status: 400 }
      );
    }

    const created = patientSignatureHelpers.create({
      patientId: patient.$id,
      documentType: documentType.trim(),
      documentId: documentId ?? null,
      signatureData,
    });

    return NextResponse.json({
      success: true,
      signatureId: created?.$id,
      signedAt: (created as any)?.signedAt,
    });
  } catch (error: any) {
    console.error("Error saving patient signature:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la salvarea semnăturii." },
      { status: 500 }
    );
  }
}
