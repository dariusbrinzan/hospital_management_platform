"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getStudiesForEmergencyCase,
  getModalities,
  getImagingSlots,
  createImagingStudy,
} from "@/lib/actions/imaging.actions";
import { formatDateTime } from "@/lib/utils";

type Study = {
  $id: string;
  patientId: string;
  modalityId: string;
  modalityName?: string;
  scheduledAt: string;
  status: string;
  reason?: string | null;
};
type Modality = { $id: string; name: string; slotDurationMinutes: number };
type SlotOption = { time: string; available: boolean };

export function EmergencyImagingSection({
  caseId,
  patientId,
  patientName,
  initialStudies = [],
}: {
  caseId: string;
  patientId: string | null | undefined;
  patientName?: string;
  initialStudies?: Study[];
}) {
  const router = useRouter();
  const [studies, setStudies] = useState<Study[]>(initialStudies);
  const [showModal, setShowModal] = useState(false);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [modalityId, setModalityId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudies = useCallback(() => {
    getStudiesForEmergencyCase(caseId).then((list: any) => setStudies(list || []));
  }, [caseId]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  useEffect(() => {
    if (showModal) {
      getModalities().then(setModalities);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal || !modalityId || !date) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    setLoadingSlots(true);
    getImagingSlots(modalityId, new Date(date + "T12:00:00"))
      .then((list: any) => {
        setSlots(list || []);
        setSelectedSlot("");
      })
      .finally(() => setLoadingSlots(false));
  }, [showModal, modalityId, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patientId) {
      setError("Pacientul trebuie identificat pentru a programa o investigație.");
      return;
    }
    if (!modalityId || !date || !selectedSlot) {
      setError("Alege modalitatea, data și ora.");
      return;
    }
    setSubmitting(true);
    try {
      await createImagingStudy({
        patientId,
        modalityId,
        scheduledAt: selectedSlot,
        sourceType: "emergency",
        sourceId: caseId,
        reason: reason || null,
      });
      loadStudies();
      setShowModal(false);
      setModalityId("");
      setDate("");
      setSelectedSlot("");
      setReason("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Eroare la programare.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = slots.filter((s) => s.available);

  const formatSlot = (iso: string) => {
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  if (patientId == null) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Investigații imagistice</h3>
        <p className="text-dark-600 text-sm">Identifică pacientul pentru a putea programa investigații imagistice din fluxul de urgență.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Investigații imagistice</h3>
        <Button onClick={() => setShowModal(true)} className="shad-primary-btn">
          Programează investigație
        </Button>
      </div>
      {studies.length === 0 ? (
        <p className="text-dark-600 text-sm">Nu există investigații imagistice programate pentru acest caz.</p>
      ) : (
        <ul className="space-y-2">
          {studies.map((s) => (
            <li key={s.$id} className="flex items-center justify-between rounded border border-dark-200 bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium">{s.modalityName || s.modalityId}</span>
              <span className="text-dark-600">
                {s.scheduledAt ? formatDateTime(s.scheduledAt).dateTime : "—"} · {s.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h4 className="text-lg font-semibold mb-2">Programare investigație (urgență)</h4>
              <p className="text-sm text-dark-600 mb-4">Pacient: {patientName || patientId}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Modalitate</label>
                  <select
                    value={modalityId}
                    onChange={(e) => setModalityId(e.target.value)}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  >
                    <option value="">Alege</option>
                    {modalities.map((m) => (
                      <option key={m.$id} value={m.$id}>{m.name} ({m.slotDurationMinutes} min)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Ora</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    disabled={loadingSlots || availableSlots.length === 0}
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  >
                    <option value="">
                      {loadingSlots ? "Se încarcă..." : availableSlots.length === 0 ? "Nu există sloturi" : "Alege ora"}
                    </option>
                    {availableSlots.map((s) => (
                      <option key={s.time} value={s.time}>{formatSlot(s.time)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-700">Motiv (opțional)</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: CT cranian"
                    className="w-full rounded-md border border-dark-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="shad-gray-btn flex-1"
                  >
                    Anulare
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !modalityId || !date || !selectedSlot}
                    className="shad-primary-btn flex-1"
                  >
                    {submitting ? "Se programează..." : "Programează"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
