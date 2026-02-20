"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchPatients } from "@/lib/actions/patient.actions";
import {
  getModalities,
  getImagingSlots,
  createImagingStudy,
} from "@/lib/actions/imaging.actions";
import { formatDateTime } from "@/lib/utils";

type Modality = { $id: string; name: string; slotDurationMinutes: number };
type SlotOption = { time: string; available: boolean };
type PatientOption = { $id: string; name: string };

export function ImagingBookingForm({
  modalities: initialModalities,
  onSuccess,
}: {
  modalities: Modality[];
  initialPatient?: { $id: string; name: string };
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [modalities, setModalities] = useState<Modality[]>(initialModalities);
  const [patientQuery, setPatientQuery] = useState(initialPatient?.name ?? "");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(
    initialPatient ? { $id: initialPatient.$id, name: initialPatient.name } : null
  );
  const [modalityId, setModalityId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModalities().then(setModalities);
  }, []);

  useEffect(() => {
    if (!patientQuery.trim()) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPatients(patientQuery.trim()).then((list: any[]) =>
        setPatientResults(list.map((p) => ({ $id: p.$id, name: p.name })))
      );
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery]);

  const loadSlots = useCallback(async () => {
    if (!modalityId || !date) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    setLoadingSlots(true);
    try {
      const d = new Date(date + "T12:00:00");
      const list = await getImagingSlots(modalityId, d);
      setSlots(list || []);
      setSelectedSlot("");
    } finally {
      setLoadingSlots(false);
    }
  }, [modalityId, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedPatient || !modalityId || !date || !selectedSlot) {
      setError("Completează pacientul, modalitatea, data și ora.");
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${selectedSlot}`).toISOString();
      await createImagingStudy({
        patientId: selectedPatient.$id,
        modalityId,
        scheduledAt,
        sourceType: "direct",
        reason: reason || null,
      });
      setSelectedPatient(null);
      setPatientQuery("");
      setModalityId("");
      setDate("");
      setSelectedSlot("");
      setReason("");
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Eroare la programare.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = slots.filter((s) => s.available);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-dark-200 bg-white p-6">
      <h3 className="text-18-semibold text-dark-900">Programare nouă</h3>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-14-regular text-red-700">{error}</p>
      )}

      {/* Pacient */}
      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Pacient</label>
        {selectedPatient ? (
          <div className="flex items-center gap-2 rounded-md border border-dark-200 bg-gray-50 px-3 py-2">
            <span className="text-14-regular text-dark-800">{selectedPatient.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedPatient(null);
                setPatientQuery("");
              }}
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
              placeholder="Caută nume, email, telefon..."
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

      {/* Modalitate */}
      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Modalitate</label>
        <select
          value={modalityId}
          onChange={(e) => setModalityId(e.target.value)}
          className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
        >
          <option value="">Alege modalitatea</option>
          {modalities.map((m) => (
            <option key={m.$id} value={m.$id}>
              {m.name} ({m.slotDurationMinutes} min)
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
        />
      </div>

      {/* Ora (slot) */}
      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Ora</label>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          disabled={loadingSlots || availableSlots.length === 0}
          className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
        >
          <option value="">
            {loadingSlots ? "Se încarcă..." : availableSlots.length === 0 ? "Nu există sloturi" : "Alege ora"}
          </option>
          {availableSlots.map((s) => (
            <option key={s.time} value={s.time}>
              {formatSlot(s.time)}
            </option>
          ))}
        </select>
      </div>

      {/* Motiv (opțional) */}
      <div>
        <label className="mb-1 block text-14-medium text-dark-700">Motiv (opțional)</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: control post-operatoriu"
          className="w-full rounded-md border border-dark-200 px-3 py-2 text-14-regular"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !selectedPatient || !modalityId || !date || !selectedSlot}
        className="shad-primary-btn px-4 py-2 rounded-lg text-14-medium disabled:opacity-50"
      >
        {submitting ? "Se programează..." : "Programează"}
      </button>
    </form>
  );
}

function formatSlot(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime);
    if (isNaN(d.getTime())) return isoOrTime;
    return d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoOrTime;
  }
}
