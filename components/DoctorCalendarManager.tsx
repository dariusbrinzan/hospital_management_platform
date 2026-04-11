"use client";

import { CalendarDays, Plane, ShieldAlert, Stethoscope, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctors } from "@/constants";

type DoctorCalendarEvent = {
  $id: string;
  doctorName: string;
  eventType: "vacation" | "medical_leave" | "time_off" | "guard";
  startDate: string;
  endDate: string;
  notes?: string | null;
  affectsAppointments: boolean;
  affectsDuty: boolean;
  source: "schedule_event" | "duty";
  readOnly: boolean;
  title: string;
};

const EVENT_META: Record<
  DoctorCalendarEvent["eventType"],
  { label: string; dot: string; badge: string; description: string }
> = {
  vacation: {
    label: "Concediu",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    description: "Blochează programările și exclude medicul din gărzi.",
  },
  medical_leave: {
    label: "Concediu medical",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
    description: "Medicul este indisponibil complet în intervalul ales.",
  },
  time_off: {
    label: "Indisponibilitate",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    description: "Indisponibilitate temporară pentru programări și gărzi.",
  },
  guard: {
    label: "Gardă",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    description: "Eveniment informativ derivat din rotația de gărzi.",
  },
};

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

function toDateKey(value: Date | string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function expandEventDates(event: DoctorCalendarEvent) {
  const dates: string[] = [];
  const cursor = new Date(event.startDate);
  cursor.setHours(0, 0, 0, 0);
  const endTime = new Date(event.endDate).setHours(0, 0, 0, 0);

  while (cursor.getTime() <= endTime) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function DoctorCalendarManager() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(toDateKey(today));
  const [events, setEvents] = useState<DoctorCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    doctorName: "",
    eventType: "vacation" as DoctorCalendarEvent["eventType"],
    startDate: toDateKey(today),
    endDate: toDateKey(today),
    notes: "",
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/doctor-calendar");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Eroare la încărcarea calendarului.");
      }
      setEvents(data);
    } catch (error: any) {
      toast.error(error?.message || "Eroare la încărcarea calendarului medicilor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, DoctorCalendarEvent[]> = {};
    events.forEach((event) => {
      expandEventDates(event).forEach((dateKey) => {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
      });
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDay ? eventsByDate[selectedDay] || [] : [];
  const doctorSummary = useMemo(() => {
    return Doctors.map((doctor) => ({
      name: doctor.name,
      specialty: doctor.specialty,
      blockingEvents: events.filter(
        (event) =>
          event.doctorName === doctor.name &&
          event.source === "schedule_event" &&
          (event.eventType === "vacation" || event.eventType === "medical_leave" || event.eventType === "time_off")
      ).length,
    }));
  }, [events]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = toDateKey(today);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const submitEvent = async () => {
    if (!form.doctorName || !form.startDate || !form.endDate) {
      toast.warning("Completează medicul și intervalul de timp.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.warning("Data de sfârșit trebuie să fie după data de început.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/doctor-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva evenimentul.");
      }
      toast.success("Evenimentul a fost salvat.");
      setForm((prev) => ({ ...prev, notes: "" }));
      await loadEvents();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la salvarea evenimentului.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/doctor-calendar/${eventId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut șterge evenimentul.");
      }
      toast.success("Evenimentul a fost șters.");
      await loadEvents();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la ștergerea evenimentului.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <CalendarDays className="size-5" />
              <p className="text-sm font-medium">Calendar Medici</p>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Disponibilitate, concedii și gărzi
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Evenimentele de concediu, concediu medical și indisponibilitate blochează automat programările și exclud medicul din rotația gărzilor.
            </p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Concedii / indisponibilități</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {events.filter((e) => e.source === "schedule_event").length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gărzi în calendar</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {events.filter((e) => e.eventType === "guard").length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Medic</label>
                <Select value={form.doctorName} onValueChange={(value) => setForm((prev) => ({ ...prev, doctorName: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează medicul" />
                  </SelectTrigger>
                  <SelectContent>
                    {Doctors.map((doctor) => (
                      <SelectItem key={doctor.name} value={doctor.name}>
                        {doctor.name} · {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tip eveniment</label>
                <Select
                  value={form.eventType}
                  onValueChange={(value: DoctorCalendarEvent["eventType"]) =>
                    setForm((prev) => ({ ...prev, eventType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Concediu</SelectItem>
                    <SelectItem value="medical_leave">Concediu medical</SelectItem>
                    <SelectItem value="time_off">Indisponibilitate</SelectItem>
                    <SelectItem value="guard">Gardă informativă</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Data început</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Data sfârșit</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Observații</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Ex: concediu anual, recuperare post-operatorie, indisponibilitate temporară."
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {EVENT_META[form.eventType].description}
              </p>
              <Button onClick={submitEvent} disabled={saving}>
                {saving ? "Se salvează..." : "Adaugă eveniment"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Rezumat medici</h2>
            <div className="space-y-2">
              {doctorSummary.map((doctor) => (
                <div
                  key={doctor.name}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{doctor.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.specialty}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {doctor.blockingEvents} blocante
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear((year) => year - 1);
                } else {
                  setCurrentMonth((month) => month - 1);
                }
                setSelectedDay(null);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {MONTHS_RO[currentMonth]} {currentYear}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear((year) => year + 1);
                } else {
                  setCurrentMonth((month) => month + 1);
                }
                setSelectedDay(null);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              →
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS_RO.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[92px] rounded-lg bg-slate-50 dark:bg-slate-800/40" />;
              }

              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDay;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDay(dateKey === selectedDay ? null : dateKey)}
                  className={`min-h-[92px] rounded-lg border p-2 text-left transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                      : isToday
                        ? "border-teal-300 bg-teal-50/60 dark:bg-teal-950/20"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <span className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-medium ${
                    isToday ? "bg-teal-600 text-white" : "text-slate-800 dark:text-slate-200"
                  }`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Array.from(new Set(dayEvents.map((event) => event.eventType))).slice(0, 3).map((type) => (
                        <div key={type} className="flex items-center gap-1">
                          <span className={`inline-block size-2 rounded-full ${EVENT_META[type].dot}`} />
                          <span className="truncate text-[11px] text-slate-600 dark:text-slate-400">
                            {EVENT_META[type].label}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[11px] text-slate-400">+{dayEvents.length - 3} evenimente</p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(EVENT_META).map(([type, meta]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className={`inline-block size-2.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {selectedDay ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDayLabel(selectedDay)}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Evenimentele din ziua selectată</p>

              <div className="mt-4 space-y-3">
                {selectedEvents.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Nu există evenimente în această zi.
                  </p>
                ) : (
                  selectedEvents.map((event) => (
                    <div key={`${event.$id}-${selectedDay}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block size-2.5 rounded-full ${EVENT_META[event.eventType].dot}`} />
                            <p className="font-medium text-slate-900 dark:text-slate-100">{event.doctorName}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${EVENT_META[event.eventType].badge}`}>
                              {EVENT_META[event.eventType].label}
                            </span>
                            {event.affectsAppointments && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Blochează programări
                              </span>
                            )}
                            {event.affectsDuty && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Exclude din gărzi
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {toDateKey(event.startDate)} → {toDateKey(event.endDate)}
                          </p>
                          {event.notes && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.notes}</p>
                          )}
                        </div>

                        {!event.readOnly && (
                          <button
                            type="button"
                            onClick={() => deleteEvent(event.$id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            aria-label="Șterge eveniment"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
              <CalendarDays className="size-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Selectează o zi pentru a vedea concediile, indisponibilitățile și gărzile.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Stethoscope className="size-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evenimente recente</h2>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Se încarcă evenimentele...</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 12).map((event) => (
              <div
                key={event.$id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {event.eventType === "vacation" ? (
                      <Plane className="size-4 text-blue-500" />
                    ) : event.eventType === "medical_leave" ? (
                      <ShieldAlert className="size-4 text-red-500" />
                    ) : (
                      <CalendarDays className="size-4 text-teal-500" />
                    )}
                    <p className="font-medium text-slate-900 dark:text-slate-100">{event.doctorName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_META[event.eventType].badge}`}>
                      {EVENT_META[event.eventType].label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {toDateKey(event.startDate)} → {toDateKey(event.endDate)}
                  </p>
                </div>
                {!event.readOnly && (
                  <Button variant="outline" size="sm" onClick={() => deleteEvent(event.$id)}>
                    Șterge
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
