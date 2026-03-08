"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

interface CheckInAppointmentButtonProps {
  appointment: {
    $id: string;
    primaryPhysician: string;
    schedule: Date | string;
    status: string;
    checkedInAt?: string | Date | null;
  };
}

export function CheckInAppointmentButton({ appointment }: CheckInAppointmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (appointment.status === "cancelled") return null;
  if ((appointment as any).checkedInAt) return null;
  const schedule = typeof appointment.schedule === "string" ? new Date(appointment.schedule) : appointment.schedule;
  if (schedule < new Date()) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${appointment.$id}/check-in`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInData: notes.trim() || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Check-in nereușit.");
        setSubmitting(false);
        return;
      }
      setOpen(false);
      setNotes("");
      window.location.reload();
    } catch {
      setError("Eroare de rețea.");
      setSubmitting(false);
    }
  };

  const scheduleStr = formatDateTime(schedule).dateTime;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => { setOpen(true); setError(""); setNotes(""); }}
        className="border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/40"
      >
        <ClipboardCheck className="size-4 mr-1.5" />
        Check-in
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in digital</DialogTitle>
            <DialogDescription>
              Confirmă prezența la programarea din {scheduleStr} cu {appointment.primaryPhysician}.
              Poți adăuga un motiv actualizat sau simptome (opțional).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="checkin-notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Motiv / simptome actualizate (opțional)
              </label>
              <textarea
                id="checkin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                rows={3}
                placeholder="Ex: dureri de cap persistente, tensiune măsurată acasă..."
                maxLength={1000}
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Anulare
              </Button>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? "Se trimite..." : "Confirm check-in"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
