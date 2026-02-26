"use client";

import Link from "next/link";
import { Calendar, FileText, MessageSquare, Video, User } from "lucide-react";
import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { AnalysisResultsModal } from "@/components/AnalysisResultsModal";
import { AddMedicalRecordModal } from "@/components/AddMedicalRecordModal";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AppointmentDoc = {
  $id: string;
  schedule: string;
  status: string;
  primaryPhysician: string;
  reason?: string | null;
  note?: string | null;
  analysisResults?: string | null;
  appointmentType?: string;
  patient: { $id: string; name: string };
  userId: string;
};

export function DoctorAppointmentsCards({
  appointments,
}: {
  appointments: AppointmentDoc[];
}) {
  if (!appointments.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Nu aveți programări în listă.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {appointments.map((appointment) => {
        const doctor = Doctors.find((d) => d.name === appointment.primaryPhysician);
        const isAnalysisDoctor = doctor?.specialty === "Analize medicale";
        const hasResults =
          appointment.analysisResults && appointment.analysisResults.trim().length > 0;
        const isVideo = (appointment as any).appointmentType === "video";

        return (
          <Card
            key={appointment.$id}
            className="overflow-hidden border-slate-200/80 shadow-sm transition hover:shadow-md dark:border-slate-800"
          >
            <CardHeader className="space-y-1 pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                    <User className="size-5" />
                  </div>
                  <div>
                    <Link
                      href={`/doctor/patients/${appointment.patient.$id}`}
                      className="text-base font-semibold text-teal-700 hover:underline dark:text-teal-300"
                    >
                      {appointment.patient.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDateTime(appointment.schedule).dateTime}
                      </span>
                      {isVideo && (
                        <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                          Videoconferință
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={appointment.status as Status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {(appointment.reason || appointment.note) && (
                <>
                  {appointment.reason && (
                    <div>
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <FileText className="size-3.5" />
                        Motivul programării
                      </p>
                      <p className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                        {appointment.reason}
                      </p>
                    </div>
                  )}
                  {appointment.note && (
                    <div>
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <MessageSquare className="size-3.5" />
                        Observații pacienți
                      </p>
                      <p className="rounded-lg border border-slate-100 bg-amber-50/60 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-amber-950/20 dark:text-slate-300">
                        {appointment.note}
                      </p>
                    </div>
                  )}
                </>
              )}
              {!appointment.reason && !appointment.note && (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  Pacientul nu a completat motivul sau observații.
                </p>
              )}
            </CardContent>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <CardFooter className="flex flex-wrap items-center gap-2 pt-4">
              {isAnalysisDoctor && appointment.status === "scheduled" && !hasResults && (
                <AnalysisResultsModal appointment={appointment as any} />
              )}
              {isAnalysisDoctor && appointment.status === "scheduled" && hasResults && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="rounded-lg border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Rezultate completate
                </Button>
              )}
              {!isAnalysisDoctor && appointment.status === "scheduled" && (
                <AddMedicalRecordModal
                  appointment={appointment as any}
                  doctorName={appointment.primaryPhysician}
                />
              )}
              {(appointment.status === "scheduled" || appointment.status === "pending") &&
                isVideo && (
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
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
                <AppointmentModal
                  patientId={appointment.patient.$id}
                  userId={appointment.userId}
                  appointment={appointment as any}
                  type="cancel"
                  title="Anulează programarea"
                  description="Sunteți sigur că doriți să anulați programarea?"
                  triggerClassName="h-9 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
                />
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
