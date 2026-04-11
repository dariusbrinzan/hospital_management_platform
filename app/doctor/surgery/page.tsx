import { Scissors } from "lucide-react";
import { redirect } from "next/navigation";

import { DoctorSurgeryCoordinator } from "@/components/DoctorSurgeryCoordinator";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import {
  anesthesiaConsultationHelpers,
  patientHelpers,
  surgeryBookingHelpers,
  surgeryCaseHelpers,
  surgeryFinancialHelpers,
} from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export default async function DoctorSurgeryPage({ searchParams }: SearchParamProps) {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const requestedPatientId = typeof searchParams?.patientId === "string" ? searchParams.patientId : undefined;
  const initialPatient = requestedPatientId ? await getPatientById(requestedPatientId) : null;
  const patients = patientHelpers
    .getAll()
    .map((patient) => ({
      $id: patient.$id,
      name: patient.name,
      primaryPhysician: patient.primaryPhysician,
    }));

  const myCases = surgeryCaseHelpers.getByDoctor(doctorName).map((caseItem) => ({
    caseItem,
    anesthesiaConsult: anesthesiaConsultationHelpers.getBySurgeryCaseId(caseItem.$id),
    booking: surgeryBookingHelpers.getBySurgeryCaseId(caseItem.$id),
    financial: surgeryFinancialHelpers.getBySurgeryCaseId(caseItem.$id),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Scissors className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Bloc operator</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Intervenții chirurgicale
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Creezi indicația operatorie, urmărești consultul ATI și vezi când cazul este preluat pentru programare în sală.
        </p>
        {initialPatient && (
          <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:border-teal-900/40 dark:bg-teal-950/20 dark:text-teal-300">
            Pacient preselectat din fișa clinică: <strong>{initialPatient.name}</strong>
          </p>
        )}
      </div>

      <DoctorSurgeryCoordinator
        doctorName={doctorName}
        patients={patients}
        initialPatientId={initialPatient?.$id}
        surgeryCases={myCases}
      />
    </div>
  );
}
