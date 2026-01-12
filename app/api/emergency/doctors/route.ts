import { NextRequest, NextResponse } from "next/server";
import { doctorsOnDutyHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Obține toți medicii de gardă, nu doar cei disponibili
    const allDoctors = db.prepare("SELECT * FROM doctors_on_duty ORDER BY weekStartDate DESC").all() as any[];
    const formatted = allDoctors.map(d => ({
      $id: d.id,
      doctorName: d.doctorName,
      weekStartDate: new Date(d.weekStartDate),
      weekEndDate: new Date(d.weekEndDate),
      specialty: d.specialty,
      isAvailable: d.isAvailable === 1,
      maxConcurrentEmergencies: d.maxConcurrentEmergencies,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    }));
    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching doctors on duty:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea medicilor de gardă" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorName, weekStartDate, weekEndDate, maxConcurrentEmergencies } = body;

    const duty = doctorsOnDutyHelpers.create({
      doctorName,
      weekStartDate,
      weekEndDate,
      maxConcurrentEmergencies: maxConcurrentEmergencies || 3,
    });

    return NextResponse.json(duty);
  } catch (error: any) {
    console.error("Error creating doctor on duty:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea medicului de gardă" },
      { status: 500 }
    );
  }
}
