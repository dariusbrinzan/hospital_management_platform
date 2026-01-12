"use server";

import { revalidatePath } from "next/cache";

import { Appointment } from "@/types/appwrite.types";

import { appointmentHelpers } from "../db-helpers";
import { formatDateTime, parseStringify } from "../utils";

// CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = appointmentHelpers.create(appointment);
    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
    throw error;
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = appointmentHelpers.getAll();

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = appointments.reduce((acc, appointment) => {
      switch (appointment.status) {
        case "scheduled":
          acc.scheduledCount++;
          break;
        case "pending":
          acc.pendingCount++;
          break;
        case "cancelled":
          acc.cancelledCount++;
          break;
      }
      return acc;
    }, initialCounts);

    const data = {
      totalCount: appointments.length,
      ...counts,
      documents: appointments,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: [],
    };
  }
};

// SEND SMS NOTIFICATION (mock - poți integra cu Twilio sau alt serviciu)
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // Mock SMS - în producție poți integra cu Twilio sau alt serviciu
    console.log(`SMS to user ${userId}: ${content}`);
    return { success: true, message: "SMS sent (mock)" };
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
    return { success: false, error };
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = appointmentHelpers.update(appointmentId, {
      status: appointment.status,
      schedule: appointment.schedule,
      primaryPhysician: appointment.primaryPhysician,
      cancellationReason: appointment.cancellationReason,
    });

    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

    // Trimite SMS (mock)
    const smsMessage = `Salutări de la eHealth.ro. ${
      type === "schedule"
        ? `Programarea dvs. este confirmată pentru ${formatDateTime(appointment.schedule!, timeZone).dateTime} cu Dr. ${appointment.primaryPhysician}`
        : `Ne pare rău să vă informăm că programarea dvs. pentru ${formatDateTime(appointment.schedule!, timeZone).dateTime} este anulată. Motiv: ${appointment.cancellationReason}`
    }.`;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
    throw error;
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = appointmentHelpers.getById(appointmentId);
    return appointment ? parseStringify(appointment) : null;
  } catch (error) {
    console.error(
      "An error occurred while retrieving the appointment:",
      error
    );
    return null;
  }
};
