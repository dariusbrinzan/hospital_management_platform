import { NextRequest, NextResponse } from "next/server";
import { medicalRecordHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const records = medicalRecordHelpers.getByPatientId(patientId);
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea istoricului medical" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      appointmentId,
      doctorName,
      recordType,
      visitDate,
      chiefComplaint,
      subjectiveNotes,
      objectiveFindings,
      assessment,
      plan,
      notes,
    } = body;

    if (!patientId || !doctorName || !recordType || !visitDate) {
      return NextResponse.json(
        { error: "patientId, doctorName, recordType, and visitDate are required" },
        { status: 400 }
      );
    }

    const record = medicalRecordHelpers.create({
      patientId,
      appointmentId,
      doctorName,
      recordType,
      visitDate,
      chiefComplaint,
      subjectiveNotes,
      objectiveFindings,
      assessment,
      plan,
      notes,
    });

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("Error creating medical record:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea înregistrării medicale" },
      { status: 500 }
    );
  }
}
