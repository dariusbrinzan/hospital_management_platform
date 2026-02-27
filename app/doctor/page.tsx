import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { DoctorAppointmentsCards } from "@/components/DoctorAppointmentsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorDashboardPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) return null;

  const appointments = await getRecentAppointmentList(doctorName);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
              Programările mele
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Azi: {appointments.documents.filter((apt: any) => apt.status !== "cancelled" && new Date(apt.schedule).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).length} programări · total: {appointments.totalCount} · confirmate:{" "}
              {appointments.scheduledCount} · în așteptare: {appointments.pendingCount} · anulate:{" "}
              {appointments.cancelledCount}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <DoctorAppointmentsCards appointments={appointments.documents} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
