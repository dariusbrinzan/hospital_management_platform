import { AdminPageLayout } from "@/components/AdminPageLayout";
import { EmergencyCaseDetails } from "@/components/EmergencyCaseDetails";
import { getStudiesForEmergencyCase } from "@/lib/actions/imaging.actions";
import { emergencyHelpers, patientMedicationAdministrationHelpers } from "@/lib/db-helpers";
import { formatEmergencyCaseNumber } from "@/lib/utils";

const EmergencyCasePage = async ({ params: { caseId } }: SearchParamProps) => {
  const [emergencyCase, imagingStudies, stateTransitions, medicationAdministrations] = await Promise.all([
    emergencyHelpers.getById(caseId),
    getStudiesForEmergencyCase(caseId),
    Promise.resolve(emergencyHelpers.getStateTransitions(caseId)),
    Promise.resolve(patientMedicationAdministrationHelpers.getByEmergencyCaseId(caseId)),
  ]);

  if (!emergencyCase) {
    return (
      <AdminPageLayout title="Caz negăsit" description="Cazul de urgență nu există." backHref="/admin/emergency">
        <p className="text-slate-600 dark:text-slate-400">Cazul nu a fost găsit.</p>
      </AdminPageLayout>
    );
  }

  const patientName = emergencyCase.patient?.name || (emergencyCase as any).patientName || "Pacient necunoscut";
  const caseNumber = formatEmergencyCaseNumber(emergencyCase.$id);

  return (
    <AdminPageLayout
      title={`${caseNumber} — ${patientName}`}
      description={emergencyCase.chiefComplaint}
      backHref="/admin/emergency"
    >
      <EmergencyCaseDetails
        emergencyCase={emergencyCase}
        imagingStudies={imagingStudies}
        stateTransitions={stateTransitions}
        medicationAdministrations={medicationAdministrations}
      />
    </AdminPageLayout>
  );
};

export default EmergencyCasePage;
