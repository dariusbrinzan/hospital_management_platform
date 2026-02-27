import { requireAdmin } from "@/lib/actions/auth.actions";
import { ReportsDashboard } from "@/components/ReportsDashboard";
import { AdminPageLayout } from "@/components/AdminPageLayout";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin();
  return (
    <AdminPageLayout
      title="Rapoarte și statistici"
      description="Rapoarte per perioadă: programări, urgente, imagistică. Export PDF/CSV disponibil."
    >
      <ReportsDashboard />
    </AdminPageLayout>
  );
}
