import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({});
    }

    const patient = await getPatient(session.$id);
    if (!patient) {
      return NextResponse.json({ role: "patient", name: undefined });
    }

    const appointments = await getPatientAppointments(session.$id);
    const now = new Date();
    const upcoming = (appointments?.upcoming || [])
      .filter(
        (apt: any) => apt.status !== "cancelled" && new Date(apt.schedule) >= now
      )
      .sort((a: any, b: any) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());
    const nextOne = upcoming.length > 0 ? upcoming[0] : null;

    return NextResponse.json({
      name: (patient as any).name,
      role: "patient",
      nextAppointmentCount: upcoming.length,
      nextAppointmentDate: nextOne
        ? formatDateTime(nextOne.schedule).dateTime
        : undefined,
      hasUpcomingAppointment: upcoming.length > 0,
    });
  } catch (error) {
    console.error("Chat context error:", error);
    return NextResponse.json({});
  }
}
