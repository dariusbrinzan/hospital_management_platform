import { AdminDashboardSection } from "@/components/AdminDashboardSection";
import { getAdminDashboardSnippets } from "@/lib/actions/dashboard.actions";

const AdminPage = async () => {
  const data = await getAdminDashboardSnippets();

  return (
    <>
      <div className="border-b border-dark-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-20-semibold text-dark-900 sm:text-24-bold">
          Panou Administrator
        </h1>
        <p className="mt-1 text-14-regular text-dark-600">
          Rezumat rapid din fiecare secțiune. Derulați pentru a vedea toate.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <AdminDashboardSection title="Programări" href="/admin" icon="🏠">
            <ul className="space-y-1">
              <li><strong>{data.appointments.scheduledCount}</strong> confirmate</li>
              <li><strong>{data.appointments.pendingCount}</strong> în așteptare</li>
              <li><strong>{data.appointments.cancelledCount}</strong> anulate</li>
            </ul>
          </AdminDashboardSection>

          <AdminDashboardSection title="Urgente" href="/admin/emergency" icon="🚨">
            <p className="mb-2"><strong>{data.emergency.total}</strong> cazuri în sistem.</p>
            {data.emergency.recent.length > 0 ? (
              <ul className="list-inside list-disc space-y-0.5 text-dark-600">
                {data.emergency.recent.map((c) => (
                  <li key={c.$id}>
                    {c.patientName ?? "Pacient"} — {c.triageLevel}: {c.chiefComplaint.slice(0, 40)}
                    {c.chiefComplaint.length > 40 ? "…" : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-dark-500">Niciun caz recent.</p>
            )}
          </AdminDashboardSection>

          <AdminDashboardSection title="Medicamente" href="/admin/medications" icon="💊">
            {data.medications.lowStockCount > 0 ? (
              <>
                <p className="mb-2"><strong>{data.medications.lowStockCount}</strong> stocuri sub minim.</p>
                <ul className="list-inside list-disc space-y-0.5 text-dark-600">
                  {data.medications.items.map((s, i) => (
                    <li key={i}>{s.medicationName} ({s.location}): {s.quantity} / {s.minimumStockLevel}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Toate stocurile sunt peste nivelul minim.</p>
            )}
          </AdminDashboardSection>

          <AdminDashboardSection title="Pacienți" href="/admin/patients" icon="👥">
            <p><strong>{data.patients.total}</strong> pacienți înregistrați.</p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Spitalizări" href="/admin/hospitalizations" icon="🏥">
            <p><strong>{data.hospitalizations.activeCount}</strong> internări active (nedescărcate).</p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Imagistică" href="/admin/imaging" icon="🩻">
            <p><strong>{data.imaging.upcomingCount}</strong> programări imagistică în curând.</p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Import analize" href="/admin/lab-import" icon="📋">
            <p>Import rezultate analize din fișiere. Vezi tot pentru încărcare.</p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Rapoarte" href="/admin/reports" icon="📊">
            <p>Rapoarte și statistici. Accesați secțiunea pentru generare.</p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Raportări probleme" href="/admin/problem-reports" icon="📝">
            <p className="mb-2"><strong>{data.problemReports.newCount}</strong> raportări noi.</p>
            {data.problemReports.recent.length > 0 ? (
              <ul className="list-inside list-disc space-y-0.5 text-dark-600">
                {data.problemReports.recent.map((r) => (
                  <li key={r.id}>{r.subject} — <span className="text-dark-500">{r.status}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-dark-500">Niciun raport recent.</p>
            )}
          </AdminDashboardSection>

          <AdminDashboardSection title="Logistică" href="/admin/logistics" icon="📦">
            <ul className="space-y-1">
              <li><strong>{data.logistics.consumablePending}</strong> cereri consumabile în așteptare</li>
              <li><strong>{data.logistics.transportPending}</strong> cereri transport în așteptare</li>
            </ul>
          </AdminDashboardSection>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
