"use server";

import { Doctors } from "@/constants";

import { appointmentHelpers, doctorScheduleEventHelpers } from "../db-helpers";
import { generateTimeSlots, parseStringify } from "../utils";

/**
 * Obține slot-urile disponibile pentru un doctor într-o anumită zi
 */
export const getAvailableSlots = async (
  doctorName: string,
  date: Date
): Promise<{ time: Date; available: boolean }[]> => {
  try {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    if (doctorScheduleEventHelpers.hasBlockingEvent(doctorName, dayStart, dayEnd, "appointment")) {
      return [];
    }

    // Verifică dacă doctorul este de analize medicale (folosește sloturi de 15 minute)
    const doctor = Doctors.find((d) => d.name === doctorName);
    const isAnalysisDoctor = doctor?.specialty === "Analize medicale";
    const intervalMinutes = isAnalysisDoctor ? 15 : 30;
    
    // Generează toate slot-urile posibile pentru acea zi
    const allSlots = generateTimeSlots(date, intervalMinutes);
    
    if (allSlots.length === 0) {
      return [];
    }

    // Obține toate programările pentru acel doctor în acea zi
    const appointments = appointmentHelpers.getAll();
    
    const doctorAppointments = appointments.filter((apt: any) => {
      const aptDate = new Date(apt.schedule);
      const aptDateStr = aptDate.toDateString();
      const targetDateStr = date.toDateString();
      
      return (
        apt.primaryPhysician === doctorName &&
        aptDateStr === targetDateStr &&
        apt.status !== "cancelled" // Slot-urile anulate devin disponibile
      );
    });

    // Creează un set cu slot-urile ocupate
    const occupiedSlots = new Set(
      doctorAppointments.map((apt: any) => {
        const aptDate = new Date(apt.schedule);
        // Normalizează la începutul slot-ului (00, 15, 30 sau 45 minute)
        const minutes = aptDate.getMinutes();
        let normalizedMinutes: number;
        
        if (intervalMinutes === 15) {
          // Pentru sloturi de 15 minute: normalizează la 0, 15, 30 sau 45
          if (minutes < 15) normalizedMinutes = 0;
          else if (minutes < 30) normalizedMinutes = 15;
          else if (minutes < 45) normalizedMinutes = 30;
          else normalizedMinutes = 45;
        } else {
          // Pentru sloturi de 30 minute: normalizează la 0 sau 30
          normalizedMinutes = minutes < 30 ? 0 : 30;
        }
        
        const normalizedDate = new Date(aptDate);
        normalizedDate.setMinutes(normalizedMinutes, 0, 0);
        return normalizedDate.getTime();
      })
    );

    // Verifică disponibilitatea fiecărui slot
    const availableSlots = allSlots.map((slot) => {
      const slotTime = slot.getTime();
      const isAvailable = !occupiedSlots.has(slotTime);
      
      return {
        time: slot,
        available: isAvailable,
      };
    });

    return parseStringify(availableSlots);
  } catch (error) {
    console.error("Error getting available slots:", error);
    return [];
  }
};
