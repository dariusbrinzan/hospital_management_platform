"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppointmentMessagesModal } from "./AppointmentMessagesModal";

type Appointment = {
  $id: string;
  schedule: string;
  primaryPhysician: string;
  patient?: { name: string };
};

export function OpenAppointmentMessagesButton({ appointment }: { appointment: Appointment }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shad-gray-btn text-14-medium"
        onClick={() => setOpen(true)}
      >
        Mesaje
      </Button>
      <AppointmentMessagesModal
        appointment={appointment}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
