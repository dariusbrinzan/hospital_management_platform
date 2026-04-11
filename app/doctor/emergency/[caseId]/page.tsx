import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmergencyCaseDetails } from "@/components/EmergencyCaseDetails";
import { Button } from "@/components/ui/button";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getStudiesForEmergencyCase } from "@/lib/actions/imaging.actions";
import { emergencyHelpers, patientMedicationAdministrationHelpers } from "@/lib/db-helpers";
import { formatEmergencyCaseNumber } from "@/lib/utils";

export default async function DoctorEmergencyCasePage({
  params,
}: {
  params: { caseId: string };
}) {
  const { caseId } = params;
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const [emergencyCase, imagingStudies, stateTransitions, medicationAdministrations] = await Promise.all([
    emergencyHelpers.getById(caseId),
    getStudiesForEmergencyCase(caseId),
    Promise.resolve(emergencyHelpers.getStateTransitions(caseId)),
    Promise.resolve(patientMedicationAdministrationHelpers.getByEmergencyCaseId(caseId)),
  ]);

  if (!emergencyCase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-slate-600 dark:text-slate-400">Cazul nu a fost găsit.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/doctor/emergency">Înapoi la Urgențe</Link>
        </Button>
      </div>
    );
  }

  if (emergencyCase.assignedDoctorId !== doctorName) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Nu ai acces la acest caz. Doar medicul asignat poate vizualiza și gestiona cazul.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/doctor/emergency">Înapoi la Urgențe</Link>
        </Button>
      </div>
    );
  }

  const patientName = emergencyCase.patient?.name ?? (emergencyCase as any).patientName ?? "Pacient necunoscut";
  const caseNumber = formatEmergencyCaseNumber(emergencyCase.$id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/doctor/emergency"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="size-4" />
          Înapoi la cazurile mele de urgență
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {caseNumber} — {patientName}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{emergencyCase.chiefComplaint}</p>
      </div>

      <EmergencyCaseDetails
        emergencyCase={emergencyCase}
        imagingStudies={imagingStudies}
        stateTransitions={stateTransitions}
        medicationAdministrations={medicationAdministrations}
        performedBy={doctorName}
      />
    </div>
  );
}
