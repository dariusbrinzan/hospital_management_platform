"use client";

import { useState } from "react";
import { Doctors } from "@/constants";

export function MedicalLetterButton({
  patientId,
  patientName,
  defaultDoctorName,
}: {
  patientId: string;
  patientName: string;
  defaultDoctorName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Scrisoare medicală");
  const [content, setContent] = useState("");
  const [doctorName, setDoctorName] = useState(defaultDoctorName || (Doctors[0]?.name ?? ""));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/pdf/medical-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorName,
          date: new Date().toISOString(),
          title: title || "Scrisoare medicală",
          content: content || "Conținut scrisoare.",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scrisoare-${patientName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      setContent("");
    } catch (err) {
      alert("Eroare la generarea PDF.");
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
        📄 Scrisoare medicală
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Generează scrisoare medicală</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-700">Titlu</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                />
              </div>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-700">Conținut</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Textul scrisorii medicale..."
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
