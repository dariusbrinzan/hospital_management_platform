import { requireAdmin } from "@/lib/actions/auth.actions";
import { getModalities, getUpcomingStudies } from "@/lib/actions/imaging.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { ImagingBookingForm } from "@/components/ImagingBookingForm";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminImagingPage({ searchParams }: SearchParamProps) {
  await requireAdmin();
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
    <AdminPageLayout
      title="🩻 Investigații imagistice"
      description="Programări RMN, CT, Ecografie, Radiologie — pacienți ambulatori sau din urgențe."
    >
      <div className="rounded-lg border border-green-200 bg-green-50/60 p-4 text-14-regular text-dark-700 dark:border-green-800 dark:bg-green-950/30 dark:text-dark-200">
        <p className="font-medium text-dark-900 dark:text-dark-100">Fluxuri programări imagistică</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-dark-600 dark:text-dark-300">
          <li><strong>Direct (aici):</strong> programare pentru orice pacient (căutare pacienți mai jos).</li>
          <li><strong>Din programări:</strong> medicii pot programa imagistică din panoul Doctor → Imagistică (sursă „Programare”).</li>
          <li><strong>Din urgențe:</strong> pentru pacienți din urgențe, deschide cazul în <Link href="/admin/emergency" className="text-green-700 underline hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">Urgențe</Link> și adaugă investigații imagistice din detaliile cazului.</li>
        </ul>
      </div>

      <section>
        <h2 className="text-18-semibold text-dark-900 mb-2">Modalități disponibile</h2>
        <p className="text-14-regular text-dark-600 mb-4">
          Sloturi și durate per modalitate. Formularul de mai jos creează programări cu sursă „Direct”.
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
        <h2 className="text-18-semibold text-dark-900 mb-4">Programări viitoare (toate sursele)</h2>
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
    </AdminPageLayout>
  );
}
