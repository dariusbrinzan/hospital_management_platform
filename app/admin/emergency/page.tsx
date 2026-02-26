import Link from "next/link";
import { emergencyHelpers, doctorsOnDutyHelpers } from "@/lib/db-helpers";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { EmergencyKanbanBoard } from "@/components/EmergencyKanbanBoard";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Users, Calendar, Ambulance } from "lucide-react";

const EmergencyPage = async () => {
  await requireAdmin();
  const emergencyCases = await emergencyHelpers.getAll();

  const activeCases = emergencyCases.filter((c) => c.currentState !== "discharge");
  const inTriage = emergencyCases.filter((c) => c.currentState === "arrival" || c.currentState === "triage");
  const criticalCount = emergencyCases.filter((c) => c.priority === 1 || c.triageLevel === "critic").length;

  try {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setHours(Math.floor(now.getHours() / 12) * 12, 0, 0, 0);
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setHours(currentPeriodEnd.getHours() + 12);
    const existingRotation = (await import("@/lib/db")).default.prepare(`
      SELECT COUNT(*) as count FROM doctors_on_duty WHERE weekStartDate <= ? AND weekEndDate >= ?
    `).get(currentPeriodStart.toISOString(), currentPeriodEnd.toISOString()) as { count: number };
    if (existingRotation.count === 0) {
      doctorsOnDutyHelpers.generateAutomaticRotationForPeriod({
        startDate: currentPeriodStart,
        endDate: currentPeriodEnd,
        doctorsCount: 3,
      });
    }
  } catch {
    // ignore
  }

  return (
    <AdminPageLayout
      title="Primiri Urgențe"
      description="Gestionați cazurile de urgență și urmăriți progresul pacienților în timp real."
    >
      <div className="space-y-6">
        {/* Statistici rapide */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{activeCases.length}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cazuri active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{inTriage.length}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">În așteptare triaj</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
                <span className="text-lg font-bold">!</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{criticalCount}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Critice</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{emergencyCases.length}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total azi</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acțiuni */}
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="rounded-lg bg-teal-600 hover:bg-teal-700">
            <Link href="/admin/emergency/new">+ Caz nou</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg border-slate-300 dark:border-slate-700">
            <Link href="/admin/emergency/doctors">Medici de gardă</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg border-slate-300 dark:border-slate-700">
            <Link href="/admin/icu">Dashboard ATI</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg border-slate-300 dark:border-slate-700">
            <Link href="/admin/emergency/dispatcher">
              <Ambulance className="size-4 mr-1.5" />
              Dispecerat
            </Link>
          </Button>
        </div>

        <EmergencyKanbanBoard cases={emergencyCases} />
      </div>
    </AdminPageLayout>
  );
};

export default EmergencyPage;
