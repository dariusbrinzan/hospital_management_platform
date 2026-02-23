import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { NotificationsList } from "@/components/NotificationsList";

const NotificationsPage = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/notifications`);
  }

  const user = await getUser(userId);
  const patient = await getPatient(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Toate notificările</h1>
        <Link
          href={`/patients/${userId}/dashboard`}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Înapoi la Dashboard
        </Link>
      </div>

      <NotificationsList userId={userId} />
    </div>
  );
};

export default NotificationsPage;
