import { NextRequest, NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { doctorNotificationHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const doctorName = await getDoctorSession();
    if (!doctorName) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const notifications = doctorNotificationHelpers.getByDoctorName(doctorName, limit);
    const unreadCount = doctorNotificationHelpers.getUnreadCount(doctorName);
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching doctor notifications:", error);
    return NextResponse.json({ error: "Eroare la încărcare" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const doctorName = await getDoctorSession();
    if (!doctorName) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    if (body.action === "markAllRead") {
      doctorNotificationHelpers.markAllAsRead(doctorName);
      return NextResponse.json({ success: true });
    }
    if (body.action === "markRead" && typeof body.notificationId === "string") {
      doctorNotificationHelpers.markAsRead(body.notificationId);
      return NextResponse.json({ success: true });
    }
    if (body.action === "markReadByAppointment" && typeof body.appointmentId === "string") {
      doctorNotificationHelpers.markAsReadByAppointmentId(doctorName, body.appointmentId);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  } catch (error) {
    console.error("Error updating doctor notifications:", error);
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 });
  }
}
