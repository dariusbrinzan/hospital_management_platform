import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/actions/auth.actions";
import { HospitalMap } from "@/components/HospitalMap";

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
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Hartă Spital</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Explorați planul clădirii, căutați cabinete sau doctori și apăsați pe fiecare cameră pentru detalii.
        </p>
      </div>
      <HospitalMap
        initialFloor={Number.isInteger(floorParam) ? floorParam : undefined}
        highlightRoomId={roomIdParam}
        initialSearch={searchParam}
      />
    </div>
  );
};

export default HospitalMapPage;
