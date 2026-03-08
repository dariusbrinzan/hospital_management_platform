import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Calendar, Stethoscope, User, UserRound } from "lucide-react";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { emergencyHelpers, doctorsOnDutyHelpers } from "@/lib/db-helpers";
import { formatDateTime, formatEmergencyCaseNumber, getWaitingMinutes } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STATE_LABELS: Record<string, string> = {
  arrival: "Prezentare",
  triage: "Triaj",
  consent: "Consimțământ",
  admission: "Internare",
  treatment: "Tratament",
  icu: "ATI",
  discharge: "Externare",
};

const TRIAGE_LABELS: Record<string, string> = {
  critic: "Critic",
  urgent: "Urgent",
  normal: "Normal",
};

export default async function DoctorEmergencyPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const [myCases, isOnDuty] = await Promise.all([
    Promise.resolve(emergencyHelpers.getByAssignedDoctor(doctorName)),
    Promise.resolve(doctorsOnDutyHelpers.isOnDuty(doctorName)),
  ]);

  const activeCases = myCases.filter((c) => c.currentState !== "discharge");
  const byPriority = [...activeCases].sort(
    (a, b) => (a.priority ?? 9) - (b.priority ?? 9) || new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-teal-600 dark:text-teal-400" />
            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Urgențe</p>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Cazurile mele de urgență
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cazuri în care ești asignat. Acces rapid la dosarul pacientului și la fluxul cazului.
          </p>
        </div>
        {isOnDuty && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            <Stethoscope className="size-4" />
            Ești de gardă
          </span>
        )}
      </div>

      {activeCases.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Niciun caz asignat</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
              Nu ai în prezent cazuri de urgență active. Când vei fi asignat unui caz, acesta va apărea aici.
            </p>
            {isOnDuty && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                Ești de gardă — cazurile noi pot fi alocate de dispecerat.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {activeCases.length} caz{activeCases.length === 1 ? "" : "uri"} activ{activeCases.length === 1 ? "" : "e"}
          </p>
          <div className="space-y-3">
            {byPriority.map((c) => {
              const patientName = c.patient?.name ?? c.patientName ?? "Pacient necunoscut";
              const caseNumber = formatEmergencyCaseNumber(c.$id);
              const waitingMin =
                c.currentState !== "discharge" && c.arrivalTime
                  ? getWaitingMinutes(c.arrivalTime)
                  : null;

              return (
                <Card
                  key={c.$id}
                  className="border-slate-200/80 shadow-sm transition hover:border-teal-300 dark:border-slate-800 dark:hover:border-teal-700"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {caseNumber}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              c.triageLevel === "critic"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                : c.triageLevel === "urgent"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {TRIAGE_LABELS[c.triageLevel] ?? c.triageLevel}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {patientName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {c.chiefComplaint}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="size-3.5 shrink-0" />
                          {formatDateTime(c.arrivalTime).dateTime}
                          {waitingMin != null && (
                            <span className="text-amber-600 dark:text-amber-400">
                              · Așteptare {waitingMin} min
                            </span>
                          )}
                        </div>
                        <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {STATE_LABELS[c.currentState] ?? c.currentState}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {c.patientId && (
                          <Link
                            href={`/doctor/patients/${c.patientId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <UserRound className="size-4" />
                            Dosar pacient
                          </Link>
                        )}
                        <Link
                          href={`/doctor/emergency/${c.$id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                        >
                          Deschide caz
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {myCases.some((c) => c.currentState === "discharge") && (
        <Card className="mt-8 border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cazuri externate (istoric)</CardTitle>
            <CardDescription>Cazuri încheiate — doar informativ</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {myCases
                .filter((c) => c.currentState === "discharge")
                .sort((a, b) => new Date(b.dischargeTime ?? 0).getTime() - new Date(a.dischargeTime ?? 0).getTime())
                .slice(0, 5)
                .map((c) => (
                  <li key={c.$id} className="flex items-center justify-between gap-2">
                    <span>
                      {formatEmergencyCaseNumber(c.$id)} — {c.patient?.name ?? c.patientName ?? "Pacient"}
                    </span>
                    <Link
                      href={`/doctor/emergency/${c.$id}`}
                      className="text-teal-600 hover:underline dark:text-teal-400"
                    >
                      Vezi caz
                    </Link>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
