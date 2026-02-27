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
