import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/actions/auth.actions";
import { HospitalMap } from "@/components/HospitalMap";
import { LogoLink } from "@/components/LogoLink";
import { LogoutButton } from "@/components/LogoutButton";
import Image from "next/image";
import Link from "next/link";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";

const HospitalMapPage = async ({
  params: { userId },
  searchParams,
}: SearchParamProps & { searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> }) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/hospital-map`);
  }

  const raw = searchParams ?? {};
  const resolved = typeof (raw as Promise<unknown>).then === "function" ? await (raw as Promise<Record<string, string | string[] | undefined>>) : (raw as Record<string, string | string[] | undefined>);
  const floorParam = resolved?.floor != null ? Number(resolved.floor) : undefined;
  const roomIdParam = typeof resolved?.roomId === "string" ? resolved.roomId : undefined;
  const searchParam = typeof resolved?.search === "string" ? resolved.search : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
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
              href={`/patients/${userId}/hospital-map`}
              className="text-14-medium text-green-500 hover:text-green-600"
            >
              Hartă Spital
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="text-14-medium text-green-500 hover:text-green-600"
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
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="header mb-2">Hartă Spital</h1>
            <p className="text-14-regular text-dark-600">
              Explorați planul clădirii, căutați cabinete sau doctori și apăsați pe fiecare cameră pentru detalii.
            </p>
          </div>
          <HospitalMap
            initialFloor={Number.isInteger(floorParam) ? floorParam : undefined}
            highlightRoomId={roomIdParam}
            initialSearch={searchParam}
          />
        </div>
      </main>
    </div>
  );
};

export default HospitalMapPage;
