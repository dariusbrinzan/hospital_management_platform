"use client";

import { useMemo, useState } from "react";
import { MedicalHistoryTimeline } from "./MedicalHistoryTimeline";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Doctors } from "@/constants";

const PAGE_SIZE = 10;
const TYPE_OPTIONS = [
  { value: "all", label: "Toate" },
  { value: "record", label: "Consultație" },
  { value: "allergy", label: "Alergie" },
  { value: "vaccination", label: "Vaccinare" },
  { value: "analysis-group", label: "Analiză" },
];

interface MedicalHistoryWithFiltersProps {
  medicalRecords: any[];
  allergies: any[];
  vaccinations: any[];
  familyHistory: any[];
  analysisGroups?: any[];
  patientInfo?: {
    age: number;
    gender: "Bărbat" | "Femeie";
    weight?: number;
  };
}

export function MedicalHistoryWithFilters({
  medicalRecords,
  allergies,
  vaccinations,
  familyHistory,
  analysisGroups = [],
  patientInfo,
}: MedicalHistoryWithFiltersProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [page, setPage] = useState(1);

  const doctorNames = useMemo(() => {
    const set = new Set<string>();
    medicalRecords.forEach((r: any) => r.doctorName && set.add(r.doctorName));
    return Array.from(set).sort();
  }, [medicalRecords]);

  const allEvents = useMemo(() => {
    const events: any[] = [
      ...medicalRecords.map((r: any) => ({ ...r, type: "record" as const, date: r.visitDate })),
      ...allergies.map((a: any) => ({ ...a, type: "allergy" as const, date: a.firstOccurrenceDate || a.createdAt })),
      ...vaccinations.map((v: any) => ({ ...v, type: "vaccination" as const, date: v.administrationDate })),
      ...analysisGroups.map((g: any) => ({ ...g, type: "analysis-group" as const, date: g.date })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events;
  }, [medicalRecords, allergies, vaccinations, analysisGroups]);

  const filteredEvents = useMemo(() => {
    let list = allEvents;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((e) => new Date(e.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((e) => new Date(e.date) <= to);
    }
    if (typeFilter !== "all") {
      list = list.filter((e) => e.type === typeFilter);
    }
    if (doctorFilter !== "all") {
      list = list.filter((e) => e.doctorName === doctorFilter);
    }
    return list;
  }, [allEvents, dateFrom, dateTo, typeFilter, doctorFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  const handleFilterChange = () => setPage(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-dark-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Dată de la</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              handleFilterChange();
            }}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Dată până la</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              handleFilterChange();
            }}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Tip</label>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Doctor</label>
          <Select
            value={doctorFilter}
            onValueChange={(v) => {
              setDoctorFilter(v);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți</SelectItem>
              {doctorNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {Doctors.find((d) => d.name === name)?.specialty ? `${name} (${Doctors.find((d) => d.name === name)!.specialty})` : name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2 text-14-regular text-dark-500">
          {filteredEvents.length} înregistrări
        </div>
      </div>

      <MedicalHistoryTimeline
        medicalRecords={medicalRecords}
        allergies={allergies}
        vaccinations={vaccinations}
        familyHistory={familyHistory}
        analysisGroups={analysisGroups}
        patientInfo={patientInfo}
        events={paginatedEvents}
      />

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dark-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-dark-200 bg-white px-4 py-2 text-14-medium text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            Înapoi
          </button>
          <span className="text-14-regular text-dark-600">
            Pagina {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-dark-200 bg-white px-4 py-2 text-14-medium text-dark-700 hover:bg-dark-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            Înainte
          </button>
        </div>
      )}
    </div>
  );
}
