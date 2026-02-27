import { NextRequest, NextResponse } from "next/server";
import { appointmentHelpers, doctorNotificationHelpers, notificationHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";

const REMINDER_1H_TYPE = "appointment_reminder_1h";
const REMINDER_24H_TYPE = "appointment_reminder_24h";

/**
 * Cron: trimite reminder-uri pentru programări (1h și 24h înainte).
 * Apelat la fiecare 15 min (ex: Vercel Cron, cPanel, sau serviciu extern).
 * GET /api/cron/appointment-reminders
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sent: { id: string; type: string }[] = [];

    // ---- Reminder la 1 oră înainte ----
    const from1h = new Date(now.getTime() + 55 * 60 * 1000);
    const to1h = new Date(now.getTime() + 65 * 60 * 1000);
    const in1h = appointmentHelpers.getAppointmentsStartingBetween(from1h.toISOString(), to1h.toISOString());

    for (const apt of in1h) {
      const timeStr = formatDateTime(apt.schedule).dateTime;
      if (!doctorNotificationHelpers.hasReminderSent(apt.id, REMINDER_1H_TYPE)) {
        doctorNotificationHelpers.create({
          doctorName: apt.primaryPhysician,
          type: REMINDER_1H_TYPE,
          title: "Reminder: Programare în 1 oră",
          message: `În aproximativ o oră aveți programare cu pacientul ${apt.patientName} la ${timeStr}.`,
          appointmentId: apt.id,
        });
        sent.push({ id: apt.id, type: REMINDER_1H_TYPE });
      }
      if (!notificationHelpers.hasReminderSent(apt.id, REMINDER_1H_TYPE)) {
        notificationHelpers.create({
          userId: apt.userId,
          type: REMINDER_1H_TYPE,
          title: "Reminder: Programare în 1 oră",
          message: `Aveți programare la ${timeStr} cu ${apt.primaryPhysician}.`,
          appointmentId: apt.id,
        });
        sent.push({ id: apt.id, type: `${REMINDER_1H_TYPE}_patient` });
      }
    }

    // ---- Reminder la 24 ore înainte (doar pentru pacient) ----
    const from24h = new Date(now.getTime() + (23 * 60 + 30) * 60 * 1000);
    const to24h = new Date(now.getTime() + (24 * 60 + 30) * 60 * 1000);
    const in24h = appointmentHelpers.getAppointmentsStartingBetween(from24h.toISOString(), to24h.toISOString());

    for (const apt of in24h) {
      const timeStr = formatDateTime(apt.schedule).dateTime;
      if (!notificationHelpers.hasReminderSent(apt.id, REMINDER_24H_TYPE)) {
        notificationHelpers.create({
          userId: apt.userId,
          type: REMINDER_24H_TYPE,
          title: "Reminder: Programare mâine",
          message: `Mâine la ${timeStr} aveți programare cu ${apt.primaryPhysician}.`,
          appointmentId: apt.id,
        });
        sent.push({ id: apt.id, type: REMINDER_24H_TYPE });
      }
    }

    return NextResponse.json({
      success: true,
      reminders1h: in1h.length,
      reminders24h: in24h.length,
      notificationsSent: sent.length,
      sent,
    });
  } catch (error: any) {
    console.error("Appointment reminders cron error:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la trimiterea reminder-urilor" },
      { status: 500 }
    );
  }
}
