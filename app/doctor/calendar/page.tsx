import { redirect } from "next/navigation";
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
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Programările tale, afișate pe calendar.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <MedicalCalendar events={events} />
      </section>
    </div>
  );
}
