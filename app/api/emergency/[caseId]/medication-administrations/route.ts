import { NextRequest, NextResponse } from "next/server";

import { emergencyHelpers, patientMedicationAdministrationHelpers } from "@/lib/db-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const emergencyCase = emergencyHelpers.getById(params.caseId);
    if (!emergencyCase) {
      return NextResponse.json({ error: "Cazul de urgență nu a fost găsit." }, { status: 404 });
    }

    const administrations = patientMedicationAdministrationHelpers.getByEmergencyCaseId(params.caseId);
    return NextResponse.json(administrations);
  } catch (error: any) {
    console.error("Error fetching emergency medication administrations:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea administrărilor medicamentoase." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const emergencyCase = emergencyHelpers.getById(params.caseId);
    if (!emergencyCase) {
      return NextResponse.json({ error: "Cazul de urgență nu a fost găsit." }, { status: 404 });
    }

    const patientId = emergencyCase.patientId ?? emergencyCase.patient?.$id;
    if (!patientId) {
      return NextResponse.json(
        { error: "Cazul nu este asociat unui pacient din sistem." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const administration = patientMedicationAdministrationHelpers.create({
      patientId,
      emergencyCaseId: params.caseId,
      stockId: body.stockId,
      dosage: body.dosage,
      quantity: Number(body.quantity),
      route: body.route,
      administrationPhase: body.administrationPhase,
      administeredBy: body.administeredBy,
      administeredAt: body.administeredAt,
      notes: body.notes,
    });

    return NextResponse.json(administration, { status: 201 });
  } catch (error: any) {
    console.error("Error creating emergency medication administration:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la înregistrarea administrării medicamentoase." },
      { status: 500 }
    );
  }
}
