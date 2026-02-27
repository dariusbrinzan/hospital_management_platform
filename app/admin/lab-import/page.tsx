import { requireAdmin } from "@/lib/actions/auth.actions";
import { LabImportForm } from "@/components/LabImportForm";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminLabImportPage() {
  await requireAdmin();
  return (
    <AdminPageLayout
      title="Import rezultate laborator"
      description="Încărcați un fișier CSV cu rezultate analize. Coloane: testName (obligatoriu), testCategory, resultValue, unit, referenceRange, status, notes."
    >
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Fișier CSV</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rezultatele vor fi legate de pacientul selectat și opțional de o programare. Verificați maparea coloanelor înainte de import.
          </p>
        </CardHeader>
        <CardContent>
          <LabImportForm />
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
