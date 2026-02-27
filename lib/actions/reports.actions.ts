"use server";

import { appointmentHelpers, doctorsOnDutyHelpers, emergencyHelpers, imagingStudyHelpers } from "../db-helpers";

export type ReportPeriod = "7" | "30" | "90";

/** Plată per gardă (lei) – folosit doar în acest modul. */
const GUARD_PAY_PER_SHIFT_LEI = 350;

function getDateRange(period: ReportPeriod): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  const days = parseInt(period, 10);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Programări pe zile (număr per zi) */
export async function getAppointmentsByDay(period: ReportPeriod) {
  const { start, end } = getDateRange(period);
  const all = appointmentHelpers.getAll();
  const filtered = (all as any[]).filter((a) => {
    const t = new Date(a.schedule).getTime();
    return t >= start.getTime() && t <= end.getTime() && a.status !== "cancelled";
  });
  const byDay: Record<string, number> = {};
  filtered.forEach((a) => {
    const key = toDateKey(new Date(a.schedule));
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const keys = Object.keys(byDay).sort();
  return keys.map((date) => ({ date, count: byDay[date] }));
}

/** Programări pe doctor (număr per medic) */
export async function getAppointmentsByDoctor(period: ReportPeriod) {
  const { start, end } = getDateRange(period);
  const all = appointmentHelpers.getAll();
  const filtered = (all as any[]).filter((a) => {
    const t = new Date(a.schedule).getTime();
    return t >= start.getTime() && t <= end.getTime() && a.status !== "cancelled";
  });
  const byDoctor: Record<string, number> = {};
  filtered.forEach((a) => {
    const name = a.primaryPhysician || "Necunoscut";
    byDoctor[name] = (byDoctor[name] || 0) + 1;
  });
  return Object.entries(byDoctor).map(([name, count]) => ({ name, count }));
}

/** Urgențe pe zile */
export async function getEmergenciesByDay(period: ReportPeriod) {
  const { start, end } = getDateRange(period);
  const all = emergencyHelpers.getAll();
  const filtered = (all as any[]).filter((e) => {
    const t = new Date(e.arrivalTime).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const byDay: Record<string, number> = {};
  filtered.forEach((e) => {
    const key = toDateKey(new Date(e.arrivalTime));
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const keys = Object.keys(byDay).sort();
  return keys.map((date) => ({ date, count: byDay[date] }));
}

/** Investigații imagistice pe zile */
export async function getImagingByDay(period: ReportPeriod) {
  const { start, end } = getDateRange(period);
  const startStr = start.toISOString();
  const endStr = end.toISOString();
  return imagingStudyHelpers.getCountByDayInRange(startStr, endStr);
}

/** Gărzi efectuate per medic în perioadă și contribuția lunară (plată 350 lei/gardă). */
export async function getGuardPaymentsByDoctor(period: ReportPeriod): Promise<
  Array<{ doctorName: string; guardsCount: number; amountLei: number }>
> {
  const { start, end } = getDateRange(period);
  const byDoctor = doctorsOnDutyHelpers.getGuardCountByDoctorInPeriod(start, end);
  return byDoctor.map(({ doctorName, guardsCount }) => ({
    doctorName,
    guardsCount,
    amountLei: guardsCount * GUARD_PAY_PER_SHIFT_LEI,
  }));
}

/** Date rapoarte pentru export CSV/PDF */
export async function getReportsData(period: ReportPeriod) {
  const [byDay, byDoctor, emergenciesByDay, imagingByDay, guardPayments] = await Promise.all([
    getAppointmentsByDay(period),
    getAppointmentsByDoctor(period),
    getEmergenciesByDay(period),
    getImagingByDay(period),
    getGuardPaymentsByDoctor(period),
  ]);
  return {
    period,
    appointmentsByDay: byDay,
    appointmentsByDoctor: byDoctor,
    emergenciesByDay,
    imagingByDay,
    guardPaymentsByDoctor: guardPayments,
  };
}
