import { requireAdmin } from "@/lib/actions/auth.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { AdminPageLayout } from "@/components/AdminPageLayout";

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateTime;
  } catch {
    return String(iso);
  }
}

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  await requireAdmin();
  const appointments = await getRecentAppointmentList();

  const docs = appointments?.documents ?? [];

  return (
    <AdminPageLayout
      title="Programări"
      description={`Toate programările: ${appointments.totalCount} total · ${appointments.scheduledCount} confirmate · ${appointments.pendingCount} în așteptare · ${appointments.cancelledCount} anulate`}
    >
      <section className="admin-section-card rounded-xl border border-dark-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="overflow-hidden rounded-lg border border-dark-200 text-14-regular">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 bg-dark-50 text-left">
                <th className="px-3 py-2 font-medium text-dark-700">Pacient</th>
                <th className="px-3 py-2 font-medium text-dark-700">Data / oră</th>
                <th className="px-3 py-2 font-medium text-dark-700">Doctor</th>
                <th className="px-3 py-2 font-medium text-dark-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-dark-500">
                    Nu există programări.
                  </td>
                </tr>
              ) : (
                docs.map((a: any) => (
                  <tr key={a.$id} className="border-b border-dark-100 last:border-0">
                    <td className="px-3 py-2 text-dark-800">
                      {a.patient?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-dark-600">{fmt(a.schedule)}</td>
                    <td className="px-3 py-2 text-dark-600">{a.primaryPhysician ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className="rounded px-1.5 py-0.5 text-12-medium bg-dark-100 text-dark-700">
                        {a.status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageLayout>
  );
}
