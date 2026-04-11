import { NextResponse } from "next/server";

import { doctorScheduleEventHelpers } from "@/lib/db-helpers";

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = doctorScheduleEventHelpers.getById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Evenimentul nu a fost găsit." }, { status: 404 });
    }

    doctorScheduleEventHelpers.delete(params.eventId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting doctor calendar event:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la ștergerea evenimentului." },
      { status: 500 }
    );
  }
}
