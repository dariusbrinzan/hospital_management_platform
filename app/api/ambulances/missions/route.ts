import { NextRequest, NextResponse } from "next/server";
import { ambulanceMissionHelpers, ambulanceHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const missions = activeOnly
      ? ambulanceMissionHelpers.getActive()
      : ambulanceMissionHelpers.getAll();

    return NextResponse.json(missions);
  } catch (error: any) {
    console.error("Error fetching missions:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea misiunilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ambulanceId,
      emergencyCaseId,
      missionType,
      priority,
      callerName,
      callerPhone,
      pickupLocation,
      destinationLocation,
      patientName,
      patientAge,
      patientGender,
      chiefComplaint,
      estimatedArrivalTime,
      estimatedReturnTime,
      dispatcherName,
      notes,
    } = body;

    // Verifică dacă ambulanța este disponibilă
    const ambulance = ambulanceHelpers.getById(ambulanceId);
    if (!ambulance) {
      return NextResponse.json({ error: "Ambulanța nu a fost găsită" }, { status: 404 });
    }

    if (ambulance.status !== "available") {
      return NextResponse.json(
        { error: `Ambulanța ${ambulance.ambulanceNumber} nu este disponibilă (status: ${ambulance.status})` },
        { status: 400 }
      );
    }

    const mission = ambulanceMissionHelpers.create({
      ambulanceId,
      emergencyCaseId,
      missionType,
      priority,
      callerName,
      callerPhone,
      pickupLocation,
      destinationLocation,
      patientName,
      patientAge,
      patientGender,
      chiefComplaint,
      estimatedArrivalTime,
      estimatedReturnTime,
      dispatcherName,
      notes,
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error: any) {
    console.error("Error creating mission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea misiunii" },
      { status: 500 }
    );
  }
}
