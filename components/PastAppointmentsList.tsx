"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { getRoomByDoctor } from "@/lib/hospital-map";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentReviewButton } from "@/components/AppointmentReviewButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

const PAGE_SIZE = 5;

interface PastAppointmentsListProps {
  past: any[];
  userId: string;
  /** Lista de evaluări (review) per programare – se construiește Map intern */
  patientReviews: any[];
}

export function PastAppointmentsList({
  past,
  userId,
  patientReviews,
}: PastAppointmentsListProps) {
  const reviewsByAppointment = useMemo(
    () => new Map(patientReviews.map((r: any) => [r.appointmentId, r])),
    [patientReviews]
  );

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [page, setPage] = useState(1);

  const doctorNames = useMemo(() => {
    const set = new Set<string>();
    past.forEach((a: any) => a.primaryPhysician && set.add(a.primaryPhysician));
    return Array.from(set).sort();
  }, [past]);

  const filtered = useMemo(() => {
    let list = past;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((a: any) => new Date(a.schedule) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a: any) => new Date(a.schedule) <= to);
    }
    if (doctorFilter !== "all") {
      list = list.filter((a: any) => a.primaryPhysician === doctorFilter);
    }
    return list;
  }, [past, dateFrom, dateTo, doctorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const onFilterChange = () => setPage(1);

  if (past.length === 0) {
    return (
      <p className="text-14-regular text-dark-500">
        Nu ai programări trecute.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dark-200 bg-white p-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Dată de la</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              onFilterChange();
            }}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Dată până la</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              onFilterChange();
            }}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-12-regular text-dark-500">Doctor</label>
          <Select
            value={doctorFilter}
            onValueChange={(v) => {
              setDoctorFilter(v);
              onFilterChange();
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți</SelectItem>
              {doctorNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto text-14-regular text-dark-500">
          {filtered.length} programări
        </div>
      </div>

      <div className="space-y-4">
        {paginated.map((appointment: any) => {
          const doctor = Doctors.find((d) => d.name === appointment.primaryPhysician);
          const appointmentRoom = getRoomByDoctor(appointment.primaryPhysician);

          return (
            <div
              key={appointment.$id}
              className="rounded-lg border border-dark-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={
                      appointmentRoom
                        ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                        : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                    }
                    className="mb-3 flex items-center gap-3 rounded-lg p-2 -ml-2 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    title={
                      appointmentRoom
                        ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor}`
                        : "Deschide harta spitalului"
                    }
                  >
                    {doctor && (
                      <Image
                        src={doctor.image}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 flex-shrink-0 rounded-full border border-dark-200"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-16-semibold text-dark-700">
                        {appointment.primaryPhysician}
                      </p>
                      {doctor?.specialty && (
                        <p className="text-14-medium text-green-500">
                          {doctor.specialty}
                        </p>
                      )}
                      <p className="text-14-regular text-dark-500">
                        {formatDateTime(appointment.schedule).dateTime}
                      </p>
                      <span className="mt-1 inline-block text-xs text-dark-400">
                        {appointmentRoom ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor} · click pentru hartă` : "Click pentru hartă"}
                      </span>
                    </div>
                  </Link>

                  {appointment.reason && (
                    <p className="text-14-regular text-dark-600 mb-1">
                      <span className="font-medium">Motiv:</span> {appointment.reason}
                    </p>
                  )}

                  {appointment.cancellationReason && (
                    <p className="text-14-regular text-red-600 mb-1">
                      <span className="font-medium">Motiv anulare:</span> {appointment.cancellationReason}
                    </p>
                  )}

                  {appointment.analysisResults && (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="text-14-semibold text-green-700 mb-3">
                        Rezultate Analize:
                      </p>
                      {(() => {
                        try {
                          const results = JSON.parse(appointment.analysisResults);
                          if (Array.isArray(results) && results.length > 0) {
                            return (
                              <div className="space-y-3">
                                {results.map((result: any, index: number) => (
                                  <div key={index} className="border-b border-green-200 pb-3 last:border-0 last:pb-0">
                                    <p className="text-14-semibold text-dark-700 mb-1">
                                      {result.testName}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-14-regular text-dark-600">
                                      <p>
                                        <span className="font-medium">Valoare:</span> {result.value}
                                        {result.unit && ` ${result.unit}`}
                                      </p>
                                      {result.referenceRange && (
                                        <p>
                                          <span className="font-medium">Referință:</span> {result.referenceRange}
                                        </p>
                                      )}
                                    </div>
                                    {result.notes && (
                                      <p className="text-14-regular text-dark-600 mt-1">
                                        <span className="font-medium">Observații:</span> {result.notes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                        } catch {
                          return (
                            <p className="text-14-regular text-dark-700 whitespace-pre-wrap">
                              {appointment.analysisResults}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dark-100 pt-3">
                    {appointment.status === "scheduled" && (
                      <AppointmentReviewButton
                        appointmentId={appointment.$id}
                        doctorName={appointment.primaryPhysician}
                        existingReview={reviewsByAppointment.get(appointment.$id) || null}
                      />
                    )}
                    <Link
                      href={
                        appointmentRoom
                          ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                          : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                      }
                      className="inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-14-medium text-green-700 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{appointmentRoom ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor}` : "Vezi pe hartă"}</span>
                    </Link>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={appointment.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
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
