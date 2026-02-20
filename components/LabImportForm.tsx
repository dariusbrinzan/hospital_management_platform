"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchPatients } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { parseLabResultsCSV, importLabResults, type LabImportRow } from "@/lib/actions/lab-import.actions";

type PatientOption = { $id: string; name: string; userId?: string };

export function LabImportForm() {
  const router = useRouter();
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [appointments, setAppointments] = useState<{ $id: string; schedule: string; primaryPhysician: string }[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [parsed, setParsed] = useState<{ rows: LabImportRow[]; errors: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!patientQuery.trim()) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPatients(patientQuery.trim()).then((list: any[]) =>
        setPatientResults((list || []).map((p) => ({ $id: p.$id, name: p.name, userId: p.userId })))
      );
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery]);

  useEffect(() => {
    if (!selectedPatient) {
      setAppointments([]);
      setAppointmentId("");
      return;
    }
    const userId = selectedPatient.userId;
    if (!userId) {
      setAppointments([]);
      return;
    }
    getPatientAppointments(userId).then((data: any) => {
      const list = (data?.all || data?.documents || []).slice(0, 50);
      setAppointments(
        list.map((a: any) => ({
          $id: a.$id,
          schedule: a.schedule,
          primaryPhysician: a.primaryPhysician || "",
        }))
      );
      setAppointmentId("");
    }).catch(() => setAppointments([]));
  }, [selectedPatient]);

  const parseCsv = useCallback(async () => {
    if (!csvContent.trim()) {
      setParsed(null);
      return;
    }
    const result = await parseLabResultsCSV(csvContent);
    setParsed(result);
  }, [csvContent]);

  useEffect(() => {
    parseCsv();
  }, [parseCsv]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvContent(String(reader.result ?? ""));
    reader.readAsText(file, "UTF-8");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Selectează un pacient." });
      return;
    }
    if (!parsed || parsed.rows.length === 0) {
      setMessage({ type: "error", text: "Nu există rânduri valide de importat." });
      return;
    }
    setSubmitting(true);
    try {
      const result = await importLabResults({
        patientId: selectedPatient.$id,
        appointmentId: appointmentId || null,
        rows: parsed.rows,
      });
      if (result.imported > 0) {
        setMessage({ type: "success", text: `Au fost importate ${result.imported} rezultate.` });
        setCsvContent("");
        setParsed(null);
        router.refresh();
      }
      if (result.errors.length > 0) {
        setMessage((m) => ({
          type: "error",
          text: [m?.type === "success" ? m.text : "", ...result.errors].filter(Boolean).join(" "),
        }));
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Eroare la import." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-dark-200 bg-white p-6">
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Pacient *</label>
        {selectedPatient ? (
          <div className="flex items-center gap-2 rounded-md border border-dark-200 bg-gray-50 px-3 py-2">
            <span className="text-14-regular text-dark-800">{selectedPatient.name}</span>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="text-14-medium text-red-600 hover:underline"
            >
              Schimbă
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              placeholder="Caută pacient după nume..."
              className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
            />
            {patientResults.length > 0 && (
              <ul className="mt-1 max-h-40 overflow-auto rounded border border-dark-200 bg-white shadow">
                {patientResults.map((p) => (
                  <li key={p.$id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientQuery(p.name);
                        setPatientResults([]);
                      }}
                      className="w-full px-3 py-2 text-left text-14-regular hover:bg-green-50"
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {selectedPatient && appointments.length > 0 && (
        <div>
          <label className="mb-1 block text-14-medium text-dark-700">Programare (opțional)</label>
          <select
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
          >
            <option value="">— Fără programare —</option>
            {appointments.map((a) => (
              <option key={a.$id} value={a.$id}>
                {new Date(a.schedule).toLocaleString("ro-RO")} — {a.primaryPhysician}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Fișier CSV sau lipire text</label>
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="mb-2 block w-full text-sm text-dark-600 file:mr-4 file:rounded file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
        />
        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="Lipește aici conținutul CSV (prima linie = header: testName, testCategory, resultValue, unit, referenceRange, status, notes)"
          rows={6}
          className="w-full rounded-md border border-dark-200 px-3 py-2 font-mono text-sm"
        />
      </div>

      {parsed && (
        <>
          {parsed.errors.length > 0 && (
            <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {parsed.errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
          <div>
            <h3 className="mb-2 text-14-semibold text-dark-800">Previzualizare ({parsed.rows.length} rânduri)</h3>
            <div className="max-h-48 overflow-auto rounded border border-dark-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="border-b p-2">Analiză</th>
                    <th className="border-b p-2">Categorie</th>
                    <th className="border-b p-2">Valoare</th>
                    <th className="border-b p-2">Unitate</th>
                    <th className="border-b p-2">Referință</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b border-dark-100">
                      <td className="p-2">{r.testName}</td>
                      <td className="p-2">{r.testCategory ?? "—"}</td>
                      <td className="p-2">{r.resultValue ?? "—"}</td>
                      <td className="p-2">{r.unit ?? "—"}</td>
                      <td className="p-2">{r.referenceRange ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 20 && (
                <p className="p-2 text-dark-500">... și încă {parsed.rows.length - 20} rânduri</p>
              )}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={submitting || !selectedPatient || !parsed || parsed.rows.length === 0}
        className="shad-primary-btn rounded-lg px-4 py-2 text-14-medium disabled:opacity-50"
      >
        {submitting ? "Se importă..." : "Importă rezultate"}
      </button>
    </form>
  );
}
