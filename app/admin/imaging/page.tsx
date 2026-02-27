import Link from "next/link";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { getModalities, getUpcomingStudies } from "@/lib/actions/imaging.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { ImagingBookingForm } from "@/components/ImagingBookingForm";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const tableBase =
  "w-full text-sm border-collapse rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700";
const tableHeadRow = "border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60";
const tableHeadCell =
  "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300";
const tableCell =
  "border-b border-slate-100 px-3 py-2.5 text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-300";
const tableCellMuted = "text-slate-500 dark:text-slate-400";

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
      title="Investigații imagistice"
      description="Programări RMN, CT, Ecografie, Radiologie — pacienți ambulatori sau din urgențe."
    >
      <div className="space-y-6">
        <Card className="border-teal-200/80 bg-teal-50/60 dark:border-teal-800 dark:bg-teal-950/20">
          <CardContent className="p-4">
            <p className="font-medium text-slate-900 dark:text-slate-100">Fluxuri programări imagistică</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>Direct (aici):</strong> programare pentru orice pacient (căutare pacienți mai jos).</li>
              <li><strong>Din programări:</strong> medicii pot programa imagistică din panoul Doctor → Imagistică (sursă „Programare”).</li>
              <li>
                <strong>Din urgențe:</strong> deschide cazul în{" "}
                <Link href="/admin/emergency" className="text-teal-700 underline hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300">
                  Urgențe
                </Link>{" "}
                și adaugă investigații din detaliile cazului.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Modalități disponibile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sloturi și durate per modalitate. Formularul de mai jos creează programări cu sursă „Direct”.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {modalities.map((m: any) => (
                <li
                  key={m.$id}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  {m.name}
                  <span className="ml-1 text-slate-500 dark:text-slate-400">({m.slotDurationMinutes} min)</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <ImagingBookingForm
          modalities={modalities}
          initialPatient={initialPatientForForm}
        />

        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Programări viitoare (toate sursele)</h2>
          </CardHeader>
          <CardContent className="p-0">
            {!upcoming || upcoming.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
                Nu există programări imagistice în perioada următoare.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className={tableBase}>
                  <thead>
                    <tr className={tableHeadRow}>
                      <th className={tableHeadCell}>Pacient</th>
                      <th className={tableHeadCell}>Modalitate</th>
                      <th className={tableHeadCell}>Data și ora</th>
                      <th className={tableHeadCell}>Status</th>
                      <th className={tableHeadCell}>Sursă</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((s: any) => (
                      <tr key={s.$id}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>
                          {s.patientName || s.patientId || "—"}
                        </td>
                        <td className={tableCell + " " + tableCellMuted}>{s.modalityName || s.modalityId}</td>
                        <td className={tableCell + " " + tableCellMuted}>
                          {s.scheduledAt ? formatDateTime(s.scheduledAt).dateTime : "—"}
                        </td>
                        <td className={tableCell}>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {s.status}
                          </span>
                        </td>
                        <td className={tableCell + " " + tableCellMuted}>
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
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
