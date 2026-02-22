import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import { hospitalRoomHelpers, hospitalAdmissionHelpers } from "@/lib/db-helpers";
import { HospitalRoomsDashboard } from "@/components/HospitalRoomsDashboard";
import { AdmissionForm } from "@/components/forms/AdmissionForm";

const HospitalizationsPage = async ({ searchParams }: SearchParamProps) => {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/admin");
  const showForm = searchParams?.new === "true";
  
  const allRooms = hospitalRoomHelpers.getAllRooms();
  const allAdmissions = hospitalAdmissionHelpers.getAllAdmissions();
  
  // Obține toate departamentele unice
  const departments = Array.from(new Set(allRooms.map((r) => r.department)));

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={200}
            alt="eHealth.ro logo"
            className="h-8 w-fit"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi la Dashboard
          </Link>
          <h1 className="text-16-semibold">🏥 Management Spitalizări</h1>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="header">Dashboard Spitalizări</h2>
              <p className="text-dark-600">
                Gestionați sălile, paturile și pacienții internați
              </p>
            </div>
            <div className="flex gap-2">
              {!showForm ? (
                <Link
                  href="/admin/hospitalizations?new=true"
                  className="shad-primary-btn px-6 py-3 rounded-md text-14-medium hover:bg-green-600 transition-colors"
                >
                  + Internare Nouă
                </Link>
              ) : (
                <Link
                  href="/admin/hospitalizations"
                  className="shad-gray-btn px-6 py-3 rounded-md text-14-medium hover:bg-dark-100 transition-colors"
                >
                  ← Înapoi la Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        {showForm ? (
          <section className="bg-white rounded-lg border border-dark-200 p-6 shadow-lg">
            <h3 className="header mb-4">Internare Pacient Nou</h3>
            <AdmissionForm />
          </section>
        ) : (
          <HospitalRoomsDashboard
            rooms={allRooms}
            patients={allAdmissions}
            departments={departments}
          />
        )}
      </main>
    </div>
  );
};

export default HospitalizationsPage;
