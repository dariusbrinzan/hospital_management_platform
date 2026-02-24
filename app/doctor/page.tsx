import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorDashboardPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) return null;

  const appointments = await getRecentAppointmentList(doctorName);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 dark:text-slate-100">Programările mele</CardTitle>
            <CardDescription>
              Programări totale: {appointments.totalCount} · confirmate: {appointments.scheduledCount} · în așteptare:{" "}
              {appointments.pendingCount} · anulate: {appointments.cancelledCount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={appointments.documents} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
