"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  getReportsData,
  type ReportPeriod,
} from "@/lib/actions/reports.actions";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "7", label: "7 zile" },
  { value: "30", label: "30 zile" },
  { value: "90", label: "90 zile" },
];

export function ReportsDashboard() {
  const [period, setPeriod] = useState<ReportPeriod>("30");
  const [data, setData] = useState<Awaited<ReturnType<typeof getReportsData>> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getReportsData(period);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push("Programări pe zile");
    lines.push("Data,Număr");
    data.appointmentsByDay.forEach((r) => lines.push(`${r.date},${r.count}`));
    lines.push("");
    lines.push("Ocupare medici");
    lines.push("Medic,Număr");
    data.appointmentsByDoctor.forEach((r) => lines.push(`${r.name},${r.count}`));
    lines.push("");
    lines.push("Gărzi și contribuție (350 lei/gardă)");
    lines.push("Medic,Număr gărzi,Sumă (lei)");
    (data.guardPaymentsByDoctor ?? []).forEach((r) => lines.push(`${r.doctorName},${r.guardsCount},${r.amountLei}`));
    lines.push("");
    lines.push("Urgențe pe zile");
    lines.push("Data,Număr");
    data.emergenciesByDay.forEach((r) => lines.push(`${r.date},${r.count}`));
    lines.push("");
    lines.push("Imagistică pe zile");
    lines.push("Data,Număr");
    data.imagingByDay.forEach((r) => lines.push(`${r.date},${r.count}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapoarte-${period}-zile-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.open(`/api/pdf/reports?period=${period}`, "_blank");
  };

  const exportExcel = async () => {
    if (!data) return;
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const sheet1 = XLSX.utils.aoa_to_sheet([
        ["Programări pe zile"],
        ["Data", "Număr"],
        ...data.appointmentsByDay.map((r) => [r.date, r.count]),
      ]);
      XLSX.utils.book_append_sheet(wb, sheet1, "Programări pe zile");
      const sheet2 = XLSX.utils.aoa_to_sheet([
        ["Ocupare medici"],
        ["Medic", "Număr"],
        ...data.appointmentsByDoctor.map((r) => [r.name, r.count]),
      ]);
      XLSX.utils.book_append_sheet(wb, sheet2, "Ocupare medici");
      const sheet3 = XLSX.utils.aoa_to_sheet([
        ["Gărzi și contribuție (350 lei/gardă)"],
        ["Medic", "Nr. gărzi", "Sumă (lei)"],
        ...(data.guardPaymentsByDoctor ?? []).map((r) => [r.doctorName, r.guardsCount, r.amountLei]),
      ]);
      XLSX.utils.book_append_sheet(wb, sheet3, "Gărzi");
      const sheet4 = XLSX.utils.aoa_to_sheet([
        ["Urgențe pe zile"],
        ["Data", "Număr"],
        ...data.emergenciesByDay.map((r) => [r.date, r.count]),
      ]);
      XLSX.utils.book_append_sheet(wb, sheet4, "Urgențe");
      const sheet5 = XLSX.utils.aoa_to_sheet([
        ["Imagistică pe zile"],
        ["Data", "Număr"],
        ...data.imagingByDay.map((r) => [r.date, r.count]),
      ]);
      XLSX.utils.book_append_sheet(wb, sheet5, "Imagistică");
      XLSX.writeFile(wb, `rapoarte-${period}-zile-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error("Export Excel:", e);
      alert("Export Excel nereușit. Asigurați-vă că pachetul xlsx este instalat (npm install xlsx).");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">Se încarcă datele...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Perioadă:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={!data}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={!data}
            className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50 dark:border-green-700 dark:bg-slate-800 dark:text-green-300 dark:hover:bg-green-950/30"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportPDF}
            disabled={!data}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            Export PDF rapoarte
          </button>
          <a
            href={`/api/pdf/appointments?days=${period}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Export PDF programări
          </a>
        </div>
      </div>

      {data && (
        <>
          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Programări pe zile</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.appointmentsByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number | undefined) => [v ?? 0, "Programări"]} />
                  <Bar dataKey="count" fill="#14B8A6" name="Programări" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Ocupare medici</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.appointmentsByDoctor}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number | undefined) => [v ?? 0, "Programări"]} />
                  <Bar dataKey="count" fill="#0D9488" name="Programări" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Contribuție gărzi (plată 350 lei/gardă)
            </h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Număr gărzi efectuate per medic în perioada selectată și suma de plată.
            </p>
            {(data.guardPaymentsByDoctor?.length ?? 0) > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Medic
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Nr. gărzi
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Sumă (lei)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.guardPaymentsByDoctor!.map((r) => (
                      <tr
                        key={r.doctorName}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {r.doctorName}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">
                          {r.guardsCount}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                          {r.amountLei.toLocaleString("ro-RO")} lei
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm font-semibold dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  Total:{" "}
                  {(data.guardPaymentsByDoctor ?? []).reduce((s, r) => s + r.amountLei, 0).toLocaleString("ro-RO")} lei
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nicio gardă înregistrată în perioada selectată.</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Urgențe și imagistică pe zile</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    const days = new Set<string>();
                    data.emergenciesByDay.forEach((r) => days.add(r.date));
                    data.imagingByDay.forEach((r) => days.add(r.date));
                    const sorted = Array.from(days).sort();
                    return sorted.map((date) => ({
                      date,
                      urgențe: data.emergenciesByDay.find((r) => r.date === date)?.count ?? 0,
                      imagistică: data.imagingByDay.find((r) => r.date === date)?.count ?? 0,
                    }));
                  })()}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="urgențe" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="imagistică" stroke="#0891B2" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
