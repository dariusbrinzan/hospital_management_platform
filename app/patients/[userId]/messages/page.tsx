import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MessagesView } from "@/components/MessagesView";

const PatientMessagesPage = async ({
  params: { userId },
  searchParams,
}: {
  params: { userId: string };
  searchParams: { appointmentId?: string };
}) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/messages`);
  }

  const user = await getUser(userId);
  const patient = await getPatient(userId);
  const { all: appointments } = await getPatientAppointments(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  const list = (appointments || [])
    .filter((a: any) => a.status !== "cancelled")
    .map((a: any) => ({
      $id: a.$id,
      schedule: a.schedule,
      primaryPhysician: a.primaryPhysician,
      status: a.status,
      reason: a.reason,
    }))
    .sort((a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-dark-200 bg-white px-6 py-4 dark:border-dark-600 dark:bg-dark-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
            <Link
              href={`/patients/${userId}/dashboard`}
              className="text-14-medium text-dark-600 hover:text-dark-700 dark:text-dark-300 dark:hover:text-dark-200"
            >
              Dashboard
            </Link>
            <Link
              href={`/patients/${userId}/medical-history`}
              className="text-14-medium text-dark-600 hover:text-dark-700 dark:text-dark-300 dark:hover:text-dark-200"
            >
              Istoric Medical
            </Link>
            <Link
              href={`/patients/${userId}/calendar`}
              className="text-14-medium text-dark-600 hover:text-dark-700 dark:text-dark-300 dark:hover:text-dark-200"
            >
              Calendar
            </Link>
            <Link
              href={`/patients/${userId}/messages`}
              className="text-14-medium text-green-600 hover:text-green-700 dark:text-green-400"
            >
              Mesaje
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="text-14-medium text-green-500 hover:text-green-600 dark:text-green-400"
            >
              Programare nouă
            </Link>
            <NotificationsDropdown userId={userId} />
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/user.svg"
                height={24}
                width={24}
                alt="user"
                className="size-6"
              />
              <p className="text-14-medium text-dark-800 dark:text-dark-100">{patient.name}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="header mb-2">Mesaje cu medicul</h1>
        <p className="text-dark-600 dark:text-dark-400 mb-6">
          Conversații legate de programările dumneavoastră. Selectați o programare pentru a vedea sau trimite mesaje.
        </p>
        <MessagesView
          appointments={list}
          userId={userId}
          initialAppointmentId={searchParams?.appointmentId ?? null}
        />
      </main>
    </div>
  );
};

export default PatientMessagesPage;
