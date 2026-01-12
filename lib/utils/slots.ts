/**
 * Generează slot-uri de 30 de minute pentru o zi specifică
 * Medici lucrează luni-vineri, 10:00-20:00
 */
export const generateTimeSlots = (date: Date): Date[] => {
  const slots: Date[] = [];
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  
  // Verifică dacă este zi lucrătoare (luni-vineri)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // Nu sunt slot-uri în weekend
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Generează slot-uri de la 10:00 la 19:30 (ultimul slot începe la 19:30 și se termină la 20:00)
  for (let hour = 10; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
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
 * Verifică dacă un slot este aliniat la 30 de minute
 */
export const isSlotAligned = (date: Date): boolean => {
  const minutes = date.getMinutes();
  return minutes === 0 || minutes === 30;
};
