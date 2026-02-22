import { redirect } from "next/navigation";
import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import { medicationStockHelpers } from "@/lib/db-helpers";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { MedicationStockDashboard } from "@/components/MedicationStockDashboard";

const MedicationsPage = async () => {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/admin");
  const allStocks = medicationStockHelpers.getAll();
  const lowStock = medicationStockHelpers.getLowStock();
  const emergencyStocks = medicationStockHelpers.getAll("emergency_department");
  const icuStocks = medicationStockHelpers.getAll("icu_ward");

  return (
    <AdminPageLayout
      title="Management stocuri medicamente"
      description="Gestionați stocurile de medicamente și tratamente"
    >
      <MedicationStockDashboard
        allStocks={allStocks}
        lowStock={lowStock}
        emergencyStocks={emergencyStocks}
        icuStocks={icuStocks}
      />
    </AdminPageLayout>
  );
};

export default MedicationsPage;
