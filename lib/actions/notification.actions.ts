"use server";

import { revalidatePath } from "next/cache";
import { notificationHelpers } from "../db-helpers";
import { parseStringify } from "../utils";

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "analysis_results_ready"
  | "appointment_reminder"
  | "appointment_created";

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
