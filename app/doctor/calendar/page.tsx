import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { MedicalCalendar } from "@/components/MedicalCalendar";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  type: "appointment-scheduled" | "appointment-pending" | "appointment-cancelled";
  detail?: string;
  doctorName?: string;
};

export default async function DoctorCalendarPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/?doctor=true");

  const data = await getRecentAppointmentList(doctorName);
  const appointments = data?.documents ?? [];

  const typeMap: Record<string, CalendarEvent["type"]> = {
    scheduled: "appointment-scheduled",
    pending: "appointment-pending",
    cancelled: "appointment-cancelled",
  };

  const events: CalendarEvent[] = appointments.map((apt: any) => ({
    id: `apt-${apt.$id}`,
    date: new Date(apt.schedule).toISOString(),
    title: apt.reason || "Consultație",
    type: typeMap[apt.status] || "appointment-pending",
    detail: `${apt.patient?.name ?? "Pacient"} · ${new Date(apt.schedule).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`,
    doctorName: apt.primaryPhysician,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Calendar</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Programările tale, afișate pe calendar.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MedicalCalendar events={events} />
      </section>
    </div>
  );
}
