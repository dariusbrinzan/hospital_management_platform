import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { appointmentHelpers } from "@/lib/db-helpers";

/** Check-in digital: pacientul confirmă prezența și poate trimite date preregistrare (ex. motiv actualizat, simptome). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.$id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const appointment = appointmentHelpers.getById(params.appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Programarea nu a fost găsită." }, { status: 404 });
    }
    if (appointment.userId !== session.$id) {
      return NextResponse.json({ error: "Nu aveți permisiunea de a face check-in la această programare." }, { status: 403 });
    }
    if (appointment.status === "cancelled") {
      return NextResponse.json({ error: "Programarea este anulată." }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const checkInData = typeof body.checkInData === "string" ? body.checkInData : null;
    const updated = appointmentHelpers.updateCheckIn(params.appointmentId, checkInData);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
