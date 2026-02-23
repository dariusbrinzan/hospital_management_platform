import { redirect } from "next/navigation";

import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { MedicalCalendar } from "@/components/MedicalCalendar";
import { vaccinationHelpers, prescriptionHelpers } from "@/lib/db-helpers";

const CalendarPage = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/calendar`);
  }

  const patient = await getPatient(userId);
  if (!patient) redirect(`/patients/${userId}/register`);

  const appointments = await getPatientAppointments(userId);
  const vaccinations = vaccinationHelpers.getByPatientId(patient.$id);
  const activePrescriptions = prescriptionHelpers.getActiveByPatientId(patient.$id);

  type CalendarEvent = {
    id: string;
    date: string;
    title: string;
    type: "appointment-scheduled" | "appointment-pending" | "appointment-cancelled" | "vaccination" | "prescription";
    detail?: string;
    doctorName?: string;
  };

  const events: CalendarEvent[] = [];

  appointments.all.forEach((apt: any) => {
    const typeMap: Record<string, CalendarEvent["type"]> = {
      scheduled: "appointment-scheduled",
      pending: "appointment-pending",
      cancelled: "appointment-cancelled",
    };
    events.push({
      id: `apt-${apt.$id}`,
      date: new Date(apt.schedule).toISOString(),
      title: apt.reason || "Consultație",
      type: typeMap[apt.status] || "appointment-pending",
      doctorName: apt.primaryPhysician,
      detail: new Date(apt.schedule).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }),
    });
  });

  vaccinations.forEach((vac: any) => {
    if (vac.nextDoseDate) {
      events.push({
        id: `vac-${vac.$id}`,
        date: new Date(vac.nextDoseDate).toISOString(),
        title: `Rapel: ${vac.vaccineName}`,
        type: "vaccination",
        detail: "Doză următoare",
      });
    }
    events.push({
      id: `vac-done-${vac.$id}`,
      date: new Date(vac.administrationDate).toISOString(),
      title: vac.vaccineName,
      type: "vaccination",
      detail: vac.administeredBy ? `Administrat de ${vac.administeredBy}` : "Administrat",
    });
  });

  activePrescriptions.forEach((rx: any) => {
    if (rx.endDate) {
      events.push({
        id: `rx-${rx.$id}`,
        date: new Date(rx.endDate).toISOString(),
        title: `${rx.medicationName} - expiră`,
        type: "prescription",
        detail: `${rx.dosage}, ${rx.frequency}`,
      });
    }
  });

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Calendar Medical</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Vizualizează programările, vaccinările și rețetele tale într-un calendar interactiv.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <MedicalCalendar events={events} />
      </section>
    </div>
  );
};

export default CalendarPage;
