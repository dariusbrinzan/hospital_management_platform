"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/review.actions";

interface DoctorReviewModalProps {
  appointmentId: string;
  doctorName: string;
  existingReview?: {
    rating: number;
    comment?: string | null;
    createdAt: Date | string;
  } | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

const StarIcon = ({
  filled,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  readonly,
}: {
  filled: boolean;
  hovered: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  readonly?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    disabled={readonly}
    className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled || hovered ? "#f59e0b" : "none"}
      stroke={filled || hovered ? "#f59e0b" : "#9ca3af"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
);

export const DoctorReviewModal = ({
  appointmentId,
  doctorName,
  existingReview,
  onClose,
  onSubmitted,
}: DoctorReviewModalProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isReadonly = !!existingReview;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Te rugăm să selectezi un rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await submitReview(appointmentId, rating, comment);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onSubmitted?.();
    onClose();
  };

  const ratingLabels = ["", "Nesatisfăcător", "Acceptabil", "Bun", "Foarte bun", "Excelent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-20-bold text-dark-700">
            {isReadonly ? "Evaluare" : "Evaluează doctorul"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-dark-400 hover:bg-gray-100 hover:text-dark-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-16-semibold text-dark-600 mb-4">{doctorName}</p>

        <div className="mb-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= rating}
              hovered={!isReadonly && star <= hoveredStar}
              onClick={isReadonly ? undefined : () => setRating(star)}
              onMouseEnter={isReadonly ? undefined : () => setHoveredStar(star)}
              onMouseLeave={isReadonly ? undefined : () => setHoveredStar(0)}
              readonly={isReadonly}
            />
          ))}
        </div>

        {(rating > 0 || hoveredStar > 0) && (
          <p className="mb-4 text-center text-14-medium text-amber-600">
            {ratingLabels[hoveredStar || rating]}
          </p>
        )}

        <div className="mb-4">
          <label className="text-14-medium text-dark-600 mb-1 block">
            Comentariu {!isReadonly && <span className="text-dark-400">(opțional)</span>}
          </label>
          {isReadonly ? (
            <p className="rounded-md border border-dark-200 bg-gray-50 p-3 text-14-regular text-dark-600">
              {existingReview?.comment || "Fără comentariu"}
            </p>
          ) : (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrie un comentariu despre experiența ta..."
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-dark-200 bg-white px-3 py-2 text-14-regular text-dark-700 placeholder:text-dark-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          )}
        </div>

        {error && (
          <p className="mb-4 text-center text-14-regular text-red-500">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-dark-200 px-4 py-2 text-14-medium text-dark-600 hover:bg-gray-50"
          >
            {isReadonly ? "Închide" : "Anulează"}
          </button>
          {!isReadonly && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 rounded-md bg-green-500 px-4 py-2 text-14-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Se trimite..." : "Trimite evaluarea"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
