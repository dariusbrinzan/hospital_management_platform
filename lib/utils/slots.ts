/**
 * Generează slot-uri pentru o zi specifică
 * Medici lucrează luni-vineri, 10:00-20:00
 * @param date - Data pentru care se generează slot-urile
 * @param intervalMinutes - Intervalul între slot-uri (15 sau 30 minute). Default: 30
 */
export const generateTimeSlots = (date: Date, intervalMinutes: number = 30): Date[] => {
  const slots: Date[] = [];
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  
  // Verifică dacă este zi lucrătoare (luni-vineri)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // Nu sunt slot-uri în weekend
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Generează slot-uri de la 10:00 la 20:00 (exclusiv)
  // Pentru 30 minute: ultimul slot începe la 19:30
  // Pentru 15 minute: ultimul slot începe la 19:45
  for (let hour = 10; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      // Nu adăugăm slot-uri care depășesc 20:00
      if (hour === 19 && minute + intervalMinutes > 60) {
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
