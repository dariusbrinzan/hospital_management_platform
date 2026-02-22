"use server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import {
  consumableRequestsHelpers,
  equipmentHelpers,
  internalTransportHelpers,
  hospitalRoomHelpers,
} from "@/lib/db-helpers";

export async function createConsumableRequest(form: {
  department: string;
  requestedBy: string;
  items: { name: string; quantity: string }[];
  priority?: string;
  notes?: string;
}) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  const itemsJson = JSON.stringify(form.items.filter((i) => i.name.trim()));
  consumableRequestsHelpers.create({
    department: form.department,
    requestedBy: form.requestedBy,
    itemsJson,
    priority: form.priority || "normal",
    notes: form.notes || null,
  });
  return { success: true };
}

export async function updateConsumableRequestStatus(id: string, status: string, fulfilledBy?: string) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  consumableRequestsHelpers.updateStatus(id, status, fulfilledBy ?? null);
  return { success: true };
}

export async function createEquipment(form: {
  name: string;
  category: string;
  locationType: string;
  locationId?: string;
  serialNumber?: string;
  notes?: string;
}) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  equipmentHelpers.create({
    name: form.name,
    category: form.category,
    locationType: form.locationType,
    locationId: form.locationId || null,
    serialNumber: form.serialNumber || null,
    notes: form.notes || null,
  });
  return { success: true };
}

export async function updateEquipmentStatus(id: string, status: string) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  equipmentHelpers.updateStatus(id, status);
  return { success: true };
}

export async function createInternalTransport(form: {
  patientName: string;
  patientId?: string;
  fromLocation: string;
  toLocation: string;
  transportType?: string;
  requestedBy: string;
  scheduledAt?: string;
  notes?: string;
}) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  internalTransportHelpers.create({
    patientName: form.patientName,
    patientId: form.patientId || null,
    fromLocation: form.fromLocation,
    toLocation: form.toLocation,
    transportType: form.transportType || "wheelchair",
    requestedBy: form.requestedBy,
    scheduledAt: form.scheduledAt || null,
    notes: form.notes || null,
  });
  return { success: true };
}

export async function updateInternalTransportStatus(id: string, status: string) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  internalTransportHelpers.updateStatus(id, status);
  return { success: true };
}

export async function updateRoomCleaningStatus(roomId: string, roomStatus: string) {
  if (!(await getAdminSession())) return { error: "Neautorizat." };
  if (!["available", "cleaning", "disinfection"].includes(roomStatus)) return { error: "Status invalid." };
  hospitalRoomHelpers.updateRoomStatus(roomId, roomStatus);
  return { success: true };
}
