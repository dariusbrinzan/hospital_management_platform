import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const admission = hospitalAdmissionHelpers.getAdmissionById(params.admissionId);

    if (!admission) {
      return NextResponse.json(
        { error: "Internarea nu a fost găsită" },
        { status: 404 }
      );
    }

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Error fetching admission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea internării" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { admissionId: string } }
) {
  try {
    const body = await request.json();
    const admission = hospitalAdmissionHelpers.updateAdmission(params.admissionId, body);

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Error updating admission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea internării" },
      { status: 400 }
    );
  }
}
