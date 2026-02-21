"use client";

import { useState } from "react";
import { cancelAppointmentByPatient } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

interface CancelAppointmentButtonProps {
  appointment: {
    $id: string;
    primaryPhysician: string;
    schedule: Date | string;
    status: string;
  };
  userId: string;
}

const MIN_REASON_LENGTH = 2;
const MAX_REASON_LENGTH = 500;

export const CancelAppointmentButton = ({
  appointment,
  userId,
}: CancelAppointmentButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (appointment.status === "cancelled") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError(`Motivul trebuie să aibă cel puțin ${MIN_REASON_LENGTH} caractere.`);
      return;
    }
    if (trimmed.length > MAX_REASON_LENGTH) {
      setError(`Motivul trebuie să aibă cel mult ${MAX_REASON_LENGTH} de caractere.`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await cancelAppointmentByPatient(appointment.$id, userId, trimmed);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setShowModal(false);
    setReason("");
    window.location.reload();
  };

  const scheduleStr = formatDateTime(
    typeof appointment.schedule === "string"
      ? new Date(appointment.schedule)
      : appointment.schedule
  ).dateTime;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          setError("");
          setReason("");
        }}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-14-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <span>Anulează programarea</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-20-bold text-dark-700">Anulează programarea</h2>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowModal(false)}
                className="rounded-full p-1 text-dark-400 transition-colors hover:bg-gray-100 hover:text-dark-700"
                aria-label="Închide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-14-regular text-dark-600 mb-4">
              Programare: <strong>Dr. {appointment.primaryPhysician}</strong> – {scheduleStr}. Introdu motivul anulării (min. 2 caractere).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cancel-reason" className="mb-1 block text-14-medium text-dark-700">
                  Motivul anulării
                </label>
                <textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Nu mai am nevoie, am o întâlnire în acel interval..."
                  rows={3}
                  maxLength={MAX_REASON_LENGTH}
                  className="w-full rounded-lg border border-dark-200 px-3 py-2 text-14-regular text-dark-700 placeholder:text-dark-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-dark-500">
                  {reason.length}/{MAX_REASON_LENGTH} caractere (min. {MIN_REASON_LENGTH})
                </p>
              </div>

              {error && (
                <p className="text-14-regular text-red-600" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowModal(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-dark-200 bg-white px-4 py-2.5 text-14-medium text-dark-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Renunță
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reason.trim().length < MIN_REASON_LENGTH}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-red-600 px-4 py-2.5 text-14-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? "Se procesează..." : "Anulează programarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
