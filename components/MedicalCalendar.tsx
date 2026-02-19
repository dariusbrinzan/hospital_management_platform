"use client";

import { useState, useMemo } from "react";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "appointment-scheduled" | "appointment-pending" | "appointment-cancelled" | "vaccination" | "prescription";
  detail?: string;
  doctorName?: string;
}

interface MedicalCalendarProps {
  events: CalendarEvent[];
}

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];

const EVENT_COLORS: Record<CalendarEvent["type"], { bg: string; dot: string; text: string; label: string }> = {
  "appointment-scheduled": { bg: "bg-green-50 border-green-200", dot: "bg-green-500", text: "text-green-700", label: "Programare confirmată" },
  "appointment-pending": { bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500", text: "text-yellow-700", label: "Programare în așteptare" },
  "appointment-cancelled": { bg: "bg-red-50 border-red-200", dot: "bg-red-400", text: "text-red-600", label: "Programare anulată" },
  "vaccination": { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500", text: "text-blue-700", label: "Vaccinare" },
  "prescription": { bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500", text: "text-orange-700", label: "Rețetă expiră" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function toDateKey(d: Date | string): string {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const MedicalCalendar = ({ events }: MedicalCalendarProps) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      const key = toDateKey(e.date);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = toDateKey(today);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(todayKey);
  };

  const selectedEvents = selectedDay ? eventsByDate[selectedDay] || [] : [];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="rounded-md border border-dark-200 p-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-20-bold text-dark-700">
              {MONTHS_RO[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={goToToday}
              className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-12-regular text-green-700 hover:bg-green-100 transition-colors"
            >
              Astăzi
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="rounded-md border border-dark-200 p-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAYS_RO.map((day) => (
            <div key={day} className="py-2 text-center text-12-medium text-dark-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[80px] rounded-md bg-gray-50/50" />;
            }
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDay;

            const uniqueTypes = Array.from(new Set(dayEvents.map((e) => e.type)));

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(dateKey === selectedDay ? null : dateKey)}
                className={`min-h-[80px] rounded-md border p-1.5 text-left transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                    : isToday
                      ? "border-green-300 bg-green-50/50"
                      : dayEvents.length > 0
                        ? "border-dark-200 hover:border-green-300 bg-white"
                        : "border-transparent hover:border-dark-200 bg-white"
                }`}
              >
                <span
                  className={`inline-flex size-7 items-center justify-center rounded-full text-14-medium ${
                    isToday ? "bg-green-500 text-white" : "text-dark-700"
                  }`}
                >
                  {day}
                </span>
                {uniqueTypes.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {uniqueTypes.slice(0, 3).map((type: CalendarEvent["type"]) => (
                      <span
                        key={type}
                        className={`inline-block size-2 rounded-full ${EVENT_COLORS[type].dot}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-dark-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(EVENT_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`inline-block size-2.5 rounded-full ${colors.dot}`} />
              <span className="text-12-regular text-dark-500">{colors.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar: selected day events */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-dark-200 bg-white p-4 sticky top-4">
          {selectedDay ? (
            <>
              <h3 className="text-16-semibold text-dark-700 mb-3">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-14-regular text-dark-400">
                  Nu sunt evenimente în această zi.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => {
                    const colors = EVENT_COLORS[event.type];
                    return (
                      <div
                        key={event.id}
                        className={`rounded-md border p-3 ${colors.bg}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 inline-block size-2 flex-shrink-0 rounded-full ${colors.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-14-medium ${colors.text}`}>
                              {event.title}
                            </p>
                            {event.doctorName && (
                              <p className="text-12-regular text-dark-500 mt-0.5">
                                {event.doctorName}
                              </p>
                            )}
                            {event.detail && (
                              <p className="text-12-regular text-dark-500 mt-0.5">
                                {event.detail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-14-regular text-dark-400">
                Selectează o zi din calendar pentru a vedea detaliile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
