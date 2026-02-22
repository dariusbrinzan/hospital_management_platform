import Link from "next/link";
import { redirect } from "next/navigation";
import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import { hospitalRoomHelpers, hospitalAdmissionHelpers } from "@/lib/db-helpers";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { HospitalRoomsDashboard } from "@/components/HospitalRoomsDashboard";
import { AdmissionForm } from "@/components/forms/AdmissionForm";
import { Button } from "@/components/ui/button";

const HospitalizationsPage = async ({ searchParams }: SearchParamProps) => {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/doctor");
  const showForm = searchParams?.new === "true";

  const allRooms = hospitalRoomHelpers.getAllRooms();
  const allAdmissions = hospitalAdmissionHelpers.getAllAdmissions();
  const departments = Array.from(new Set(allRooms.map((r) => r.department)));

  return (
    <AdminPageLayout
      title="Management spitalizări"
      description="Săli, paturi și pacienți internați"
    >
      <section className="admin-section-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="admin-section-title">Dashboard Spitalizări</h2>
            <p className="admin-section-desc">
              Gestionați sălile, paturile și pacienții internați
            </p>
          </div>
          {!showForm ? (
            <Button asChild className="shad-primary-btn w-fit">
              <Link href="/admin/hospitalizations?new=true">+ Internare nouă</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="shad-gray-btn w-fit">
              <Link href="/admin/hospitalizations">← Înapoi</Link>
            </Button>
          )}
        </div>

        {showForm ? (
          <div className="mt-6">
            <h3 className="text-16-semibold text-dark-900 mb-4">Internare pacient nou</h3>
            <AdmissionForm />
          </div>
        ) : (
          <HospitalRoomsDashboard
            rooms={allRooms}
            patients={allAdmissions}
            departments={departments}
          />
        )}
      </section>
    </AdminPageLayout>
  );
};

export default HospitalizationsPage;
