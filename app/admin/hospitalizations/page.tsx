import Link from "next/link";

import { AdminPageLayout } from "@/components/AdminPageLayout";
import { AdmissionForm } from "@/components/forms/AdmissionForm";
import { HospitalRoomsDashboard } from "@/components/HospitalRoomsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { hospitalAdmissionHelpers, hospitalRoomHelpers } from "@/lib/db-helpers";

const HospitalizationsPage = async ({ searchParams }: SearchParamProps) => {
  await requireAdmin();
  const showForm = searchParams?.new === "true";

  const allRooms = hospitalRoomHelpers.getAllRooms();
  const allAdmissions = hospitalAdmissionHelpers.getAllAdmissions();
  const departments = Array.from(new Set(allRooms.map((r) => r.department)));

  return (
    <AdminPageLayout
      title="Spitalizări"
      description="Săli, paturi și pacienți internați. Adăugați internări noi sau verificați ocuparea."
    >
      <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {showForm ? "Internare nouă" : "Dashboard spitalizări"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {showForm
                ? "Completați formularul pentru a interna un pacient."
                : "Gestionați sălile, paturile și pacienții internați."}
            </p>
          </div>
          {!showForm ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="w-fit rounded-lg border-slate-300 dark:border-slate-600">
                <Link href="/admin/cnas-reporting">Foi și raportare CNAS</Link>
              </Button>
              <Button asChild className="w-fit rounded-lg bg-teal-600 hover:bg-teal-700">
                <Link href="/admin/hospitalizations?new=true">+ Internare nouă</Link>
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" className="w-fit rounded-lg border-slate-300 dark:border-slate-600">
              <Link href="/admin/hospitalizations">← Înapoi</Link>
            </Button>
          )}
        </CardHeader>
        {showForm ? (
          <CardContent>
            <AdmissionForm />
          </CardContent>
        ) : (
          <CardContent className="pt-0">
            <HospitalRoomsDashboard
              rooms={allRooms}
              patients={allAdmissions}
              departments={departments}
            />
          </CardContent>
        )}
      </Card>
    </AdminPageLayout>
  );
};

export default HospitalizationsPage;
