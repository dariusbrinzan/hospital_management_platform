import { NextRequest, NextResponse } from "next/server";
import { ambulanceMissionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { missionId: string } }
) {
  try {
    const mission = ambulanceMissionHelpers.getById(params.missionId);
    if (!mission) {
      return NextResponse.json({ error: "Misiunea nu a fost găsită" }, { status: 404 });
    }
    return NextResponse.json(mission);
  } catch (error: any) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea misiunii" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { missionId: string } }
) {
  try {
    const body = await request.json();
    const { status, timestamp } = body;

    if (!status) {
      return NextResponse.json({ error: "Status-ul este obligatoriu" }, { status: 400 });
    }

    const updated = ambulanceMissionHelpers.updateStatus(
      params.missionId,
      status,
      timestamp
    );

    if (!updated) {
      return NextResponse.json({ error: "Misiunea nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating mission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea misiunii" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { missionId: string } }
) {
  try {
    const body = await request.json();
    const { reason } = body;

    const cancelled = ambulanceMissionHelpers.cancel(
      params.missionId,
      reason || "Anulată de dispecer"
    );

    if (!cancelled) {
      return NextResponse.json({ error: "Misiunea nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json(cancelled);
  } catch (error: any) {
    console.error("Error cancelling mission:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la anularea misiunii" },
      { status: 500 }
    );
  }
}
