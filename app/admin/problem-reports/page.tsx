import { requireAdmin } from "@/lib/actions/auth.actions";
import { problemReportsHelpers } from "@/lib/db-helpers";
import { ProblemReportsList } from "@/components/ProblemReportsList";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminProblemReportsPage() {
  await requireAdmin();
  const reports = problemReportsHelpers.getAll();

  return (
    <AdminPageLayout
      title="Raportări probleme"
      description="Rapoarte trimise de pacienți. Doar administratorul are acces la această pagină."
    >
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Lista raportări</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Actualizați statusul și adăugați note pentru fiecare raport.
          </p>
        </CardHeader>
        <CardContent>
          <ProblemReportsList reports={reports} />
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
