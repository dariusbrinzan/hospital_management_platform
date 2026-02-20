"use server";

import { revalidatePath } from "next/cache";
import { notificationHelpers } from "../db-helpers";
import { parseStringify, formatDateTime } from "../utils";
import { getPatientAppointments } from "./appointment.actions";

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "analysis_results_ready"
  | "appointment_reminder"
  | "appointment_created"
  | "consultation_added";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string;
}

// CREATE NOTIFICATION
export const createNotification = async (
  params: CreateNotificationParams
) => {
  try {
    const notification = notificationHelpers.create(params);
    revalidatePath(`/patients/${params.userId}/dashboard`);
    return parseStringify(notification);
  } catch (error) {
    console.error("A apărut o eroare la crearea notificării:", error);
    throw error;
  }
};

// GET USER NOTIFICATIONS
export const getUserNotifications = async (userId: string, limit?: number) => {
  try {
    const notifications = notificationHelpers.getByUserId(userId, limit);
    return parseStringify(notifications);
  } catch (error) {
    console.error("A apărut o eroare la recuperarea notificărilor:", error);
    return [];
  }
};

// GET UNREAD COUNT
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const count = notificationHelpers.getUnreadCount(userId);
    return count;
  } catch (error) {
    console.error("A apărut o eroare la numărarea notificărilor necitite:", error);
    return 0;
  }
};

// MARK NOTIFICATION AS READ
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notification = notificationHelpers.getById(notificationId);
    if (!notification) {
      throw new Error("Notificarea nu a fost găsită");
    }
    
    notificationHelpers.markAsRead(notificationId);
    revalidatePath(`/patients/${notification.userId}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("A apărut o eroare la marcarea notificării ca citită:", error);
    throw error;
  }
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    notificationHelpers.markAllAsRead(userId);
    revalidatePath(`/patients/${userId}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("A apărut o eroare la marcarea tuturor notificărilor ca citite:", error);
    throw error;
  }
};

/** Creează notificări de tip "reminder" cu 24h înainte de consultație. Apare în caseta de notificări când utilizatorul deschide dashboard-ul. */
export const ensureAppointmentReminders24h = async (userId: string) => {
  try {
    const appointments = await getPatientAppointments(userId);
    const upcoming = (appointments?.upcoming || []).filter(
      (apt: any) => apt.status !== "cancelled"
    );

    const now = new Date();
    const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const existing = notificationHelpers.getByUserId(userId, 500);
    const remindedIds = new Set(
      (existing as any[])
        .filter((n: any) => n.type === "appointment_reminder" && n.appointmentId)
        .map((n: any) => n.appointmentId)
    );

    for (const apt of upcoming) {
      const aptId = apt.$id || apt.id;
      if (remindedIds.has(aptId)) continue;

      const schedule = new Date(apt.schedule);
      const dateTimeStr = formatDateTime(apt.schedule).dateTime;
      const doctorMsg = ` cu Dr. ${apt.primaryPhysician}${apt.reason ? ` – ${apt.reason}` : ""}`;

      if (schedule >= in23h && schedule <= in25h) {
        await createNotification({
          userId,
          type: "appointment_reminder",
          title: "Reminder: Programare peste 24 de ore",
          message: `Ai o programare peste aproximativ 24 de ore: ${dateTimeStr}${doctorMsg}.`,
          appointmentId: aptId,
        });
        remindedIds.add(aptId);
      } else if (schedule >= now && schedule <= in24h) {
        await createNotification({
          userId,
          type: "appointment_reminder",
          title: "Reminder: Programare în următoarele 24 de ore",
          message: `Ai o programare în următoarele 24 de ore: ${dateTimeStr}${doctorMsg}.`,
          appointmentId: aptId,
        });
        remindedIds.add(aptId);
      }
    }
  } catch (error) {
    console.error("Eroare la crearea reminder-urilor pentru programări:", error);
  }
};
