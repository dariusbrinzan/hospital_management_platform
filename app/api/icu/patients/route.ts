import { NextRequest, NextResponse } from "next/server";
import { icuHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const patients = icuHelpers.getAllPatients();
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error("Error fetching ICU patients:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea pacienților ATI" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      emergencyCaseId,
      patientId,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      diagnosis,
      assignedDoctorId,
    } = body;

    const patient = icuHelpers.admitPatient({
      emergencyCaseId: emergencyCaseId || null,
      patientId: patientId || null,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      diagnosis,
      assignedDoctorId,
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Error admitting patient to ICU:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la internarea în ATI" },
      { status: 500 }
    );
  }
}
