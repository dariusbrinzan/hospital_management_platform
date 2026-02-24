import { NextResponse } from "next/server";
import {
  getCurrentSession,
  getDoctorSession,
  getAdminSession,
} from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { Doctors } from "@/constants";
import type { ChatContext } from "@/lib/chatbot-rules";

export async function GET() {
  try {
    // 1) Check admin session
    const adminSession = await getAdminSession();
    if (adminSession) {
      return NextResponse.json({
        name: "Administrator",
        role: "admin",
      } satisfies ChatContext);
    }

    // 2) Check doctor session
    const doctorName = await getDoctorSession();
    if (doctorName) {
      const doctor = Doctors.find((d) => d.name === doctorName);
      const appointmentsData = await getRecentAppointmentList(doctorName);
      const allAppointments = appointmentsData?.documents ?? [];
      const now = new Date();
      const upcoming = allAppointments.filter(
        (apt: any) =>
          apt.status !== "cancelled" && new Date(apt.schedule) >= now
      );
      const pending = allAppointments.filter(
        (apt: any) => apt.status === "pending"
      );

      return NextResponse.json({
        name: doctor?.name || doctorName,
        doctorName: doctorName,
        role: "doctor",
        doctorAppointmentCount: upcoming.length,
        doctorPendingCount: pending.length,
      } satisfies ChatContext);
    }

    // 3) Check patient session
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
        (apt: any) =>
          apt.status !== "cancelled" && new Date(apt.schedule) >= now
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
      );
    const nextOne = upcoming.length > 0 ? upcoming[0] : null;

    return NextResponse.json({
      name: (patient as any).name,
      role: "patient",
      nextAppointmentCount: upcoming.length,
      nextAppointmentDate: nextOne
        ? formatDateTime(nextOne.schedule).dateTime
        : undefined,
      hasUpcomingAppointment: upcoming.length > 0,
    } satisfies ChatContext);
  } catch (error) {
    console.error("Chat context error:", error);
    return NextResponse.json({});
  }
}
