import { AdminDashboardSection } from "@/components/AdminDashboardSection";
import { getAdminDashboardSnippets } from "@/lib/actions/dashboard.actions";
import { formatDateTime } from "@/lib/utils";

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateTime;
  } catch {
    return iso;
  }
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateOnly;
  } catch {
    return iso;
  }
}

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
          <AdminDashboardSection title="Programări" href="/admin/appointments" icon="🏠">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.appointments.scheduledCount}</strong> confirmate ·{" "}
                <strong>{data.appointments.pendingCount}</strong> în așteptare ·{" "}
                <strong>{data.appointments.cancelledCount}</strong> anulate
              </p>
              {data.appointments.recent.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
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
                      {data.appointments.recent.map((a, i) => (
                        <tr key={i} className="border-b border-dark-100 last:border-0">
                          <td className="px-3 py-2 text-dark-800">{a.patientName}</td>
                          <td className="px-3 py-2 text-dark-600">{fmt(a.schedule)}</td>
                          <td className="px-3 py-2 text-dark-600">{a.primaryPhysician}</td>
                          <td className="px-3 py-2">
                            <span className="rounded px-1.5 py-0.5 text-12-medium bg-dark-100 text-dark-700">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Urgente" href="/admin/emergency" icon="🚨">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.emergency.total}</strong> cazuri în sistem.
              </p>
              {data.emergency.recent.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-200 bg-dark-50 text-left">
                        <th className="px-3 py-2 font-medium text-dark-700">Pacient</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Triage</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Stare</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Sosire</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Motiv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.emergency.recent.map((c) => (
                        <tr key={c.$id} className="border-b border-dark-100 last:border-0">
                          <td className="px-3 py-2 text-dark-800">{c.patientName ?? "—"}</td>
                          <td className="px-3 py-2">
                            <span className="rounded px-1.5 py-0.5 text-12-medium bg-amber-100 text-amber-800">
                              {c.triageLevel}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-dark-600">{c.currentState}</td>
                          <td className="px-3 py-2 text-dark-600">{fmt(c.arrivalTime)}</td>
                          <td className="max-w-[180px] truncate px-3 py-2 text-dark-600" title={c.chiefComplaint}>
                            {c.chiefComplaint}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-dark-500">Niciun caz recent.</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Medicamente" href="/admin/medications" icon="💊">
            <div className="space-y-3">
              {data.medications.lowStockCount > 0 ? (
                <>
                  <p className="text-dark-700">
                    <strong>{data.medications.lowStockCount}</strong> stocuri sub nivelul minim.
                  </p>
                  <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-200 bg-dark-50 text-left">
                          <th className="px-3 py-2 font-medium text-dark-700">Medicament</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Locație</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Cantitate</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Minim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.medications.items.map((s, i) => (
                          <tr key={i} className="border-b border-dark-100 last:border-0">
                            <td className="px-3 py-2 text-dark-800">{s.medicationName}</td>
                            <td className="px-3 py-2 text-dark-600">{s.location}</td>
                            <td className="px-3 py-2 text-dark-600">
                              {s.quantity} {s.unit ? ` ${s.unit}` : ""}
                            </td>
                            <td className="px-3 py-2 text-dark-600">{s.minimumStockLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p>Toate stocurile sunt peste nivelul minim.</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Pacienți" href="/admin/patients" icon="👥">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.patients.total}</strong> pacienți înregistrați.
              </p>
              {data.patients.recent.length > 0 && (
                <ul className="space-y-1.5 rounded-lg border border-dark-200 bg-dark-50/50 px-3 py-2 text-13-regular">
                  {data.patients.recent.map((p, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="text-dark-800 font-medium">{p.name}</span>
                      <span className="text-dark-500 shrink-0">înregistrat {fmtDate(p.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Spitalizări" href="/admin/hospitalizations" icon="🏥">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.hospitalizations.activeCount}</strong> internări active (nedescărcate).
              </p>
              {data.hospitalizations.recent.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-200 bg-dark-50 text-left">
                        <th className="px-3 py-2 font-medium text-dark-700">Pacient</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Cameră</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Secție</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Data internării</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hospitalizations.recent.map((a, i) => (
                        <tr key={i} className="border-b border-dark-100 last:border-0">
                          <td className="px-3 py-2 text-dark-800">{a.patientName}</td>
                          <td className="px-3 py-2 text-dark-600">{a.roomNumber}</td>
                          <td className="px-3 py-2 text-dark-600">{a.department}</td>
                          <td className="px-3 py-2 text-dark-600">{fmtDate(a.admissionDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Imagistică" href="/admin/imaging" icon="🩻">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.imaging.upcomingCount}</strong> programări în curând.
              </p>
              {data.imaging.recent.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-200 bg-dark-50 text-left">
                        <th className="px-3 py-2 font-medium text-dark-700">Pacient</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Modalitate</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Programat</th>
                        <th className="px-3 py-2 font-medium text-dark-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.imaging.recent.map((s, i) => (
                        <tr key={i} className="border-b border-dark-100 last:border-0">
                          <td className="px-3 py-2 text-dark-800">{s.patientName}</td>
                          <td className="px-3 py-2 text-dark-600">{s.modalityName}</td>
                          <td className="px-3 py-2 text-dark-600">{fmt(s.scheduledAt)}</td>
                          <td className="px-3 py-2">
                            <span className="rounded px-1.5 py-0.5 text-12-medium bg-dark-100 text-dark-700">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-dark-500">Nicio programare în curând.</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Import analize" href="/admin/lab-import" icon="📋">
            <p className="text-dark-600">
              Încărcați rezultate analize din fișiere (CSV/Excel). Verificați asistența pacientului și maparea coloanelor înainte de import.
            </p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Rapoarte" href="/admin/reports" icon="📊">
            <p className="text-dark-600">
              Generați rapoarte per perioadă: programări, urgente, imagistică. Export PDF/Excel disponibil în secțiune.
            </p>
          </AdminDashboardSection>

          <AdminDashboardSection title="Raportări probleme" href="/admin/problem-reports" icon="📝">
            <div className="space-y-3">
              <p className="text-dark-700">
                <strong>{data.problemReports.newCount}</strong> raportări noi din{" "}
                <strong>{data.problemReports.total}</strong> total.
              </p>
              {data.problemReports.recent.length > 0 ? (
                <ul className="space-y-2">
                  {data.problemReports.recent.map((r) => (
                    <li key={r.id} className="rounded-lg border border-dark-200 bg-dark-50/50 px-3 py-2 text-13-regular">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-dark-800">{r.subject}</span>
                        <span className="rounded px-1.5 py-0.5 text-12-medium bg-dark-100 text-dark-600">{r.status}</span>
                        <span className="text-dark-500">{fmt(r.createdAt)}</span>
                      </div>
                      {r.descriptionSnippet && (
                        <p className="mt-1 text-dark-600 line-clamp-2">{r.descriptionSnippet}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-dark-500">Niciun raport recent.</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Logistică" href="/admin/logistics" icon="📦">
            <div className="space-y-4">
              <p className="text-dark-700">
                <strong>{data.logistics.consumablePending}</strong> cereri consumabile în așteptare ·{" "}
                <strong>{data.logistics.transportPending}</strong> cereri transport în așteptare
              </p>
              {data.logistics.recentConsumable.length > 0 && (
                <div>
                  <p className="mb-1.5 text-12-semibold uppercase tracking-wide text-dark-500">Cereri consumabile recente</p>
                  <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-200 bg-dark-50 text-left">
                          <th className="px-3 py-2 font-medium text-dark-700">Secție</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Solicitant</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Prioritate</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.logistics.recentConsumable.map((r, i) => (
                          <tr key={i} className="border-b border-dark-100 last:border-0">
                            <td className="px-3 py-2 text-dark-800">{r.department}</td>
                            <td className="px-3 py-2 text-dark-600">{r.requestedBy}</td>
                            <td className="px-3 py-2 text-dark-600">{r.priority}</td>
                            <td className="px-3 py-2 text-dark-600">{fmt(r.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {data.logistics.recentTransport.length > 0 && (
                <div>
                  <p className="mb-1.5 text-12-semibold uppercase tracking-wide text-dark-500">Cereri transport recente</p>
                  <div className="overflow-hidden rounded-lg border border-dark-200 text-13-regular">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-200 bg-dark-50 text-left">
                          <th className="px-3 py-2 font-medium text-dark-700">Pacient</th>
                          <th className="px-3 py-2 font-medium text-dark-700">De la → La</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Tip</th>
                          <th className="px-3 py-2 font-medium text-dark-700">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.logistics.recentTransport.map((r, i) => (
                          <tr key={i} className="border-b border-dark-100 last:border-0">
                            <td className="px-3 py-2 text-dark-800">{r.patientName}</td>
                            <td className="px-3 py-2 text-dark-600">{r.fromLocation} → {r.toLocation}</td>
                            <td className="px-3 py-2 text-dark-600">{r.transportType}</td>
                            <td className="px-3 py-2 text-dark-600">{fmt(r.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </AdminDashboardSection>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
