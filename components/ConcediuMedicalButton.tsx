"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Doctors } from "@/constants";

const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

export function ConcediuMedicalButton({
  patientId,
  patientName,
  defaultDoctorName,
}: {
  patientId: string;
  patientName: string;
  defaultDoctorName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(toDateOnly(new Date()));
  const [endDate, setEndDate] = useState(toDateOnly(new Date()));
  const [reason, setReason] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [doctorName, setDoctorName] = useState(defaultDoctorName || (Doctors[0]?.name ?? ""));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Completați motivul / diagnosticul.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pdf/medical-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "concediu",
          patientId,
          doctorName,
          date: new Date().toISOString(),
          startDate,
          endDate,
          reason: reason.trim(),
          recommendations: recommendations.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Eroare la generare");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `concediu-medical-${patientName.replace(/\s+/g, "-")}-${toDateOnly(new Date())}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      setReason("");
      setRecommendations("");
    } catch (err: any) {
      toast.error(err?.message || "Eroare la generarea PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-14-medium text-teal-600 hover:text-teal-700"
      >
        🏥 Concediu medical
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Concediu medical</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-700">Medic</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                >
                  {Doctors.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Din data</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Până la data</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-700">Motiv / Diagnostic *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Ex: gripă, afecțiune acută respiratorie..."
                  className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-700">Recomandări (opțional)</label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  rows={2}
                  placeholder="Odihnă, hidratare, control după..."
                  className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shad-gray-btn flex-1 rounded-lg px-4 py-2 text-sm"
                >
                  Anulare
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="shad-primary-btn flex-1 rounded-lg px-4 py-2 text-sm"
                >
                  {loading ? "Se generează..." : "Descarcă PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
