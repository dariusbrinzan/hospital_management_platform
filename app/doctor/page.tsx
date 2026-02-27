import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";

import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { DoctorAppointmentsCards } from "@/components/DoctorAppointmentsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorDashboardPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/?doctor=true");

  const appointments = await getRecentAppointmentList(doctorName);
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.documents.filter(
    (apt: any) => apt.status !== "cancelled" && new Date(apt.schedule).toISOString().slice(0, 10) === todayIso
  ).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Programări</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Programările mele
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Azi: {todayCount} programări · total: {appointments.totalCount} · confirmate: {appointments.scheduledCount} · în
          așteptare: {appointments.pendingCount} · anulate: {appointments.cancelledCount}
        </p>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Lista programări</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Click pe o programare pentru dosar pacient, mesaje sau raport consultație.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <DoctorAppointmentsCards appointments={appointments.documents} />
        </CardContent>
      </Card>
    </div>
  );
}
