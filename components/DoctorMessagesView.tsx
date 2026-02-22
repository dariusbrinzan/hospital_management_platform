"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDateTime, formatDoctorDisplayName } from "@/lib/utils";
import { AppointmentMessageThread } from "./AppointmentMessageThread";

type AppointmentItem = {
  $id: string;
  schedule: string;
  primaryPhysician: string;
  status: string;
  reason?: string;
  patientName?: string;
  messageCount: number;
};

export function DoctorMessagesView({
  initialAppointmentId,
}: {
  initialAppointmentId?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("appointmentId") || initialAppointmentId;

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments/doctor/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetch("/api/notifications/doctor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markReadByAppointment", appointmentId: selectedId }),
      }).catch(() => {});
    }
  }, [selectedId]);

  const setSelected = useCallback(
    (appointmentId: string) => {
      router.push(`/doctor/messages?appointmentId=${appointmentId}`);
    },
    [router]
  );

  const selectedAppointment = selectedId ? appointments.find((a) => a.$id === selectedId) : null;
  const appointmentLabel = selectedAppointment
    ? `${formatDateTime(selectedAppointment.schedule).dateTime} – ${selectedAppointment.patientName ?? "Pacient"} – ${formatDoctorDisplayName(selectedAppointment.primaryPhysician)}`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dark-200 bg-white p-12">
        <p className="text-dark-500">Se încarcă conversațiile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full md:w-80 flex-shrink-0">
        <h2 className="text-16-semibold text-dark-800 dark:text-dark-100 mb-3">
          Conversații cu pacienții
        </h2>
        <p className="text-14-regular text-dark-600 dark:text-dark-400 mb-4">
          Alegeți o programare pentru a vedea mesajele.
        </p>
        <ul className="space-y-2">
          {appointments.length === 0 ? (
            <li className="text-14-regular text-dark-500">
              Nu aveți încă conversații cu mesaje.
            </li>
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
                  <span className="font-medium">
                    {formatDateTime(apt.schedule).dateTime}
                  </span>
                  <br />
                  <span className="text-dark-600 dark:text-dark-400">
                    {apt.patientName ?? "Pacient"}
                  </span>
                  {apt.messageCount > 0 && (
                    <span className="ml-2 text-12-regular text-dark-500">
                      ({apt.messageCount} mesaje)
                    </span>
                  )}
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
            isPatient={false}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dark-200 bg-white p-8 dark:border-dark-600 dark:bg-dark-800">
            <p className="text-dark-500">
              Selectați o programare din listă pentru a vedea mesajele.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
