"use client";

import { useState } from "react";
import { RescheduleAppointmentModal } from "./RescheduleAppointmentModal";

interface RescheduleAppointmentButtonProps {
  appointment: {
    $id: string;
    primaryPhysician: string;
    schedule: Date | string;
    reason?: string;
    status: string;
  };
  userId: string;
}

export const RescheduleAppointmentButton = ({
  appointment,
  userId,
}: RescheduleAppointmentButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  if (appointment.status === "cancelled") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-14-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>Reprogramează</span>
      </button>

      {showModal && (
        <RescheduleAppointmentModal
          appointment={appointment}
          userId={userId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
