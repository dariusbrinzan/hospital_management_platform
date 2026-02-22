"use server";

import {
  appointmentHelpers,
  consumableRequestsHelpers,
  emergencyHelpers,
  hospitalAdmissionHelpers,
  imagingStudyHelpers,
  internalTransportHelpers,
  medicationStockHelpers,
  patientHelpers,
  problemReportsHelpers,
} from "@/lib/db-helpers";
import { getRecentAppointmentList } from "./appointment.actions";
import { getUpcomingStudies } from "./imaging.actions";

export type DashboardSnippets = {
  appointments: {
    scheduledCount: number;
    pendingCount: number;
    cancelledCount: number;
  };
  emergency: {
    total: number;
    recent: Array<{ $id: string; triageLevel: string; chiefComplaint: string; patientName?: string | null }>;
  };
  medications: {
    lowStockCount: number;
    items: Array<{ medicationName: string; location: string; quantity: number; minimumStockLevel: number }>;
  };
  patients: { total: number };
  hospitalizations: { activeCount: number };
  imaging: { upcomingCount: number };
  problemReports: {
    newCount: number;
    recent: Array<{ id: string; subject: string; status: string }>;
  };
  logistics: {
    consumablePending: number;
    transportPending: number;
  };
};

export async function getAdminDashboardSnippets(): Promise<DashboardSnippets> {
  const [appointments, emergencyAll, lowStock, patients, admissions, upcomingStudies, problemReportsAll, consumablePending, transportPending] =
    await Promise.all([
      getRecentAppointmentList(),
      Promise.resolve(emergencyHelpers.getAll()),
      Promise.resolve(medicationStockHelpers.getLowStock()),
      Promise.resolve(patientHelpers.getAll()),
      Promise.resolve(hospitalAdmissionHelpers.getAllAdmissions()),
      getUpcomingStudies(5),
      Promise.resolve(problemReportsHelpers.getAll()),
      Promise.resolve(consumableRequestsHelpers.getAll(undefined, "pending")),
      Promise.resolve(internalTransportHelpers.getAll("pending")),
    ]);

  const newReports = problemReportsAll.filter((r: { status: string }) => r.status === "new");

  return {
    appointments: {
      scheduledCount: appointments.scheduledCount,
      pendingCount: appointments.pendingCount,
      cancelledCount: appointments.cancelledCount,
    },
    emergency: {
      total: emergencyAll.length,
      recent: emergencyAll.slice(0, 3).map((c: any) => ({
        $id: c.$id,
        triageLevel: c.triageLevel,
        chiefComplaint: c.chiefComplaint,
        patientName: c.patientName ?? null,
      })),
    },
    medications: {
      lowStockCount: lowStock.length,
      items: lowStock.slice(0, 3).map((s: any) => ({
        medicationName: s.medication?.name ?? "Medicament",
        location: s.location,
        quantity: s.quantity - (s.reservedQuantity ?? 0),
        minimumStockLevel: s.minimumStockLevel ?? 0,
      })),
    },
    patients: { total: patients.length },
    hospitalizations: { activeCount: admissions.length },
    imaging: { upcomingCount: Array.isArray(upcomingStudies) ? upcomingStudies.length : 0 },
    problemReports: {
      newCount: newReports.length,
      recent: problemReportsAll.slice(0, 3).map((r: any) => ({
        id: r.id,
        subject: r.subject,
        status: r.status,
      })),
    },
    logistics: {
      consumablePending: consumablePending.length,
      transportPending: transportPending.length,
    },
  };
}
