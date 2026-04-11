import {
  Calendar,
  AlertCircle,
  Users,
  BarChart3,
  Banknote,
  Pill,
  Building2,
  ScanSearch,
  FileDown,
  FileWarning,
  Package,
} from "lucide-react";

import { AdminDashboardSection } from "@/components/AdminDashboardSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardSnippets } from "@/lib/actions/dashboard.actions";
import { formatDateTime } from "@/lib/utils";

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateTime;
  } catch {
    return String(iso);
  }
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDateTime(iso).dateOnly;
  } catch {
    return String(iso);
  }
}

function fmtCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
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

const AdminPage = async () => {
  const data = await getAdminDashboardSnippets();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
              Panou Administrator
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Rezumat rapid din fiecare secțiune. Folosiți linkurile „Vezi tot” pentru detalii.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {data.appointments.scheduledCount + data.appointments.pendingCount + data.appointments.cancelledCount}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Programări</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              <AlertCircle className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{data.emergency.total}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgențe</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{data.patients.total}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pacienți</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400">
              <BarChart3 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{data.problemReports.total}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Raportări</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Banknote className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{fmtCurrency(data.finance.balance)}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sold 30 zile</p>
            </div>
          </CardContent>
        </Card>
      </div>
          </CardContent>
        </Card>

        <AdminDashboardSection title="Programări" href="/admin/appointments" icon={<Calendar className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.appointments.scheduledCount}</strong>{" "}
              confirmate ·{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.appointments.pendingCount}</strong>{" "}
              în așteptare ·{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.appointments.cancelledCount}</strong>{" "}
              anulate
            </p>
            {data.appointments.recent.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
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
                    {data.appointments.recent.map((a, i) => (
                      <tr key={`apt-${i}-${a.patientName}-${a.schedule}`}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{a.patientName}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmt(a.schedule)}</td>
                        <td className={tableCell + " " + tableCellMuted}>{a.primaryPhysician}</td>
                        <td className={tableCell}>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Nicio programare recentă.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Urgențe" href="/admin/emergency" icon={<AlertCircle className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.emergency.total}</strong> cazuri în sistem.
            </p>
            {data.emergency.recent.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className={tableBase}>
                  <thead>
                    <tr className={tableHeadRow}>
                      <th className={tableHeadCell}>Pacient</th>
                      <th className={tableHeadCell}>Triaj</th>
                      <th className={tableHeadCell}>Stare</th>
                      <th className={tableHeadCell}>Sosire</th>
                      <th className={tableHeadCell}>Motiv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.emergency.recent.map((c) => (
                      <tr key={c.$id}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{c.patientName ?? "—"}</td>
                        <td className={tableCell}>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            {c.triageLevel}
                          </span>
                        </td>
                        <td className={tableCell + " " + tableCellMuted}>{c.currentState}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmt(c.arrivalTime)}</td>
                        <td className={tableCell + " max-w-[180px] truncate " + tableCellMuted} title={c.chiefComplaint}>
                          {c.chiefComplaint}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Niciun caz recent.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Medicamente" href="/admin/medications" icon={<Pill className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            {data.medications.lowStockCount > 0 ? (
              <>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.medications.lowStockCount}</strong>{" "}
                  stocuri sub nivelul minim.
                </p>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className={tableBase}>
                    <thead>
                      <tr className={tableHeadRow}>
                        <th className={tableHeadCell}>Medicament</th>
                        <th className={tableHeadCell}>Locație</th>
                        <th className={tableHeadCell}>Cantitate</th>
                        <th className={tableHeadCell}>Minim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.medications.items.map((s, i) => (
                        <tr key={`med-${i}-${s.medicationName}-${s.location}`}>
                          <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{s.medicationName}</td>
                          <td className={tableCell + " " + tableCellMuted}>{s.location}</td>
                          <td className={tableCell + " " + tableCellMuted}>
                            {s.quantity}
                            {s.unit ? ` ${s.unit}` : ""}
                          </td>
                          <td className={tableCell + " " + tableCellMuted}>{s.minimumStockLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Toate stocurile sunt peste nivelul minim.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Pacienți" href="/admin/patients" icon={<Users className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.patients.total}</strong> pacienți înregistrați.
            </p>
            {data.patients.recent.length > 0 ? (
              <ul className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/30">
                {data.patients.recent.map((p, i) => (
                  <li
                    key={`patient-${i}-${p.name}-${p.createdAt}`}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                    <span className={tableCellMuted + " shrink-0"}>înregistrat {fmtDate(p.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Niciun pacient recent.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Spitalizări" href="/admin/hospitalizations" icon={<Building2 className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.hospitalizations.activeCount}</strong>{" "}
              internări active (nedescărcate).
            </p>
            {data.hospitalizations.recent.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className={tableBase}>
                  <thead>
                    <tr className={tableHeadRow}>
                      <th className={tableHeadCell}>Pacient</th>
                      <th className={tableHeadCell}>Cameră</th>
                      <th className={tableHeadCell}>Secție</th>
                      <th className={tableHeadCell}>Data internării</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hospitalizations.recent.map((a, i) => (
                      <tr key={`hosp-${i}-${a.patientName}-${a.admissionDate}`}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{a.patientName}</td>
                        <td className={tableCell + " " + tableCellMuted}>{a.roomNumber}</td>
                        <td className={tableCell + " " + tableCellMuted}>{a.department}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmtDate(a.admissionDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Nicio internare recentă.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Imagistică" href="/admin/imaging" icon={<ScanSearch className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.imaging.upcomingCount}</strong>{" "}
              programări în curând.
            </p>
            {data.imaging.recent.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className={tableBase}>
                  <thead>
                    <tr className={tableHeadRow}>
                      <th className={tableHeadCell}>Pacient</th>
                      <th className={tableHeadCell}>Modalitate</th>
                      <th className={tableHeadCell}>Programat</th>
                      <th className={tableHeadCell}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.imaging.recent.map((s, i) => (
                      <tr key={`img-${i}-${s.patientName}-${s.scheduledAt}`}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{s.patientName}</td>
                        <td className={tableCell + " " + tableCellMuted}>{s.modalityName}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmt(s.scheduledAt)}</td>
                        <td className={tableCell}>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Nicio programare în curând.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Financiar" href="/admin/finance" icon={<Banknote className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{fmtCurrency(data.finance.revenue)}</strong>{" "}
              venituri ·{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{fmtCurrency(data.finance.expense)}</strong>{" "}
              cheltuieli ·{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.finance.pendingCount}</strong>{" "}
              în așteptare
            </p>
            {data.finance.recent.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className={tableBase}>
                  <thead>
                    <tr className={tableHeadRow}>
                      <th className={tableHeadCell}>Operațiune</th>
                      <th className={tableHeadCell}>Tip</th>
                      <th className={tableHeadCell}>Sumă</th>
                      <th className={tableHeadCell}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.finance.recent.map((t, i) => (
                      <tr key={`finance-${i}-${t.description}-${t.occurredAt}`}>
                        <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{t.description}</td>
                        <td className={tableCell + " " + tableCellMuted}>{t.transactionType}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmtCurrency(t.amount)}</td>
                        <td className={tableCell + " " + tableCellMuted}>{fmt(t.occurredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Nu există încă tranzacții financiare.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Import analize" href="/admin/lab-import" icon={<FileDown className="size-5 shrink-0 opacity-80" />}>
          <p className="text-slate-600 dark:text-slate-400">
            Încărcați rezultate analize din fișiere (CSV/Excel). Verificați asistența pacientului și maparea coloanelor înainte de import.
          </p>
        </AdminDashboardSection>

        <AdminDashboardSection title="Rapoarte" href="/admin/reports" icon={<BarChart3 className="size-5 shrink-0 opacity-80" />}>
          <p className="text-slate-600 dark:text-slate-400">
            Generați rapoarte per perioadă: programări, urgente, imagistică. Export PDF/Excel disponibil în secțiune.
          </p>
        </AdminDashboardSection>

        <AdminDashboardSection title="Raportări probleme" href="/admin/problem-reports" icon={<FileWarning className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.problemReports.newCount}</strong>{" "}
              raportări noi din{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.problemReports.total}</strong> total.
            </p>
            {data.problemReports.recent.length > 0 ? (
              <ul className="space-y-2">
                {data.problemReports.recent.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{r.subject}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {r.status}
                      </span>
                      <span className={tableCellMuted + " text-xs"}>{fmt(r.createdAt)}</span>
                    </div>
                    {r.descriptionSnippet && (
                      <p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-400">{r.descriptionSnippet}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Niciun raport recent.</p>
            )}
          </div>
        </AdminDashboardSection>

        <AdminDashboardSection title="Logistică" href="/admin/logistics" icon={<Package className="size-5 shrink-0 opacity-80" />}>
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.logistics.consumablePending}</strong>{" "}
              cereri consumabile în așteptare ·{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{data.logistics.transportPending}</strong>{" "}
              cereri transport în așteptare
            </p>
            {data.logistics.recentConsumable.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Cereri consumabile recente
                </p>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className={tableBase}>
                    <thead>
                      <tr className={tableHeadRow}>
                        <th className={tableHeadCell}>Secție</th>
                        <th className={tableHeadCell}>Solicitant</th>
                        <th className={tableHeadCell}>Prioritate</th>
                        <th className={tableHeadCell}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logistics.recentConsumable.map((r, i) => (
                        <tr key={`cons-${i}-${r.department}-${r.createdAt}`}>
                          <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{r.department}</td>
                          <td className={tableCell + " " + tableCellMuted}>{r.requestedBy}</td>
                          <td className={tableCell + " " + tableCellMuted}>{r.priority}</td>
                          <td className={tableCell + " " + tableCellMuted}>{fmt(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {data.logistics.recentTransport.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Cereri transport recente
                </p>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className={tableBase}>
                    <thead>
                      <tr className={tableHeadRow}>
                        <th className={tableHeadCell}>Pacient</th>
                        <th className={tableHeadCell}>De la → La</th>
                        <th className={tableHeadCell}>Tip</th>
                        <th className={tableHeadCell}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logistics.recentTransport.map((r, i) => (
                        <tr key={`trans-${i}-${r.patientName}-${r.createdAt}`}>
                          <td className={tableCell + " font-medium text-slate-900 dark:text-slate-100"}>{r.patientName}</td>
                          <td className={tableCell + " " + tableCellMuted}>
                            {r.fromLocation} → {r.toLocation}
                          </td>
                          <td className={tableCell + " " + tableCellMuted}>{r.transportType}</td>
                          <td className={tableCell + " " + tableCellMuted}>{fmt(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </AdminDashboardSection>
      </section>
    </div>
  );
};

export default AdminPage;
