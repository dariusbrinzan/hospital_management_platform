import { NextRequest, NextResponse } from "next/server";
import { hospitalAdmissionHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const admission = hospitalAdmissionHelpers.admitPatient({
      patientId: body.patientId || null,
      appointmentId: body.appointmentId || null,
      patientName: body.patientName,
      patientPhone: body.patientPhone,
      patientAge: body.patientAge,
      patientGender: body.patientGender,
      department: body.department,
      roomType: body.roomType,
      admissionReason: body.admissionReason,
      diagnosis: body.diagnosis,
      admittingDoctor: body.admittingDoctor,
      assignedDoctor: body.assignedDoctor,
      insuranceProvider: body.insuranceProvider,
      insurancePolicyNumber: body.insurancePolicyNumber,
      expectedLengthOfStay: body.expectedLengthOfStay,
      notes: body.notes,
    });

    return NextResponse.json(admission, { status: 201 });
  } catch (error: any) {
    console.error("Error admitting patient:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la internare" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department") || undefined;
    const status = searchParams.get("status") || undefined;

    const admissions = hospitalAdmissionHelpers.getAllAdmissions(department, status);

    return NextResponse.json(admissions);
  } catch (error: any) {
    console.error("Error fetching admissions:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la încărcarea internărilor" },
      { status: 500 }
    );
  }
}
