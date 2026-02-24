"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState<string | null>(initialAppointmentId ?? null);

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
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedId(params.get("appointmentId"));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetch("/api/notifications/doctor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markReadByAppointment", appointmentId: selectedId }),
      }).catch(() => {});
    }
  }, [selectedId]);

  const setSelected = useCallback((appointmentId: string) => {
    setSelectedId(appointmentId);
    const url = `${pathname}?appointmentId=${encodeURIComponent(appointmentId)}`;
    window.history.pushState(null, "", url);
  }, [pathname]);

  const selectedAppointment = selectedId ? appointments.find((a) => a.$id === selectedId) : null;
  const appointmentLabel = selectedAppointment
    ? `${formatDateTime(selectedAppointment.schedule).dateTime} – ${selectedAppointment.patientName ?? "Pacient"} – ${formatDoctorDisplayName(selectedAppointment.primaryPhysician)}`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Se încarcă conversațiile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full md:w-80 flex-shrink-0">
        <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
          Conversații cu pacienții
        </h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Alegeți o programare pentru a vedea mesajele.
        </p>
        <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          {appointments.length === 0 ? (
            <li className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
              Nu aveți încă conversații cu mesaje.
            </li>
          ) : (
            appointments.map((apt) => (
              <li key={apt.$id}>
                <button
                  type="button"
                  onClick={() => setSelected(apt.$id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                    selectedId === apt.$id
                      ? "border-teal-500 bg-teal-50 text-slate-800 dark:border-teal-600 dark:bg-teal-900/20 dark:text-slate-100"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium">
                    {formatDateTime(apt.schedule).dateTime}
                  </span>
                  <br />
                  <span className="text-slate-600 dark:text-slate-400">
                    {apt.patientName ?? "Pacient"}
                  </span>
                  {apt.messageCount > 0 && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
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
          <div className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">
              Selectați o programare din listă pentru a vedea mesajele.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
