import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { Doctors } from "@/constants";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DoctorDetails } from "@/components/DoctorDetails";

const AdminPage = async ({ searchParams }: SearchParamProps) => {
  const selectedDoctor = (searchParams?.doctor as string) || "all";
  const selectedSpecialty = (searchParams?.specialty as string) || "";
  
  const appointments = await getRecentAppointmentList(
    selectedDoctor === "all" ? undefined : selectedDoctor
  );

  const doctorData = selectedDoctor !== "all" 
    ? Doctors.find((d) => d.name === selectedDoctor)
    : null;

  // Filtrează doctorii după specializarea selectată
  const doctorsInSpecialty = selectedSpecialty && selectedSpecialty !== "all"
    ? Doctors.filter((d) => d.specialty === selectedSpecialty)
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar doctors={Doctors} selectedDoctor={selectedDoctor} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-dark-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="cursor-pointer flex-shrink-0">
                  <Image
                    src="/assets/icons/logo-full.svg"
                    height={32}
                    width={200}
                    alt="eHealth.ro logo"
                    className="h-8 w-fit"
                  />
                </Link>
                <span className="hidden lg:block text-14-regular text-dark-500">
                  Panou Administrator
                </span>
              </div>

              {/* Action Buttons - Centrate și simetrice */}
              <nav className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/admin/emergency"
                  className="shad-primary-btn px-3 py-2 rounded-lg text-12-medium hover:bg-green-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>🚨</span>
                  <span className="hidden sm:inline">Primiri Urgente</span>
                  <span className="sm:hidden">Urgente</span>
                </Link>
                <Link
                  href="/admin/medications"
                  className="shad-primary-btn px-3 py-2 rounded-lg text-12-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>💊</span>
                  <span className="hidden sm:inline">Stocuri Medicamente</span>
                  <span className="sm:hidden">Medicamente</span>
                </Link>
                <Link
                  href="/admin/patients"
                  className="shad-primary-btn px-3 py-2 rounded-lg text-12-medium hover:bg-purple-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>👥</span>
                  <span className="hidden sm:inline">Căutare Pacienți</span>
                  <span className="sm:hidden">Pacienți</span>
                </Link>
                <Link
                  href="/admin/hospitalizations"
                  className="shad-primary-btn px-3 py-2 rounded-lg text-12-medium hover:bg-indigo-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>🏥</span>
                  <span className="hidden sm:inline">Spitalizări</span>
                  <span className="sm:hidden">Spitalizări</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="bg-white border-b border-dark-200 px-4 sm:px-6 py-4">
          <h1 className="text-20-semibold sm:text-24-bold text-dark-900">
            {selectedDoctor !== "all" 
              ? `Dashboard - ${doctorData?.name || selectedDoctor}`
              : selectedSpecialty && selectedSpecialty !== "all"
              ? `Specializare: ${selectedSpecialty}`
              : "Panou Administrator"}
          </h1>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {selectedDoctor === "all" ? (
            <>
              {selectedSpecialty && selectedSpecialty !== "all" ? (
                <section className="w-full space-y-6">
                  <div>
                    <h2 className="text-20-semibold text-dark-900 mb-2">
                      Doctori - {selectedSpecialty}
                    </h2>
                    <p className="text-14-regular text-dark-600">
                      {doctorsInSpecialty.length} doctor{doctorsInSpecialty.length !== 1 ? "i" : ""} disponibil{doctorsInSpecialty.length !== 1 ? "i" : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctorsInSpecialty.map((doctor) => (
                      <DoctorDetails key={doctor.name} doctor={doctor} />
                    ))}
                  </div>
                </section>
              ) : (
                <section className="w-full space-y-4">
                  <h2 className="text-20-semibold text-dark-900">Bun venit 👋</h2>
                  <p className="text-14-regular text-dark-600">
                    Începeți ziua gestionând programările noi. Selectați o specializare din sidebar pentru a vedea doctorii disponibili.
                  </p>
                </section>
              )}
            </>
          ) : doctorData ? (
            <section className="w-full space-y-6">
              <DoctorDetails doctor={doctorData} />
            </section>
          ) : null}

          <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Programări confirmate"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Programări în așteptare"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Programări anulate"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

          <DataTable columns={columns} data={appointments.documents} />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
