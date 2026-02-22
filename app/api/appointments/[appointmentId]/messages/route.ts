import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { appointmentHelpers, appointmentMessageHelpers, patientHelpers, doctorNotificationHelpers } from "@/lib/db-helpers";
import { createNotification } from "@/lib/actions/notification.actions";
import { formatDoctorDisplayName, formatDateTime } from "@/lib/utils";

function normalizeDoctorName(s: string): string {
  return s.trim().replace(/^dr\.?\s*/i, "").toLowerCase();
}

function doctorMatches(appointment: { primaryPhysician: string }, doctorName: string | null): boolean {
  if (!doctorName) return false;
  return normalizeDoctorName(appointment.primaryPhysician) === normalizeDoctorName(doctorName);
}

function canAccessAppointment(appointment: { userId: string; primaryPhysician: string } | null, patientUserId: string | null, doctorName: string | null): boolean {
  if (!appointment) return false;
  if (patientUserId && appointment.userId === patientUserId) return true;
  if (doctorMatches(appointment, doctorName)) return true;
  return false;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const { appointmentId } = params;
    const session = await getCurrentSession();
    const doctorName = await getDoctorSession();

    const appointment = appointmentHelpers.getById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Programarea nu a fost găsită" }, { status: 404 });
    }

    const patientUserId = session?.$id ?? null;
    if (!canAccessAppointment(appointment, patientUserId, doctorName)) {
      return NextResponse.json({ error: "Nu aveți acces la această conversație" }, { status: 403 });
    }

    const messages = appointmentMessageHelpers.getByAppointmentId(appointmentId);
    return NextResponse.json({ messages, appointment: { schedule: appointment.schedule, primaryPhysician: appointment.primaryPhysician, patientName: appointment.patient?.name } });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Eroare la încărcarea mesajelor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const { appointmentId } = params;
    const session = await getCurrentSession();
    const doctorName = await getDoctorSession();

    const appointment = appointmentHelpers.getById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: "Programarea nu a fost găsită" }, { status: 404 });
    }

    const patientUserId = session?.$id ?? null;
    if (!canAccessAppointment(appointment, patientUserId, doctorName)) {
      return NextResponse.json({ error: "Nu aveți acces la această conversație" }, { status: 403 });
    }

    const body = await request.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text || text.length > 4000) {
      return NextResponse.json({ error: "Mesajul trebuie să aibă între 1 și 4000 de caractere" }, { status: 400 });
    }

    const sendAsRole = body.sendAsRole === "doctor" ? "doctor" : null;

    let senderRole: "patient" | "doctor";
    let senderName: string;

    if (sendAsRole === "doctor") {
      if (!doctorMatches(appointment, doctorName)) {
        return NextResponse.json(
          { error: "Pentru a răspunde ca medic trebuie să fiți autentificat ca medicul acestei programări." },
          { status: 403 }
        );
      }
      senderRole = "doctor";
      senderName = formatDoctorDisplayName(appointment.primaryPhysician);
    } else if (patientUserId && appointment.userId === patientUserId) {
      // Prioritate: dacă sesiunea este de pacient și programarea îi aparține, mesajul e de la pacient
      // (evită atribuirea greșită când există și cookie de medic în același browser)
      senderRole = "patient";
      const patient = patientHelpers.getByUserId(patientUserId);
      senderName = patient?.name ?? "Pacient";
    } else if (doctorMatches(appointment, doctorName)) {
      senderRole = "doctor";
      senderName = formatDoctorDisplayName(doctorName);
    } else {
      return NextResponse.json({ error: "Nu aveți acces" }, { status: 403 });
    }

    const message = appointmentMessageHelpers.create({
      appointmentId,
      senderRole,
      senderName,
      body: text,
    });

    const scheduleStr = formatDateTime(appointment.schedule).dateTime;
    const patientName = appointment.patient?.name ?? "Pacient";

    if (senderRole === "patient") {
      doctorNotificationHelpers.create({
        doctorName: appointment.primaryPhysician,
        type: "new_message",
        title: "Mesaj nou de la pacient",
        message: `${patientName} a trimis un mesaj pentru programarea din ${scheduleStr}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`,
        appointmentId,
      });
    } else {
      await createNotification({
        userId: appointment.userId,
        type: "new_message",
        title: "Răspuns de la medic",
        message: `${senderName} a răspuns la conversația pentru programarea din ${scheduleStr}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`,
        appointmentId,
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Eroare la trimiterea mesajului" }, { status: 500 });
  }
}
