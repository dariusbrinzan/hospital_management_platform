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
        onClick={() => setShowModal(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-12-medium text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Reprogramează
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
