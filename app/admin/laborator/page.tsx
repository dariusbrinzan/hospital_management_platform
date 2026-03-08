import { requireAdmin } from "@/lib/actions/auth.actions";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { LaboratorDashboard } from "@/components/LaboratorDashboard";

export default async function LaboratorPage() {
  await requireAdmin();
  return (
    <AdminPageLayout
      title="Laborator"
      description="Comenzi analize (incl. TDM – monitorizare terapie medicamentoasă). Creare comenzi și introducere rezultate."
    >
      <LaboratorDashboard />
    </AdminPageLayout>
  );
}
