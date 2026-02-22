import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import { getModalities, getUpcomingStudies } from "@/lib/actions/imaging.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { ImagingBookingForm } from "@/components/ImagingBookingForm";

export const dynamic = "force-dynamic";

export default async function AdminImagingPage({ searchParams }: SearchParamProps) {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/doctor");
  const patientId = (searchParams?.patientId as string) || undefined;
  const [modalities, upcoming, initialPatient] = await Promise.all([
    getModalities(),
    getUpcomingStudies(30),
    patientId ? getPatientById(patientId) : Promise.resolve(null),
  ]);
  const initialPatientForForm =
    initialPatient && patientId
      ? { $id: patientId, name: initialPatient.name }
      : undefined;

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={200}
            alt="eHealth.ro logo"
            className="h-8 w-fit"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi la Dashboard
          </Link>
          <h1 className="text-16-semibold">🩻 Investigații imagistice</h1>
        </div>
      </header>

      <main className="admin-main space-y-8">
        <section>
          <h2 className="text-18-semibold text-dark-900 mb-2">Modalități</h2>
          <p className="text-14-regular text-dark-600 mb-4">
            Programări imagistice (RMN, CT, Ecografie, Radiologie etc.) cu sloturi și integrare în fluxurile de programări și urgențe.
          </p>
          <ul className="flex flex-wrap gap-2">
            {modalities.map((m: any) => (
              <li
                key={m.$id}
                className="rounded-lg border border-dark-200 bg-white px-4 py-2 text-14-regular text-dark-700"
              >
                {m.name}
                <span className="ml-1 text-dark-500">({m.slotDurationMinutes} min)</span>
              </li>
            ))}
          </ul>
        </section>

        <ImagingBookingForm
          modalities={modalities}
          initialPatient={initialPatientForForm}
        />

        <section className="rounded-lg border border-dark-200 bg-white p-6">
          <h2 className="text-18-semibold text-dark-900 mb-4">Programări viitoare</h2>
          {!upcoming || upcoming.length === 0 ? (
            <p className="text-14-regular text-dark-600">Nu există programări imagistice în perioada următoare.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-14-regular">
                <thead>
                  <tr className="border-b border-dark-200 text-left text-dark-600">
                    <th className="pb-2 pr-4">Pacient</th>
                    <th className="pb-2 pr-4">Modalitate</th>
                    <th className="pb-2 pr-4">Data și ora</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Sursă</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((s: any) => (
                    <tr key={s.$id} className="border-b border-dark-100">
                      <td className="py-2 pr-4 text-dark-800">{s.patientName || s.patientId || "—"}</td>
                      <td className="py-2 pr-4">{s.modalityName || s.modalityId}</td>
                      <td className="py-2 pr-4">
                        {s.scheduledAt ? formatDateTime(s.scheduledAt).dateTime : "—"}
                      </td>
                      <td className="py-2 pr-4">{s.status}</td>
                      <td className="py-2 pr-4">
                        {s.sourceType === "emergency" && "Urgență"}
                        {s.sourceType === "appointment" && "Programare"}
                        {s.sourceType === "direct" && "Direct"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
