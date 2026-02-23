import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl mb-2">Mesaje cu medicul</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Conversații legate de programările dumneavoastră. Selectați o programare pentru a vedea sau trimite mesaje.
      </p>
      <MessagesView
        appointments={list}
        userId={userId}
        initialAppointmentId={searchParams?.appointmentId ?? null}
      />
    </div>
  );
};

export default PatientMessagesPage;
