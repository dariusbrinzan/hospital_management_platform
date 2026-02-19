import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { LogoLink } from "@/components/LogoLink";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { MedicalCalendar } from "@/components/MedicalCalendar";
import { vaccinationHelpers, prescriptionHelpers } from "@/lib/db-helpers";
import Image from "next/image";

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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <LogoLink />
          <div className="flex items-center gap-6">
            <Link
              href={`/patients/${userId}/dashboard`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Dashboard
            </Link>
            <Link
              href={`/patients/${userId}/medical-history`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Istoric Medical
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="text-14-medium text-green-500 hover:text-green-600"
            >
              Programare nouă
            </Link>
            <NotificationsDropdown userId={userId} />
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/user.svg"
                height={24}
                width={24}
                alt="user"
                className="size-6"
              />
              <p className="text-14-medium">{patient.name}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <section className="mb-6">
          <h1 className="header mb-2">Calendar Medical</h1>
          <p className="text-dark-600">
            Vizualizează programările, vaccinările și rețetele tale într-un calendar interactiv.
          </p>
        </section>

        <section className="rounded-lg border border-dark-200 bg-white p-6">
          <MedicalCalendar events={events} />
        </section>
      </main>

      <footer className="border-t border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-14-regular text-dark-500 text-center">
            © 2026 eHealth.ro
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CalendarPage;
