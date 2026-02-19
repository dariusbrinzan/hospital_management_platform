import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const procedures = hospitalAdmissionHelpers.getProcedures(params.admissionId);
    return NextResponse.json(procedures);
  } catch (error: any) {
    console.error("Error fetching procedures:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea procedurilor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const body = await request.json();

    const procedure = hospitalAdmissionHelpers.addProcedure(params.admissionId, {
      procedureName: body.procedureName,
      procedureDate: body.procedureDate,
      performedBy: body.performedBy,
      procedureType: body.procedureType,
      outcome: body.outcome,
      notes: body.notes,
    });

    return NextResponse.json(procedure, { status: 201 });
  } catch (error: any) {
    console.error("Error adding procedure:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea procedurii" },
      { status: 400 }
    );
  }
}
