"use server";

import { revalidatePath } from "next/cache";
import { appointmentHelpers, waitlistHelpers } from "../db-helpers";
import { createNotification } from "./notification.actions";
import { getNormalizedSlotKey } from "../utils/slots";
import { formatDateTime, formatDoctorDisplayName, parseStringify } from "../utils";

export type AddToWaitlistParams = {
  userId: string;
  patientId: string;
  primaryPhysician: string;
  slotTime: Date;
  reason?: string | null;
};

/** Înscrie pacientul în lista de așteptare pentru un slot ocupat. Nu creează duplicate. */
export async function addToWaitlist(params: AddToWaitlistParams) {
  try {
    const slotKey = getNormalizedSlotKey(params.primaryPhysician, params.slotTime);
    const existing = waitlistHelpers.getByPhysicianAndSlot(params.primaryPhysician, slotKey);
    if (existing.some((e: any) => e.userId === params.userId)) {
      const first = existing.find((e: any) => e.userId === params.userId);
      return parseStringify(first);
    }
    const entry = waitlistHelpers.create({
      userId: params.userId,
      patientId: params.patientId,
      primaryPhysician: params.primaryPhysician,
      requestedSlotAt: slotKey,
      reason: params.reason ?? null,
    });
    revalidatePath("/admin");
    revalidatePath(`/patients/${params.userId}/dashboard`);
    revalidatePath(`/patients/${params.userId}/new-appointment`);
    return parseStringify(entry);
  } catch (error) {
    console.error("Eroare la adăugarea în lista de așteptare:", error);
    throw error;
  }
}

/** Verifică dacă utilizatorul este deja pe listă pentru același doctor și slot. */
export async function isOnWaitlistForSlot(
  userId: string,
  primaryPhysician: string,
  slotTime: Date
): Promise<boolean> {
  try {
    const slotKey = getNormalizedSlotKey(primaryPhysician, slotTime);
    const entries = waitlistHelpers.getByPhysicianAndSlot(primaryPhysician, slotKey);
    return entries.some((e: any) => e.userId === userId);
  } catch {
    return false;
  }
}

/**
 * La anularea unei programări: caută prima înregistrare din lista de așteptare
 * pentru același doctor și același slot, creează programarea pentru ea și notifică.
 */
export async function processWaitlistForSlot(
  primaryPhysician: string,
  freedSlotSchedule: Date
): Promise<void> {
  try {
    const slotKey = getNormalizedSlotKey(primaryPhysician, freedSlotSchedule);
    const candidates = waitlistHelpers.getByPhysicianAndSlot(primaryPhysician, slotKey);
    if (candidates.length === 0) return;

    const first = candidates[0];
    const scheduleDate = new Date(first.requestedSlotAt);

    const newAppointment = appointmentHelpers.create({
      userId: first.userId,
      patient: first.patientId,
      primaryPhysician: first.primaryPhysician,
      schedule: scheduleDate,
      reason: first.reason || "Programare din listă de așteptare",
      status: "scheduled",
      note: "Alocat automat după ce un slot s-a eliberat.",
    });

    waitlistHelpers.markAssigned(first.$id, newAppointment.$id);

    const dateTimeStr = formatDateTime(scheduleDate).dateTime;
    await createNotification({
      userId: first.userId,
      type: "slot_available_assigned",
      title: "Slot eliberat – ai fost programat(ă)",
      message: `S-a eliberat un loc la data și ora dorite. Ai fost programat(ă) automat pentru ${dateTimeStr} cu ${formatDoctorDisplayName(primaryPhysician)}. Verifică programările în Dashboard.`,
      appointmentId: newAppointment.$id,
    });

    revalidatePath("/admin");
    revalidatePath(`/patients/${first.userId}/dashboard`);
  } catch (error) {
    console.error("Eroare la procesarea listei de așteptare:", error);
  }
}
