"use server";

import { imagingModalityHelpers, imagingStudyHelpers } from "../db-helpers";
import { generateTimeSlots, parseStringify } from "../utils";

const IMAGING_START_HOUR = 8;
const IMAGING_END_HOUR = 18;

export async function getModalities() {
  const list = imagingModalityHelpers.getAll();
  return parseStringify(list);
}

export async function getImagingSlots(modalityId: string, date: Date) {
  const modality = imagingModalityHelpers.getById(modalityId);
  if (!modality) return [];
  const d = new Date(date);
  const allSlots = generateTimeSlots(
    d,
    modality.slotDurationMinutes,
    IMAGING_START_HOUR,
    IMAGING_END_HOUR
  );
  const dateStr = d.toISOString().slice(0, 10);
  const occupied = imagingStudyHelpers.getByModalityAndDate(modalityId, dateStr);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const dayStartMs = dayStart.getTime();
  const occupiedSet = new Set<number>();
  const sameLocalDay = (date: Date) =>
    date.getFullYear() === d.getFullYear() &&
    date.getMonth() === d.getMonth() &&
    date.getDate() === d.getDate();
  occupied.forEach((s) => {
    const sd = new Date(s.scheduledAt);
    if (!sameLocalDay(sd)) return;
    const t = sd.getTime();
    const minutesIntoDay = (t - dayStartMs) / (60 * 1000);
    const slotIndex = Math.floor(minutesIntoDay / modality.slotDurationMinutes);
    const slotStartMs = dayStartMs + slotIndex * modality.slotDurationMinutes * 60 * 1000;
    occupiedSet.add(slotStartMs);
  });
  const result = allSlots.map((time) => ({
    time,
    available: !occupiedSet.has(time.getTime()),
  }));
  return parseStringify(result);
}

export async function createImagingStudy(params: {
  patientId: string;
  modalityId: string;
  scheduledAt: Date | string;
  sourceType?: "direct" | "appointment" | "emergency";
  sourceId?: string | null;
  orderedBy?: string | null;
  reason?: string | null;
}) {
  const study = imagingStudyHelpers.create({
    patientId: params.patientId,
    modalityId: params.modalityId,
    scheduledAt: params.scheduledAt,
    sourceType: params.sourceType ?? "direct",
    sourceId: params.sourceId ?? null,
    orderedBy: params.orderedBy ?? null,
    reason: params.reason ?? null,
  });
  return parseStringify(study);
}

export async function getStudiesForPatient(patientId: string) {
  const list = imagingStudyHelpers.getByPatientId(patientId);
  return parseStringify(list);
}

export async function getStudiesForEmergencyCase(emergencyCaseId: string) {
  const list = imagingStudyHelpers.getBySource("emergency", emergencyCaseId);
  return parseStringify(list);
}

export async function getUpcomingStudies(limit?: number) {
  const list = imagingStudyHelpers.getAllUpcoming(limit ?? 50);
  return parseStringify(list);
}

export async function getImagingStudyById(id: string) {
  const study = imagingStudyHelpers.getById(id);
  return study ? parseStringify(study) : null;
}

export async function updateImagingStudyStatus(
  id: string,
  status: string,
  resultNotes?: string | null
) {
  const study = imagingStudyHelpers.updateStatus(id, status, resultNotes);
  return parseStringify(study);
}
