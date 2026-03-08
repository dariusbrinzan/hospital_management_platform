import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill, Stethoscope, UserRound } from "lucide-react";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import {
  medicalRecordHelpers,
  prescriptionHelpers,
} from "@/lib/db-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";

export default async function DoctorPatientsPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const appointmentsData = await getRecentAppointmentList(doctorName);
  const allAppointments = appointmentsData?.documents ?? [];

  const patientsMap = new Map<
    string,
    {
      patientId: string;
      patientName: string;
      appointments: any[];
      lastVisit: string;
    }
  >();

  for (const apt of allAppointments) {
    const pid = apt.patient?.$id;
    if (!pid) continue;

    const existing = patientsMap.get(pid);
    if (existing) {
      existing.appointments.push(apt);
      if (new Date(apt.schedule) > new Date(existing.lastVisit)) {
        existing.lastVisit = apt.schedule;
      }
    } else {
      patientsMap.set(pid, {
        patientId: pid,
        patientName: apt.patient?.name ?? "Necunoscut",
        appointments: [apt],
        lastVisit: apt.schedule,
      });
    }
  }

  const patients = Array.from(patientsMap.values()).sort(
    (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );

  const patientExtras = new Map<
    string,
    { diagnoses: string[]; medications: string[] }
  >();
  for (const p of patients) {
    const records = medicalRecordHelpers.getByPatientId(p.patientId);
    const allDiagnoses: string[] = [];
    const allMedications: string[] = [];

    for (const rec of records) {
      if (rec.diagnoses) {
        for (const d of rec.diagnoses) {
          if (d.diagnosisName && !allDiagnoses.includes(d.diagnosisName)) {
            allDiagnoses.push(d.diagnosisName);
          }
        }
      }
      if (rec.prescriptions) {
        for (const rx of rec.prescriptions) {
          if (rx.medicationName && !allMedications.includes(rx.medicationName)) {
            allMedications.push(rx.medicationName);
          }
        }
      }
    }
    patientExtras.set(p.patientId, {
      diagnoses: allDiagnoses.slice(0, 5),
      medications: allMedications.slice(0, 5),
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
          Istoric pacienți
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Pacienții mei
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Toți pacienții care au avut sau au programări cu tine, inclusiv
          diagnosticele și medicația administrită.
        </p>
      </div>

      {patients.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai niciun pacient în istoric.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {patients.map((p) => {
            const scheduled = p.appointments.filter(
              (a: any) => a.status === "scheduled"
            ).length;
            const pending = p.appointments.filter(
              (a: any) => a.status === "pending"
            ).length;
            const cancelled = p.appointments.filter(
              (a: any) => a.status === "cancelled"
            ).length;

            const nextApt = p.appointments
              .filter(
                (a: any) =>
                  new Date(a.schedule).getTime() >= Date.now() &&
                  a.status !== "cancelled"
              )
              .sort(
                (a: any, b: any) =>
                  new Date(a.schedule).getTime() -
                  new Date(b.schedule).getTime()
              )[0];

            const extras = patientExtras.get(p.patientId);

            return (
              <Link
                key={p.patientId}
                href={`/doctor/patients/${p.patientId}`}
                prefetch={false}
                className="group"
              >
                <Card className="h-full border-slate-200/80 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:hover:border-teal-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        <UserRound className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                          {p.patientName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Ultima vizită:{" "}
                          {formatDateTime(p.lastVisit).dateOnly}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        {p.appointments.length} programări
                      </span>
                      {scheduled > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {scheduled} confirmate
                        </span>
                      )}
                      {pending > 0 && (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                          {pending} în așteptare
                        </span>
                      )}
                      {cancelled > 0 && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                          {cancelled} anulate
                        </span>
                      )}
                    </div>

                    {extras && extras.diagnoses.length > 0 && (
                      <div>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Stethoscope className="size-3.5" />
                          Diagnostice
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {extras.diagnoses.map((d) => (
                            <span
                              key={d}
                              className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {extras && extras.medications.length > 0 && (
                      <div>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Pill className="size-3.5" />
                          Medicație administrită
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {extras.medications.map((m) => (
                            <span
                              key={m}
                              className="rounded-md bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {nextApt && (
                      <>
                        <Separator />
                        <div className="rounded-lg border border-teal-200/60 bg-teal-50/60 p-2.5 dark:border-teal-900/40 dark:bg-teal-950/20">
                          <p className="text-xs font-medium text-teal-700 dark:text-teal-300">
                            Următoarea programare
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {formatDateTime(nextApt.schedule).dateTime}
                          </p>
                          <div className="mt-1">
                            <StatusBadge status={nextApt.status} />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
