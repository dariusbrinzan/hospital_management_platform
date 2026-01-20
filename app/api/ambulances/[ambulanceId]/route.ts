import { NextRequest, NextResponse } from "next/server";
import { ambulanceHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { ambulanceId: string } }
) {
  try {
    const ambulance = ambulanceHelpers.getById(params.ambulanceId);
    if (!ambulance) {
      return NextResponse.json({ error: "Ambulanța nu a fost găsită" }, { status: 404 });
    }
    return NextResponse.json(ambulance);
  } catch (error: any) {
    console.error("Error fetching ambulance:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea ambulanței" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ambulanceId: string } }
) {
  try {
    const body = await request.json();
    const { status, location } = body;

    if (status) {
      ambulanceHelpers.updateStatus(params.ambulanceId, status);
    }

    if (location) {
      ambulanceHelpers.updateLocation(params.ambulanceId, location);
    }

    const updated = ambulanceHelpers.getById(params.ambulanceId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating ambulance:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea ambulanței" },
      { status: 500 }
    );
  }
}
