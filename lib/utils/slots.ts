import { Doctors } from "@/constants";

/**
 * Generează slot-uri pentru o zi specifică
 * Medici lucrează luni-vineri, 10:00-20:00; imagistica poate folosi 8-18
 * @param date - Data pentru care se generează slot-urile
 * @param intervalMinutes - Intervalul între slot-uri (15 sau 30 minute). Default: 30
 * @param startHour - Ora de start (0-23). Default: 10
 * @param endHour - Ora de sfârșit (exclusiv, 0-24). Default: 20
 */
export const generateTimeSlots = (
  date: Date,
  intervalMinutes: number = 30,
  startHour: number = 10,
  endHour: number = 20
): Date[] => {
  const slots: Date[] = [];
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

  // Verifică dacă este zi lucrătoare (luni-vineri)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour - 1 && minute + intervalMinutes > 60) {
        break;
      }
      const slot = new Date(year, month, day, hour, minute, 0);
      slots.push(slot);
    }
  }

  return slots;
};

/**
 * Verifică dacă o dată este în viitor și este zi lucrătoare
 */
export const isValidAppointmentDate = (date: Date): boolean => {
  const now = new Date();
  const dayOfWeek = date.getDay();
  
  // Trebuie să fie în viitor
  if (date < now) {
    return false;
  }
  
  // Trebuie să fie zi lucrătoare (luni-vineri)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  return true;
};

/**
 * Formatează un slot pentru afișare
 */
export const formatSlotTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Verifică dacă un slot este aliniat la intervalul specificat
 */
export const isSlotAligned = (date: Date, intervalMinutes: number = 30): boolean => {
  const minutes = date.getMinutes();
  return minutes % intervalMinutes === 0;
};

/**
 * Normalizează un timestamp la începutul slot-ului (15 sau 30 min) pentru un doctor.
 * Folosit pentru matching waitlist. Trebuie în utils pentru a nu fi server action.
 */
export function getNormalizedSlotKey(doctorName: string, date: Date): string {
  const doctor = Doctors.find((d) => d.name === doctorName);
  const intervalMinutes = doctor?.specialty === "Analize medicale" ? 15 : 30;
  const d = new Date(date);
  const minutes = d.getMinutes();
  let normalizedMinutes: number;
  if (intervalMinutes === 15) {
    if (minutes < 15) normalizedMinutes = 0;
    else if (minutes < 30) normalizedMinutes = 15;
    else if (minutes < 45) normalizedMinutes = 30;
    else normalizedMinutes = 45;
  } else {
    normalizedMinutes = minutes < 30 ? 0 : 30;
  }
  const normalized = new Date(d);
  normalized.setMinutes(normalizedMinutes, 0, 0);
  return normalized.toISOString();
}
