"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentModal } from "../AppointmentModal";
import { StatusBadge } from "../StatusBadge";
import { AnalysisResultsModal } from "../AnalysisResultsModal";
import { AddMedicalRecordModal } from "../AddMedicalRecordModal";
import { Button } from "../ui/button";

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Pacient",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <Link
          href={`/doctor/patients/${appointment.patient.$id}`}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
        >
          {appointment.patient.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Programare",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Doctor",
    cell: ({ row }) => {
      const appointment = row.original;

      const doctor = Doctors.find(
        (doctor) => doctor.name === appointment.primaryPhysician
      );

      return (
        <div className="flex items-center gap-3">
          <Image
            src={doctor?.image!}
            alt="doctor"
            width={100}
            height={100}
            className="size-8 rounded-full border border-slate-200 dark:border-slate-700"
          />
          <Link
            href="/doctor/profile"
            className="whitespace-nowrap text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
          >
            {doctor?.name}
          </Link>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Acțiuni</div>,
    cell: ({ row }) => {
      const appointment = row.original;
      const doctor = Doctors.find(
        (doctor) => doctor.name === appointment.primaryPhysician
      );
      const isAnalysisDoctor = doctor?.specialty === "Analize medicale";
      const hasResults = appointment.analysisResults && appointment.analysisResults.trim().length > 0;

      return (
        <div className="flex min-w-[260px] flex-wrap items-center gap-2">
          {isAnalysisDoctor && appointment.status === "scheduled" && !hasResults && (
            <AnalysisResultsModal appointment={appointment} />
          )}
          {isAnalysisDoctor && appointment.status === "scheduled" && hasResults && (
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              disabled
            >
              Rezultate completate
            </Button>
          )}
          {!isAnalysisDoctor && appointment.status === "scheduled" && (
            <AddMedicalRecordModal appointment={appointment} doctorName={appointment.primaryPhysician} />
          )}
          {appointment.status !== "cancelled" && (
            <AppointmentModal
              patientId={appointment.patient.$id}
              userId={appointment.userId}
              appointment={appointment}
              type="cancel"
              title="Anulează programarea"
              description="Sunteți sigur că doriți să anulați programarea?"
              triggerClassName="h-10 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
            />
          )}
        </div>
      );
    },
  },
];
