import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { surgeryBookingHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate programa sala." }, { status: 401 });
    }

    const body = await request.json();
    const booking = surgeryBookingHelpers.upsert({
      surgeryCaseId: params.caseId,
      roomId: body.roomId,
      scheduledStart: body.scheduledStart,
      scheduledEnd: body.scheduledEnd,
      surgeonName: body.surgeonName,
      anesthesiologistName: body.anesthesiologistName,
      nursingTeam: body.nursingTeam,
      supportTeam: body.supportTeam,
      bookingStatus: body.bookingStatus || "planned",
      preOpChecklist: body.preOpChecklist,
      postopDestination: body.postopDestination,
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut salva rezervarea." },
      { status: 400 }
    );
  }
}
