import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  FileText,
  Download,
  MapPin,
  Pill,
  Heart,
  ClipboardList,
  Video,
} from "lucide-react";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { ensureAppointmentReminders24h } from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";
import { getRoomByDoctor } from "@/lib/hospital-map";
import { StatusBadge } from "@/components/StatusBadge";
import { Doctors } from "@/constants";
import { RescheduleAppointmentButton } from "@/components/RescheduleAppointmentButton";
import { CancelAppointmentButton } from "@/components/CancelAppointmentButton";
import { CheckInAppointmentButton } from "@/components/CheckInAppointmentButton";
import { PastAppointmentsList } from "@/components/PastAppointmentsList";
import { doctorReviewHelpers } from "@/lib/db-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PatientDashboard = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/dashboard`);
  }

  await ensureAppointmentReminders24h(userId);

  const user = await getUser(userId);
  const patient = await getPatient(userId);
  const appointments = await getPatientAppointments(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  const patientReviews = doctorReviewHelpers.getByPatientId(patient.$id);
  const reviewsByAppointment = new Map(patientReviews.map((r) => [r.appointmentId, r]));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-slate-50/80 px-4 py-10 dark:border-slate-800 dark:from-slate-900/50 dark:via-slate-900 dark:to-teal-950/20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.08),transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Dashboard</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Bun venit,{" "}
                <Link
                  href={`/patients/${userId}/profile`}
                  className="underline decoration-teal-500/60 underline-offset-2 hover:decoration-teal-600 dark:decoration-teal-400 dark:hover:decoration-teal-300"
                >
                  {patient.name}
                </Link>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                Aici poți vedea programările, datele de contact și istoricul medical. Descarcă dosarul PDF pentru o copie locală.
              </p>
            </div>
            <a
              href={`/api/pdf/patient/${patient.$id}`}
              download
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 shadow-sm transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-950/50"
            >
              <Download className="size-4" />
              Descarcă dosar PDF
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <CalendarCheck className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {appointments.upcoming.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Programări viitoare</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <CalendarClock className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {appointments.past.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Programări trecute</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {appointments.all.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total programări</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div>
          <section className="space-y-6">
            <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Programări viitoare</CardTitle>
                <CardDescription>Următoarele programări și acțiuni disponibile</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.upcoming.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                    Nu ai programări viitoare.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appointments.upcoming.map((appointment: any) => {
                      const doctor = Doctors.find((doc) => doc.name === appointment.primaryPhysician);
                      const appointmentRoom = getRoomByDoctor(appointment.primaryPhysician);

                      return (
                        <div
                          key={appointment.$id}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={
                                  appointmentRoom
                                    ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                                    : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                                }
                                className="mb-3 flex items-center gap-3 rounded-lg p-2 -ml-2 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:hover:bg-slate-700/50 dark:focus:bg-slate-700/50"
                                title={
                                  appointmentRoom
                                    ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor}`
                                    : "Deschide harta spitalului"
                                }
                              >
                                {doctor && (
                                  <Image
                                    src={doctor.image}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="size-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-600"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {appointment.primaryPhysician}
                                  </p>
                                  {doctor?.specialty && (
                                    <p className="text-sm text-teal-600 dark:text-teal-400">{doctor.specialty}</p>
                                  )}
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatDateTime(appointment.schedule).dateTime}
                                  </p>
                                  {appointmentRoom && (
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                      Cabinet {appointmentRoom.roomNumber}, Etaj {appointmentRoom.floor} · click pentru hartă
                                    </p>
                                  )}
                                </div>
                              </Link>

                              {appointment.reason && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  <span className="font-medium">Motiv:</span> {appointment.reason}
                                </p>
                              )}
                              {appointment.note && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  <span className="font-medium">Notă:</span> {appointment.note}
                                </p>
                              )}

                              {appointment.analysisResults && (
                                <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-800 dark:bg-teal-950/30">
                                  <p className="mb-2 text-sm font-semibold text-teal-800 dark:text-teal-200">
                                    Rezultate analize
                                  </p>
                                  {(() => {
                                    try {
                                      const results = JSON.parse(appointment.analysisResults);
                                      if (Array.isArray(results) && results.length > 0) {
                                        return (
                                          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                            {results.map((result: any, index: number) => (
                                              <div
                                                key={index}
                                                className="flex flex-wrap gap-x-4 gap-y-0 border-b border-teal-200/50 pb-2 last:border-0 last:pb-0 dark:border-teal-800/50"
                                              >
                                                <span className="font-medium">{result.testName}</span>
                                                <span>Valoare: {result.value}{result.unit ? ` ${result.unit}` : ""}</span>
                                                {result.referenceRange && (
                                                  <span className="text-slate-500">Referință: {result.referenceRange}</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                    } catch {
                                      return (
                                        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                                          {appointment.analysisResults}
                                        </p>
                                      );
                                    }
                                  })()}
                                </div>
                              )}

                              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Acțiuni</p>
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                    <Button variant="outline" size="sm" className="h-10 w-full justify-center" asChild>
                                      <Link href={`/patients/${userId}/messages?appointmentId=${appointment.$id}`}>
                                        Mesaje
                                      </Link>
                                    </Button>
                                    {(appointment.status === "scheduled" || appointment.status === "pending") &&
                                      (appointment as any).appointmentType === "video" && (
                                        <Button variant="outline" size="sm" className="h-10 w-full justify-center border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/40" asChild>
                                          <Link
                                            href={`/video-call?appointmentId=${appointment.$id}`}
                                            prefetch={false}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Video className="size-4 mr-1.5" />
                                            Videoconferință
                                          </Link>
                                        </Button>
                                      )}
                                    {appointment.status !== "cancelled" && (
                                      <>
                                        <div className="w-full min-w-0">
                                          <CheckInAppointmentButton appointment={appointment} />
                                        </div>
                                        <div className="w-full min-w-0">
                                          <RescheduleAppointmentButton appointment={appointment} userId={userId} />
                                        </div>
                                        <div className="w-full min-w-0">
                                          <CancelAppointmentButton appointment={appointment} userId={userId} />
                                        </div>
                                      </>
                                    )}
                                    {(appointment as any).checkedInAt && (
                                      <span className="flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
                                        <CalendarCheck className="size-3.5" />
                                        Check-in făcut
                                      </span>
                                    )}
                                  </div>
                                  <Button size="sm" variant="outline" className="h-10 w-full justify-center border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:bg-slate-800" asChild>
                                    <Link
                                      href={
                                        appointmentRoom
                                          ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                                          : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                                    }
                                    >
                                      <MapPin className="size-4 mr-1.5" />
                                      {appointmentRoom
                                        ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor} — Vezi pe hartă`
                                        : "Vezi pe hartă"}
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <StatusBadge status={appointment.status} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Istoric programări</CardTitle>
                <CardDescription>Programări trecute, filtre și evaluări</CardDescription>
              </CardHeader>
              <CardContent>
                <PastAppointmentsList
                  past={appointments.past}
                  userId={userId}
                  patientReviews={patientReviews}
                />
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Medical history */}
        <section className="mt-8">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <ClipboardList className="size-5 text-teal-600 dark:text-teal-400" />
                Istoric medical
              </CardTitle>
              <CardDescription>Alergii, medicație curentă și istoric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {patient.allergies && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Pill className="size-4 text-amber-500" /> Alergii
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{patient.allergies}</p>
                  </div>
                )}
                {patient.currentMedication && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Pill className="size-4 text-teal-500" /> Medicație curentă
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{patient.currentMedication}</p>
                  </div>
                )}
                {patient.familyMedicalHistory && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Heart className="size-4 text-rose-500" /> Istoric medical familial
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{patient.familyMedicalHistory}</p>
                  </div>
                )}
                {patient.pastMedicalHistory && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <FileText className="size-4 text-slate-500" /> Istoric medical personal
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{patient.pastMedicalHistory}</p>
                  </div>
                )}
              </div>
              {!patient.allergies &&
                !patient.currentMedication &&
                !patient.familyMedicalHistory &&
                !patient.pastMedicalHistory && (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                    Nu există informații medicale înregistrate.
                  </p>
                )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
