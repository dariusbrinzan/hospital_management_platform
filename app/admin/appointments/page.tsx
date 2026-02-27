import { requireAdmin } from "@/lib/actions/auth.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateTime;
  } catch {
    return String(iso);
  }
}

const tableBase =
  "w-full text-sm border-collapse rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700";
const tableHeadRow =
  "border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60";
const tableHeadCell =
  "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300";
const tableCell =
  "border-b border-slate-100 px-3 py-2.5 text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-300";
const tableCellMuted = "text-slate-500 dark:text-slate-400";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  await requireAdmin();
  const appointments = await getRecentAppointmentList();
  const docs = appointments?.documents ?? [];

  return (
    <AdminPageLayout
      title="Programări"
      description={`${appointments.totalCount} total · ${appointments.scheduledCount} confirmate · ${appointments.pendingCount} în așteptare · ${appointments.cancelledCount} anulate`}
    >
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Toate programările
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Lista programărilor din sistem. Pentru acțiuni pe programări, folosiți panoul Doctor sau secțiunea dedicată.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className={tableBase}>
              <thead>
                <tr className={tableHeadRow}>
                  <th className={tableHeadCell}>Pacient</th>
                  <th className={tableHeadCell}>Data / oră</th>
                  <th className={tableHeadCell}>Doctor</th>
                  <th className={tableHeadCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Nu există programări.
                    </td>
                  </tr>
                ) : (
                  docs.map((a: any) => (
                    <tr key={a.$id}>
                      <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>
                        {a.patient?.name ?? "—"}
                      </td>
                      <td className={tableCell + " " + tableCellMuted}>{fmt(a.schedule)}</td>
                      <td className={tableCell + " " + tableCellMuted}>{a.primaryPhysician ?? "—"}</td>
                      <td className={tableCell}>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {a.status ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
