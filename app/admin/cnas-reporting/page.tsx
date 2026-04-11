import { AdminPageLayout } from "@/components/AdminPageLayout";
import { HospitalizationReportingDashboard } from "@/components/HospitalizationReportingDashboard";
import { requireAdmin } from "@/lib/actions/auth.actions";
import {
  hospitalAdmissionHelpers,
  hospitalizationReportingBatchHelpers,
  hospitalizationSheetHelpers,
  patientHelpers,
} from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export default async function AdminCnasReportingPage() {
  await requireAdmin();

  const patients = patientHelpers.getAll();
  const admissions = hospitalAdmissionHelpers.getAllAdmissions();
  const sheets = hospitalizationSheetHelpers.getAll().map((sheet) => ({
    ...sheet,
    diagnoses: hospitalizationSheetHelpers.getDiagnoses(sheet.$id),
    procedures: hospitalizationSheetHelpers.getProcedures(sheet.$id),
  }));
  const batches = hospitalizationReportingBatchHelpers.getAll().map((batch) => ({
    batch,
    items: hospitalizationReportingBatchHelpers.getItems(batch.$id),
  }));

  return (
    <AdminPageLayout
      title="Raportare CNAS"
      description="Foi de spitalizare, validare locală, batch-uri lunare și simularea decontării."
    >
      <HospitalizationReportingDashboard
        patients={patients}
        admissions={admissions}
        sheets={sheets}
        batches={batches}
      />
    </AdminPageLayout>
  );
}
