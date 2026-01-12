import { NextRequest, NextResponse } from "next/server";
import { doctorsOnDutyHelpers } from "@/lib/db-helpers";

// GET - Obține workload-ul pentru toți medicii
export async function GET(request: NextRequest) {
  try {
    const workloads = doctorsOnDutyHelpers.getAllWorkloads();
    return NextResponse.json(workloads);
  } catch (error: any) {
    console.error("Error fetching workloads:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea workload-ului" },
      { status: 500 }
    );
  }
}

// POST - Generează rotație automată
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorsPerWeek, minDoctorsPerWeek, maxDoctorsPerWeek } = body;

    const rotation = doctorsOnDutyHelpers.generateAutomaticRotation({
      doctorsPerWeek,
      minDoctorsPerWeek,
      maxDoctorsPerWeek,
    });

    return NextResponse.json({
      success: true,
      message: `Rotație generată cu succes pentru ${rotation.totalDoctors} medici`,
      rotation,
    });
  } catch (error: any) {
    console.error("Error generating rotation:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea rotației" },
      { status: 500 }
    );
  }
}
