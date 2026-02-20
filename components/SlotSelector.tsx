"use client";

import { useEffect, useState } from "react";
import { getAvailableSlots } from "@/lib/actions/slots.actions";
import { addToWaitlist, isOnWaitlistForSlot } from "@/lib/actions/waitlist.actions";
import { formatSlotTime } from "@/lib/utils";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SlotSelectorProps {
  doctorName: string;
  selectedDate: Date | null;
  selectedSlot: Date | null;
  onSlotSelect: (slot: Date) => void;
  userId?: string;
  patientId?: string;
}

export const SlotSelector = ({
  doctorName,
  selectedDate,
  selectedSlot,
  onSlotSelect,
  userId,
  patientId,
}: SlotSelectorProps) => {
  const [slots, setSlots] = useState<{ time: Date; available: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistState, setWaitlistState] = useState<Record<number, "idle" | "on_list" | "adding">>({});

  useEffect(() => {
    if (!selectedDate || !doctorName) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setWaitlistState({});
      try {
        const availableSlots = await getAvailableSlots(doctorName, selectedDate);
        const slotsWithDates = availableSlots.map((slot: any) => ({
          time: new Date(slot.time),
          available: slot.available,
        }));
        setSlots(slotsWithDates);
        if (userId && patientId) {
          const state: Record<number, "idle" | "on_list"> = {};
          for (let i = 0; i < slotsWithDates.length; i++) {
            if (!slotsWithDates[i].available) {
              const onList = await isOnWaitlistForSlot(userId, doctorName, slotsWithDates[i].time);
              state[i] = onList ? "on_list" : "idle";
            }
          }
          setWaitlistState(state);
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [doctorName, selectedDate, userId, patientId]);

  const handleNotifyMe = async (slotTime: Date, index: number) => {
    if (!userId || !patientId) return;
    setWaitlistState((prev) => ({ ...prev, [index]: "adding" }));
    try {
      await addToWaitlist({
        userId,
        patientId,
        primaryPhysician: doctorName,
        slotTime,
      });
      setWaitlistState((prev) => ({ ...prev, [index]: "on_list" }));
    } catch {
      setWaitlistState((prev) => ({ ...prev, [index]: "idle" }));
      alert("Nu s-a putut te înscrie pe listă. Încearcă din nou.");
    }
  };

  if (!selectedDate || !doctorName) {
    return (
      <div className="text-14-regular text-dark-500">
        Selectează mai întâi un doctor și o dată
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-14-regular text-dark-500">
        Se încarcă slot-urile disponibile...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-14-regular text-dark-500">
        Nu există slot-uri disponibile pentru această zi. Selectează o altă dată.
      </div>
    );
  }

  const is15MinuteSlots = slots.length > 30;
  const intervalText = is15MinuteSlots ? "15 minute" : "30 minute";
  const canJoinWaitlist = Boolean(userId && patientId);

  return (
    <div className="space-y-4">
      <p className="text-14-medium text-dark-700">
        Selectează un slot de {intervalText}:
      </p>
      <div className={`grid gap-2 ${is15MinuteSlots ? "grid-cols-5 md:grid-cols-6 lg:grid-cols-8" : "grid-cols-4 md:grid-cols-5 lg:grid-cols-6"}`}>
        {slots.map((slot, index) => {
          const slotTime = slot.time instanceof Date ? slot.time : new Date(slot.time);
          const isSelected = selectedSlot && slotTime.getTime() === selectedSlot.getTime();
          const wl = waitlistState[index];

          return (
            <div key={index} className="flex flex-col gap-1">
              <Button
                type="button"
                onClick={() => slot.available && onSlotSelect(slotTime)}
                disabled={!slot.available}
                className={cn(
                  "h-12 text-14-medium",
                  slot.available
                    ? isSelected
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-white text-dark-700 border border-dark-200 hover:bg-green-50 hover:border-green-500"
                    : "bg-dark-100 text-dark-400 cursor-not-allowed border border-dark-200"
                )}
              >
                {formatSlotTime(slotTime)}
              </Button>
              {!slot.available && canJoinWaitlist && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 text-11-regular text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleNotifyMe(slotTime, index)}
                  disabled={wl === "on_list" || wl === "adding"}
                >
                  {wl === "on_list"
                    ? "Ești pe listă"
                    : wl === "adding"
                      ? "Se înscrie..."
                      : "Anunță-mă când se eliberează"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {slots.filter((s) => !s.available).length > 0 && (
        <p className="text-12-regular text-dark-500">
          Slot-urile marcate cu gri sunt deja rezervate. Poți folosi „Anunță-mă când se eliberează” pentru a fi programat automat dacă se eliberează.
        </p>
      )}
    </div>
  );
};
