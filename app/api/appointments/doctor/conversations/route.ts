import { NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { appointmentHelpers, appointmentMessageHelpers } from "@/lib/db-helpers";

function normalizeDoctorName(s: string): string {
  return s.trim().replace(/^dr\.?\s*/i, "").toLowerCase();
}

function doctorMatches(appointment: { primaryPhysician: string }, doctorName: string | null): boolean {
  if (!doctorName) return false;
  return normalizeDoctorName(appointment.primaryPhysician) === normalizeDoctorName(doctorName);
}

export async function GET() {
  try {
    const doctorName = await getDoctorSession();
    if (!doctorName) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const all = appointmentHelpers.getAll();
    const forDoctor = all.filter((a: any) => doctorMatches(a, doctorName));
    const withMessages = forDoctor.filter(
      (a: any) => appointmentMessageHelpers.getByAppointmentId(a.$id).length > 0
    );
    const list = withMessages
      .map((a: any) => ({
        $id: a.$id,
        schedule: a.schedule,
        primaryPhysician: a.primaryPhysician,
        status: a.status,
        reason: a.reason,
        patientName: a.patient?.name,
        messageCount: appointmentMessageHelpers.getByAppointmentId(a.$id).length,
      }))
      .sort((a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());
    return NextResponse.json({ appointments: list });
  } catch (error) {
    console.error("Error fetching doctor conversations:", error);
    return NextResponse.json({ error: "Eroare la încărcare" }, { status: 500 });
  }
}
