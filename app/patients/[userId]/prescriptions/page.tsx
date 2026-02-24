import { redirect } from "next/navigation";
import { Pill, Calendar, User, FileText } from "lucide-react";

import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { prescriptionHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PatientPrescriptionsPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await requireAuth();
  if (!session || session.$id !== params.userId) redirect("/");

  const patient = await getPatient(params.userId);
  if (!patient) redirect("/");

  const allPrescriptions = prescriptionHelpers.getAllByPatientId(patient.$id);

  const grouped = new Map<
    string,
    { doctorName: string; visitDate: string; appointmentId?: string; items: typeof allPrescriptions }
  >();

  for (const rx of allPrescriptions) {
    const key = rx.medicalRecordId;
    const existing = grouped.get(key);
    if (existing) {
      existing.items.push(rx);
    } else {
      grouped.set(key, {
        doctorName: rx.doctorName || "Necunoscut",
        visitDate: rx.visitDate,
        appointmentId: rx.appointmentId,
        items: [rx],
      });
    }
  }

  const groups = Array.from(grouped.values()).sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Pill className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Rețetele mele
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Rețete prescrise
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Toate rețetele primite de la medici, grupate pe consultație.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <Pill className="mx-auto mb-3 size-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai nicio rețetă înregistrată momentan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group, idx) => (
            <Card
              key={idx}
              className="border-slate-200/80 shadow-sm dark:border-slate-800"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="size-4 text-teal-600 dark:text-teal-400" />
                      {group.doctorName}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDateTime(group.visitDate).dateTime}
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "medicament" : "medicamente"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.items.map((rx) => (
                    <div
                      key={rx.$id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Pill className="size-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {rx.medicationName}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            rx.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : rx.status === "completed"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          {rx.status === "active"
                            ? "Activă"
                            : rx.status === "completed"
                              ? "Finalizată"
                              : rx.status === "discontinued"
                                ? "Întreruptă"
                                : rx.status}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                        <div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Doză
                          </span>
                          <p className="text-slate-700 dark:text-slate-300">
                            {rx.dosage}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Frecvență
                          </span>
                          <p className="text-slate-700 dark:text-slate-300">
                            {rx.frequency}
                          </p>
                        </div>
                        {rx.route && (
                          <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Cale administrare
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {rx.route}
                            </p>
                          </div>
                        )}
                        {rx.quantity && (
                          <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Cantitate
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {rx.quantity}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Început
                          </span>
                          <p className="text-slate-700 dark:text-slate-300">
                            {formatDateTime(rx.startDate).dateOnly}
                          </p>
                        </div>
                        {rx.endDate && (
                          <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Sfârșit
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {formatDateTime(rx.endDate).dateOnly}
                            </p>
                          </div>
                        )}
                        {rx.refills != null && rx.refills > 0 && (
                          <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Reumpleri
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {rx.refills}
                            </p>
                          </div>
                        )}
                      </div>

                      {rx.instructions && (
                        <div className="mt-2 rounded-md bg-slate-50 p-2.5 dark:bg-slate-800/60">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Instrucțiuni
                          </p>
                          <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                            {rx.instructions}
                          </p>
                        </div>
                      )}

                      {rx.discontinuedReason && (
                        <div className="mt-2 rounded-md bg-rose-50 p-2.5 dark:bg-rose-900/20">
                          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                            Motiv întrerupere
                          </p>
                          <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
                            {rx.discontinuedReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
