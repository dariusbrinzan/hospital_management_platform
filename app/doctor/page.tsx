import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { DoctorDetails } from "@/components/DoctorDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck2, Clock3, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";

export default async function DoctorDashboardPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) return null;

  const appointments = await getRecentAppointmentList(doctorName);
  const doctorData = Doctors.find((d) => d.name === doctorName);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-slate-50/80 px-4 py-10 dark:border-slate-800 dark:from-slate-900/50 dark:via-slate-900 dark:to-teal-950/20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.08),transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Dashboard medic</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Bine ai venit, {doctorName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Vizualizare rapidă a programărilor, mesajelor și situațiilor care necesită intervenție în această zi.
              </p>
            </div>
            <Link
              href="/doctor/messages"
              prefetch={false}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 shadow-sm transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-950/50"
            >
              <MessageSquare className="size-4" />
              Deschide mesaje
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                <CalendarCheck2 className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{appointments.scheduledCount}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Programări confirmate</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <Clock3 className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{appointments.pendingCount}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">În așteptare</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                <XCircle className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{appointments.cancelledCount}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Programări anulate</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {doctorData && (
          <section className="mb-8">
            <DoctorDetails doctor={doctorData} />
          </section>
        )}

        <section>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 dark:text-slate-100">Programările mele</CardTitle>
              <CardDescription>Monitorizare și acțiuni rapide pentru consultațiile curente.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={appointments.documents} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
