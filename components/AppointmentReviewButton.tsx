"use client";

import { useState } from "react";
import { DoctorReviewModal } from "./DoctorReviewModal";

interface AppointmentReviewButtonProps {
  appointmentId: string;
  doctorName: string;
  existingReview?: {
    rating: number;
    comment?: string | null;
    createdAt: Date | string;
  } | null;
}

const SmallStar = ({ filled }: { filled: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? "#f59e0b" : "none"}
    stroke={filled ? "#f59e0b" : "#9ca3af"}
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const AppointmentReviewButton = ({
  appointmentId,
  doctorName,
  existingReview,
}: AppointmentReviewButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState(existingReview);

  return (
    <>
      {review ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-14-medium text-amber-700 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <span className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <SmallStar key={s} filled={s <= review.rating} />
            ))}
          </span>
          <span>Evaluat</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-14-medium text-green-700 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Evaluează</span>
        </button>
      )}

      {showModal && (
        <DoctorReviewModal
          appointmentId={appointmentId}
          doctorName={doctorName}
          existingReview={review}
          onClose={() => setShowModal(false)}
          onSubmitted={() => {
            setReview(null);
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
