import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
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
              href={`/patients/${userId}/calendar`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Calendar
            </Link>
            <Link
              href={`/patients/${userId}/profile`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Profil Medical
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-24-semibold text-dark-800">Toate notificările</h1>
          <Link
            href={`/patients/${userId}/dashboard`}
            className="text-14-medium text-green-500 hover:text-green-600"
          >
            Înapoi la Dashboard
          </Link>
        </div>

        <NotificationsList userId={userId} />
      </main>
    </div>
  );
};

export default NotificationsPage;
