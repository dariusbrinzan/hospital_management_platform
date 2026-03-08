"use client";

import { useState } from "react";
import { createAppointment, createRecurringAppointments } from "@/lib/actions/appointment.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PatientOption = { patientId: string; patientName: string; userId: string };

export function DoctorCreateAppointmentForm({
  doctorName,
  patients,
}: {
  doctorName: string;
  patients: PatientOption[];
}) {
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState<"weekly" | "monthly">("weekly");
  const [endDate, setEndDate] = useState("");
  const [count, setCount] = useState("6");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!patientId.trim()) {
      setMessage({ type: "error", text: "Selectați un pacient." });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Motivul este obligatoriu." });
      return;
    }
    if (!date) {
      setMessage({ type: "error", text: "Selectați data." });
      return;
    }
    const firstSchedule = new Date(`${date}T${time}`);
    if (Number.isNaN(firstSchedule.getTime())) {
      setMessage({ type: "error", text: "Data sau ora invalidă." });
      return;
    }

    setSubmitting(true);
    try {
      if (isRecurring) {
        const end = endDate ? new Date(endDate).toISOString().slice(0, 10) : undefined;
        const num = count ? parseInt(count, 10) : 12;
        const result = await createRecurringAppointments({
          patientId,
          primaryPhysician: doctorName,
          firstSchedule: firstSchedule.toISOString(),
          reason: reason.trim(),
          note: note.trim() || null,
          interval,
          endDate: end ?? null,
          count: Number.isNaN(num) ? 12 : Math.min(52, Math.max(1, num)),
        });
        if (result.success) {
          setMessage({ type: "success", text: `Au fost create ${result.created} programări recurente.` });
          setPatientId("");
          setDate("");
          setReason("");
          setNote("");
          setEndDate("");
        } else {
          setMessage({ type: "error", text: result.error });
        }
      } else {
        const patient = patients.find((p) => p.patientId === patientId);
        if (!patient) {
          setMessage({ type: "error", text: "Pacient negăsit." });
          setSubmitting(false);
          return;
        }
        await createAppointment({
          userId: patient.userId,
          patient: patientId,
          schedule: firstSchedule,
          status: "pending",
          primaryPhysician: doctorName,
          reason: reason.trim(),
          note: note.trim() || null,
          appointmentType: "in_person",
        });
        setMessage({ type: "success", text: "Programarea a fost creată." });
        setPatientId("");
        setDate("");
        setReason("");
        setNote("");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Eroare la salvare." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="patient">Pacient *</Label>
        <select
          id="patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          required
        >
          <option value="">— Selectați —</option>
          {patients.map((p) => (
            <option key={p.patientId} value={p.patientId}>
              {p.patientName}
            </option>
          ))}
        </select>
        {patients.length === 0 && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Nu există pacienți cu programări la tine. Creează mai întâi programări din fluxul normal (pacientul se programează).
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Data *</Label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Ora</Label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Motiv *</Label>
        <input
          id="reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: Control, Analize de sânge"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          required
        />
      </div>

      <div>
        <Label htmlFor="note">Notă (opțional)</Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="recurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <Label htmlFor="recurring" className="cursor-pointer font-medium">
          Programare recurentă
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <div>
            <Label>Interval</Label>
            <div className="mt-1.5 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="interval"
                  checked={interval === "weekly"}
                  onChange={() => setInterval("weekly")}
                  className="text-teal-600"
                />
                Săptămânal
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="interval"
                  checked={interval === "monthly"}
                  onChange={() => setInterval("monthly")}
                  className="text-teal-600"
                />
                Lunar
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">Până la data (opțional)</Label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <Label htmlFor="count">Număr maxim vizite</Label>
              <input
                id="count"
                type="number"
                min={1}
                max={52}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {message && (
        <p
          className={
            message.type === "success"
              ? "text-sm font-medium text-green-700 dark:text-green-400"
              : "text-sm font-medium text-red-600 dark:text-red-400"
          }
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={submitting || patients.length === 0} className="bg-teal-600 hover:bg-teal-700">
        {submitting ? "Se creează..." : isRecurring ? "Creează programări recurente" : "Creează programare"}
      </Button>
    </form>
  );
}
