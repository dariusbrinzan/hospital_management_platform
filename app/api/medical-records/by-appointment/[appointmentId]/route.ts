import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const record = medicalRecordHelpers.getByAppointmentId(params.appointmentId);
    if (!record) {
      return NextResponse.json(null);
    }
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error fetching medical record by appointment:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea înregistrării medicale" },
      { status: 500 }
    );
  }
}
