import { AdminFinanceDashboard } from "@/components/AdminFinanceDashboard";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { requireAdmin } from "@/lib/actions/auth.actions";
import {
  ambulanceFuelLogHelpers,
  ambulanceHelpers,
  financialTransactionHelpers,
} from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdmin();

  financialTransactionHelpers.syncSurgeryFinanceEntries();

  const [summary, transactions, fuelLogs, ambulances] = await Promise.all([
    Promise.resolve(financialTransactionHelpers.getSummary(30)),
    Promise.resolve(financialTransactionHelpers.getAll({ limit: 30 })),
    Promise.resolve(ambulanceFuelLogHelpers.getAll(12)),
    Promise.resolve(ambulanceHelpers.getAll()),
  ]);

  return (
    <AdminPageLayout
      title="Financiar"
      description="Venituri, cheltuieli, deduceri, rambursări și costuri operaționale centralizate la nivelul spitalului."
    >
      <AdminFinanceDashboard
        summary={summary}
        transactions={transactions}
        fuelLogs={fuelLogs}
        ambulances={ambulances}
      />
    </AdminPageLayout>
  );
}
