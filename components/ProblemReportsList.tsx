"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatDateTime } from "@/lib/utils";
import { updateProblemReportStatus } from "@/lib/actions/report.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Report = {
  id: string;
  userId: string | null;
  reporterName: string;
  reporterEmail: string;
  subject: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nou",
  in_progress: "În lucru",
  resolved: "Rezolvat",
};

export function ProblemReportsList({ reports }: { reports: Report[] }) {
  const router = useRouter();

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">Nu există raportări.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} onUpdate={() => router.refresh()} />
      ))}
    </ul>
  );
}

function ReportCard({ report, onUpdate }: { report: Report; onUpdate: () => void }) {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    const result = await updateProblemReportStatus(report.id, status, adminNotes.trim() || null);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onUpdate();
  };

  const statusColor =
    report.status === "resolved"
      ? "text-emerald-600 dark:text-emerald-400"
      : report.status === "in_progress"
        ? "text-amber-600 dark:text-amber-400"
        : "text-slate-600 dark:text-slate-400";

  return (
    <li>
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{report.subject}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{report.description}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {report.reporterName} — {report.reporterEmail}
              </p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {formatDateTime(report.createdAt).dateTime}
              </p>
            </div>
            <span className={`shrink-0 text-sm font-medium ${statusColor}`}>
              {STATUS_LABELS[report.status] ?? report.status}
            </span>
          </div>
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="new">Nou</option>
                <option value="in_progress">În lucru</option>
                <option value="resolved">Rezolvat</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Note administrator</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Note interne..."
                rows={2}
                className="min-h-[80px] w-full resize-y rounded-lg border-slate-300 dark:border-slate-600"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-teal-600 hover:bg-teal-700"
            >
              {loading ? "Se salvează…" : "Salvează"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
