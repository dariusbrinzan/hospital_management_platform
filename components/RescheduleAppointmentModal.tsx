"use client";

import { useState, useEffect } from "react";
import { rescheduleAppointment } from "@/lib/actions/appointment.actions";
import { SlotSelector } from "./SlotSelector";
import { formatDateTime } from "@/lib/utils";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface RescheduleAppointmentModalProps {
  appointment: {
    $id: string;
    primaryPhysician: string;
    schedule: Date | string;
    reason?: string;
  };
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RescheduleAppointmentModal = ({
  appointment,
  userId,
  onClose,
  onSuccess,
}: RescheduleAppointmentModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentDate = new Date(appointment.schedule);
    setSelectedDate(currentDate);
    setSelectedSlot(currentDate);
  }, [appointment]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Te rugăm să selectezi o dată și un slot");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await rescheduleAppointment(appointment.$id, selectedSlot, userId);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onSuccess?.();
    onClose();
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-20-bold text-dark-700">Reprogramează programarea</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-dark-400 hover:bg-gray-100 hover:text-dark-700 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Informații programare curentă */}
          <div className="rounded-lg border border-dark-200 bg-gray-50 p-4">
            <p className="text-14-medium text-dark-500 mb-2">Programare curentă</p>
            <p className="text-16-semibold text-dark-700">{appointment.primaryPhysician}</p>
            <p className="text-14-regular text-dark-600">
              {formatDateTime(appointment.schedule).dateTime}
            </p>
            {appointment.reason && (
              <p className="text-14-regular text-dark-600 mt-1">
                <span className="font-medium">Motiv:</span> {appointment.reason}
              </p>
            )}
          </div>

          {/* Selectare dată nouă */}
          <div>
            <label className="text-14-medium text-dark-600 mb-2 block">
              Selectează data nouă
            </label>
            <ReactDatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              minDate={minDate}
              dateFormat="dd/MM/yyyy"
              className="w-full rounded-md border border-dark-200 bg-white px-4 py-3 text-[16px] text-dark-700 placeholder:text-dark-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholderText="Selectează data"
              filterDate={(date) => {
                const day = date.getDay();
                return day !== 0 && day !== 6;
              }}
            />
            <p className="mt-1 text-12-regular text-dark-400">
              Programările sunt disponibile de luni până vineri
            </p>
          </div>

          {/* Selectare slot */}
          {selectedDate && (
            <div>
              <label className="text-14-medium text-dark-600 mb-2 block">
                Selectează ora
              </label>
              <SlotSelector
                doctorName={appointment.primaryPhysician}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            </div>
          )}

          {/* Afișare data/oră selectată */}
          {selectedSlot && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-14-medium text-green-700 mb-1">Noua programare:</p>
              <p className="text-16-semibold text-green-800">
                {formatDateTime(selectedSlot).dateTime}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-14-regular text-red-700">{error}</p>
            </div>
          )}

          {/* Butoane */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-dark-200 px-4 py-2 text-14-medium text-dark-600 hover:bg-gray-50 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedSlot}
              className="flex-1 rounded-md bg-green-500 px-4 py-2 text-14-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Se reprogramează..." : "Reprogramează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
