import { requireAdmin } from "@/lib/actions/auth.actions";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { PharmacyAdvancedDashboard } from "@/components/PharmacyAdvancedDashboard";

export default async function PharmacyPage() {
  await requireAdmin();
  return (
    <AdminPageLayout
      title="Farmacie"
      description="Comenzi aprovizionare, dispensări rețete, interacțiuni medicamentoase, loturi cu expirare."
    >
      <PharmacyAdvancedDashboard />
    </AdminPageLayout>
  );
}
