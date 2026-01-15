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
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Pacient",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <Link
          href={`/admin/patients/${appointment.patient.$id}`}
          className="text-14-medium text-green-500 hover:text-green-600 hover:underline"
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
            className="size-8"
          />
          <p className="whitespace-nowrap">{doctor?.name}</p>
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
        <div className="flex gap-1">
          {isAnalysisDoctor && appointment.status === "scheduled" && !hasResults && (
            <AnalysisResultsModal appointment={appointment} />
          )}
          {isAnalysisDoctor && appointment.status === "scheduled" && hasResults && (
            <Button
              variant="outline"
              className="shad-gray-btn text-14-medium cursor-default"
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
            />
          )}
        </div>
      );
    },
  },
];
