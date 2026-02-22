"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentMessageThread } from "./AppointmentMessageThread";
import { formatDateTime, formatDoctorDisplayName } from "@/lib/utils";

type Appointment = {
  $id: string;
  schedule: string;
  primaryPhysician: string;
  patient?: { name: string };
};

export function AppointmentMessagesModal({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const label = `${formatDateTime(appointment.schedule).dateTime} – ${appointment.patient?.name ?? "Pacient"} – ${formatDoctorDisplayName(appointment.primaryPhysician)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Mesaje – programare</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col -mx-2">
          <AppointmentMessageThread
            appointmentId={appointment.$id}
            appointmentLabel={label}
            isPatient={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
