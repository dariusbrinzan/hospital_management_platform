"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { formatDateTime, formatDoctorDisplayName } from "@/lib/utils";
import { AppointmentMessageThread } from "./AppointmentMessageThread";

type AppointmentItem = {
  $id: string;
  schedule: string;
  primaryPhysician: string;
  status: string;
  reason?: string;
};

export function MessagesView({
  appointments,
  userId,
  initialAppointmentId,
}: {
  appointments: AppointmentItem[];
  userId: string;
  initialAppointmentId?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("appointmentId") || initialAppointmentId;

  const setSelected = useCallback(
    (appointmentId: string) => {
      router.push(`/patients/${userId}/messages?appointmentId=${appointmentId}`);
    },
    [router, userId]
  );

  const selectedAppointment = selectedId ? appointments.find((a) => a.$id === selectedId) : null;
  const appointmentLabel = selectedAppointment
    ? `${formatDateTime(selectedAppointment.schedule).dateTime} – ${formatDoctorDisplayName(selectedAppointment.primaryPhysician)}`
    : "";

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full md:w-80 flex-shrink-0">
        <h2 className="text-16-semibold text-dark-800 dark:text-dark-100 mb-3">Conversații pe programare</h2>
        <p className="text-14-regular text-dark-600 dark:text-dark-400 mb-4">
          Alegeți o programare pentru a vedea mesajele cu medicul.
        </p>
        <ul className="space-y-2">
          {appointments.length === 0 ? (
            <li className="text-14-regular text-dark-500">Nu aveți programări.</li>
          ) : (
            appointments.map((apt) => (
              <li key={apt.$id}>
                <button
                  type="button"
                  onClick={() => setSelected(apt.$id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left text-14-regular transition-colors ${
                    selectedId === apt.$id
                      ? "border-green-500 bg-green-50 text-dark-800 dark:border-green-600 dark:bg-green-900/20 dark:text-dark-100"
                      : "border-dark-200 bg-white hover:bg-dark-50 dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700"
                  }`}
                >
                  <span className="font-medium">{formatDateTime(apt.schedule).dateTime}</span>
                  <br />
                  <span className="text-dark-600 dark:text-dark-400">{formatDoctorDisplayName(apt.primaryPhysician)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="flex-1 min-w-0">
        {selectedId && selectedAppointment ? (
          <AppointmentMessageThread
            appointmentId={selectedId}
            appointmentLabel={appointmentLabel}
            isPatient={true}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dark-200 bg-dark-50 p-8 dark:border-dark-600 dark:bg-dark-800">
            <p className="text-dark-500">Selectați o programare din listă pentru a vedea mesajele.</p>
          </div>
        )}
      </div>
    </div>
  );
}
