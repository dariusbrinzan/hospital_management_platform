import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const record = medicalRecordHelpers.getById(params.recordId);
    if (!record) {
      return NextResponse.json(
        { error: "Medical record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error fetching medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea înregistrării medicale" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await request.json();
    const record = medicalRecordHelpers.update(params.recordId, body);
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error updating medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea înregistrării medicale" },
      { status: 500 }
    );
  }
}
