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
          onClick={() => setShowModal(true)}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-12-regular text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <span className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <SmallStar key={s} filled={s <= review.rating} />
            ))}
          </span>
          <span className="ml-1">Evaluat</span>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-3 py-1 text-12-regular text-green-700 hover:bg-green-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Evaluează
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
