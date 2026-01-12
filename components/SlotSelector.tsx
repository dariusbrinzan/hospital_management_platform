"use client";

import { useEffect, useState } from "react";
import { getAvailableSlots } from "@/lib/actions/slots.actions";
import { formatSlotTime } from "@/lib/utils";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SlotSelectorProps {
  doctorName: string;
  selectedDate: Date | null;
  selectedSlot: Date | null;
  onSlotSelect: (slot: Date) => void;
}

export const SlotSelector = ({
  doctorName,
  selectedDate,
  selectedSlot,
  onSlotSelect,
}: SlotSelectorProps) => {
  const [slots, setSlots] = useState<{ time: Date; available: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !doctorName) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const availableSlots = await getAvailableSlots(doctorName, selectedDate);
        // Convertim string-urile înapoi la Date objects
        const slotsWithDates = availableSlots.map((slot: any) => ({
          time: new Date(slot.time),
          available: slot.available,
        }));
        setSlots(slotsWithDates);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [doctorName, selectedDate]);

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

  return (
    <div className="space-y-4">
      <p className="text-14-medium text-dark-700">
        Selectează un slot de 30 de minute:
      </p>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6">
        {slots.map((slot, index) => {
          const slotTime = slot.time instanceof Date ? slot.time : new Date(slot.time);
          const isSelected = selectedSlot && slotTime.getTime() === selectedSlot.getTime();
          
          return (
            <Button
              key={index}
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
          );
        })}
      </div>
      {slots.filter((s) => !s.available).length > 0 && (
        <p className="text-12-regular text-dark-500">
          Slot-urile marcate cu gri sunt deja rezervate
        </p>
      )}
    </div>
  );
};
