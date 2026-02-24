import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";

import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { labResultHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { LabResultSessions } from "@/components/LabResultSessions";

export default async function PatientLabResultsPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await requireAuth();
  if (!session || session.$id !== params.userId) redirect("/");

  const patient = await getPatient(params.userId);
  if (!patient) redirect("/");

  // 1) Analize din coloana analysisResults a programărilor
  const appointmentsData = await getPatientAppointments(params.userId);
  const allAppointments = appointmentsData?.all ?? [];

  const sessionsFromAppointments: {
    id: string;
    doctorName: string;
    visitDate: string;
    reason?: string;
    items: {
      $id: string;
      testName: string;
      testCategory?: string;
      resultValue?: string;
      unit?: string;
      referenceRange?: string;
      status?: string;
      notes?: string;
      performedDate?: string;
    }[];
  }[] = [];

  for (const apt of allAppointments) {
    if (!apt.analysisResults) continue;
    let parsed: any[] = [];
    try {
      parsed = typeof apt.analysisResults === "string"
        ? JSON.parse(apt.analysisResults)
        : apt.analysisResults;
    } catch {
      continue;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) continue;

    sessionsFromAppointments.push({
      id: `apt-${apt.$id}`,
      doctorName: apt.primaryPhysician || "Necunoscut",
      visitDate: apt.schedule,
      reason: apt.reason,
      items: parsed.map((t: any, idx: number) => ({
        $id: `${apt.$id}-${idx}`,
        testName: t.testName || t.name || "Test",
        testCategory: t.category || undefined,
        resultValue: t.value || t.resultValue || undefined,
        unit: t.unit || undefined,
        referenceRange: t.referenceRange || undefined,
        status: t.status || undefined,
        notes: t.notes || undefined,
        performedDate: apt.schedule,
      })),
    });
  }

  // 2) Analize din lab_results (dacă există)
  const labFromRecords = labResultHelpers.getAllByPatientIdWithRecord(patient.$id);
  const groupedLab = new Map<
    string,
    typeof sessionsFromAppointments[number]
  >();

  for (const lr of labFromRecords) {
    const key = lr.medicalRecordId;
    const existing = groupedLab.get(key);
    if (existing) {
      existing.items.push(lr);
    } else {
      groupedLab.set(key, {
        id: `mr-${lr.medicalRecordId}`,
        doctorName: lr.doctorName || "Laborator",
        visitDate: lr.visitDate,
        items: [lr],
      });
    }
  }

  // Combină ambele surse
  const allSessions = [
    ...sessionsFromAppointments,
    ...Array.from(groupedLab.values()),
  ].sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Analize medicale
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Rezultatele analizelor
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Toate seturile de analize efectuate, grupate pe sesiune. Apasă pe un
          set pentru a vedea rezultatele individuale.
        </p>
      </div>

      {allSessions.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <FlaskConical className="mx-auto mb-3 size-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai nicio analiză medicală înregistrată momentan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <LabResultSessions sessions={allSessions} />
      )}
    </div>
  );
}
