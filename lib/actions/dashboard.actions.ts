"use server";

import {
  consumableRequestsHelpers,
  emergencyHelpers,
  financialTransactionHelpers,
  hospitalAdmissionHelpers,
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
    recent: Array<{
      patientName: string;
      schedule: string;
      primaryPhysician: string;
      status: string;
    }>;
  };
  emergency: {
    total: number;
    recent: Array<{
      $id: string;
      triageLevel: string;
      currentState: string;
      chiefComplaint: string;
      patientName?: string | null;
      arrivalTime: string | null;
    }>;
  };
  medications: {
    lowStockCount: number;
    items: Array<{
      medicationName: string;
      location: string;
      quantity: number;
      minimumStockLevel: number;
      unit?: string;
    }>;
  };
  patients: {
    total: number;
    recent: Array<{ name: string; createdAt: string }>;
  };
  hospitalizations: {
    activeCount: number;
    recent: Array<{
      patientName: string;
      roomNumber: string;
      department: string;
      admissionDate: string;
    }>;
  };
  imaging: {
    upcomingCount: number;
    recent: Array<{
      patientName: string;
      modalityName: string;
      scheduledAt: string;
      status: string;
    }>;
  };
  problemReports: {
    newCount: number;
    total: number;
    recent: Array<{
      id: string;
      subject: string;
      status: string;
      createdAt: string;
      descriptionSnippet: string;
    }>;
  };
  logistics: {
    consumablePending: number;
    transportPending: number;
    recentConsumable: Array<{
      department: string;
      requestedBy: string;
      priority: string;
      createdAt: string;
    }>;
    recentTransport: Array<{
      patientName: string;
      fromLocation: string;
      toLocation: string;
      transportType: string;
      createdAt: string;
    }>;
  };
  finance: {
    balance: number;
    revenue: number;
    expense: number;
    pendingCount: number;
    recent: Array<{
      description: string;
      transactionType: string;
      amount: number;
      occurredAt: string;
    }>;
  };
};

function toIso(date: unknown): string {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === "object" && date !== null && "toISOString" in date) return (date as Date).toISOString();
  return String(date);
}

export async function getAdminDashboardSnippets(): Promise<DashboardSnippets> {
  financialTransactionHelpers.syncSurgeryFinanceEntries();

  const [appointments, emergencyAll, lowStock, patients, admissions, upcomingStudies, problemReportsAll, consumablePending, transportPending, financeSummary, financeRecent] =
    await Promise.all([
      getRecentAppointmentList(),
      Promise.resolve(emergencyHelpers.getAll()),
      Promise.resolve(medicationStockHelpers.getLowStock()),
      Promise.resolve(patientHelpers.getAll()),
      Promise.resolve(hospitalAdmissionHelpers.getAllAdmissions()),
      getUpcomingStudies(8),
      Promise.resolve(problemReportsHelpers.getAll()),
      Promise.resolve(consumableRequestsHelpers.getAll(undefined, "pending")),
      Promise.resolve(internalTransportHelpers.getAll("pending")),
      Promise.resolve(financialTransactionHelpers.getSummary(30)),
      Promise.resolve(financialTransactionHelpers.getAll({ limit: 6 })),
    ]);

  const docs = appointments?.documents ?? [];
  const recentAppointments = docs.slice(0, 6).map((a: any) => ({
    patientName: a.patient?.name ?? "—",
    schedule: toIso(a.schedule),
    primaryPhysician: a.primaryPhysician ?? "—",
    status: a.status ?? "—",
  }));

  const newReports = problemReportsAll.filter((r: { status: string }) => r.status === "new");
  const studies = Array.isArray(upcomingStudies) ? upcomingStudies : [];

  const patientsSorted = [...patients].sort((a: any, b: any) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );

  return {
    appointments: {
      scheduledCount: appointments.scheduledCount,
      pendingCount: appointments.pendingCount,
      cancelledCount: appointments.cancelledCount,
      recent: recentAppointments,
    },
    emergency: {
      total: emergencyAll.length,
      recent: emergencyAll.slice(0, 5).map((c: any) => ({
        $id: c.$id,
        triageLevel: c.triageLevel,
        currentState: c.currentState ?? "—",
        chiefComplaint: c.chiefComplaint,
        patientName: c.patientName ?? null,
        arrivalTime: c.arrivalTime ? toIso(c.arrivalTime) : null,
      })),
    },
    medications: {
      lowStockCount: lowStock.length,
      items: lowStock.slice(0, 5).map((s: any) => ({
        medicationName: s.medication?.name ?? "Medicament",
        location: s.location,
        quantity: s.quantity - (s.reservedQuantity ?? 0),
        minimumStockLevel: s.minimumStockLevel ?? 0,
        unit: s.medication?.unit ?? undefined,
      })),
    },
    patients: {
      total: patients.length,
      recent: patientsSorted.slice(0, 5).map((p: any) => ({
        name: p.name ?? "—",
        createdAt: toIso(p.createdAt),
      })),
    },
    hospitalizations: {
      activeCount: admissions.length,
      recent: admissions.slice(0, 5).map((a: any) => ({
        patientName: a.patientName ?? "—",
        roomNumber: a.roomNumber ?? "—",
        department: a.department ?? "—",
        admissionDate: toIso(a.admissionDate),
      })),
    },
    imaging: {
      upcomingCount: studies.length,
      recent: studies.slice(0, 5).map((s: any) => ({
        patientName: s.patientName ?? "—",
        modalityName: s.modalityName ?? "—",
        scheduledAt: toIso(s.scheduledAt),
        status: s.status ?? "—",
      })),
    },
    problemReports: {
      newCount: newReports.length,
      total: problemReportsAll.length,
      recent: problemReportsAll.slice(0, 5).map((r: any) => ({
        id: r.id,
        subject: r.subject,
        status: r.status,
        createdAt: toIso(r.createdAt),
        descriptionSnippet: (r.description ?? "").slice(0, 100).trim() + ((r.description ?? "").length > 100 ? "…" : ""),
      })),
    },
    logistics: {
      consumablePending: consumablePending.length,
      transportPending: transportPending.length,
      recentConsumable: consumablePending.slice(0, 4).map((r: any) => ({
        department: r.department ?? "—",
        requestedBy: r.requestedBy ?? "—",
        priority: r.priority ?? "normal",
        createdAt: toIso(r.createdAt),
      })),
      recentTransport: transportPending.slice(0, 4).map((r: any) => ({
        patientName: r.patientName ?? "—",
        fromLocation: r.fromLocation ?? "—",
        toLocation: r.toLocation ?? "—",
        transportType: r.transportType ?? "—",
        createdAt: toIso(r.createdAt),
      })),
    },
    finance: {
      balance: financeSummary.balance,
      revenue: financeSummary.revenue,
      expense: financeSummary.expense,
      pendingCount: financeSummary.pendingCount,
      recent: financeRecent.slice(0, 4).map((t: any) => ({
        description: t.description ?? "—",
        transactionType: t.transactionType ?? "—",
        amount: Number(t.amount) || 0,
        occurredAt: toIso(t.occurredAt),
      })),
    },
  };
}
