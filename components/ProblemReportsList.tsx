"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatDateTime } from "@/lib/utils";
import { updateProblemReportStatus } from "@/lib/actions/report.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
      <p className="text-14-regular text-dark-600 rounded-lg border border-dark-200 bg-white p-6">
        Nu există raportări.
      </p>
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

  return (
    <li className="rounded-lg border border-dark-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-16-medium text-dark-900">{report.subject}</h3>
          <p className="text-14-regular text-dark-600 mt-1">{report.description}</p>
          <p className="text-12-regular text-dark-500 mt-2">
            {report.reporterName} — {report.reporterEmail}
          </p>
          <p className="text-12-regular text-dark-400 mt-1">
            {formatDateTime(report.createdAt)}
          </p>
        </div>
        <span
          className={
            report.status === "resolved"
              ? "text-green-600"
              : report.status === "in_progress"
              ? "text-amber-600"
              : "text-dark-600"
          }
        >
          {STATUS_LABELS[report.status] ?? report.status}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-dark-100 space-y-3">
        <div>
          <label className="text-12-medium text-dark-600 block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full max-w-xs rounded-md border border-dark-200 bg-white px-3 py-2 text-14-regular"
          >
            <option value="new">Nou</option>
            <option value="in_progress">În lucru</option>
            <option value="resolved">Rezolvat</option>
          </select>
        </div>
        <div>
          <label className="text-12-medium text-dark-600 block mb-1">Note administrator</label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Note interne..."
            rows={2}
            className="w-full resize-y"
          />
        </div>
        {error && <p className="text-14-regular text-red-600">{error}</p>}
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="shad-primary-btn"
        >
          {loading ? "Se salvează…" : "Salvează"}
        </Button>
      </div>
    </li>
  );
}
