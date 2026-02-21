import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DoctorDetails } from "@/components/DoctorDetails";
import { AdminDoctorHeader } from "@/components/AdminDoctorHeader";

const AdminPage = async ({ searchParams }: SearchParamProps) => {
  const doctorSession = await getDoctorSession();
  const isDoctorView = !!doctorSession;

  // Medic: vede doar datele lui. Admin: poate selecta doctor din URL/searchParams
  const selectedDoctor = isDoctorView
    ? doctorSession!
    : ((searchParams?.doctor as string) || "all");
  const selectedSpecialty = (searchParams?.specialty as string) || "";

  const appointments = await getRecentAppointmentList(
    selectedDoctor === "all" ? undefined : selectedDoctor
  );

  const doctorData = selectedDoctor !== "all"
    ? Doctors.find((d) => d.name === selectedDoctor)
    : null;

  // Filtrează doctorii după specializarea selectată (doar pentru admin)
  const doctorsInSpecialty = selectedSpecialty && selectedSpecialty !== "all"
    ? Doctors.filter((d) => d.specialty === selectedSpecialty)
    : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar: pentru medic fără filtre alte doctori */}
      <AdminSidebar
        doctors={Doctors}
        selectedDoctor={selectedDoctor}
        isDoctorView={isDoctorView}
        doctorName={doctorSession ?? undefined}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header: Panou Medic cu deconectare sau Panou Administrator */}
        {isDoctorView ? (
          <AdminDoctorHeader doctorName={doctorSession!} />
        ) : (
          <header className="sticky top-0 z-20 bg-white border-b border-dark-200 shadow-sm">
            <div className="flex h-14 min-h-14 items-center px-4 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4 lg:gap-8">
                <div className="flex flex-shrink-0 items-center gap-3">
                  <Link href="/" className="cursor-pointer" aria-label="Acasă">
                    <Image
                      src="/assets/icons/logo-full.svg"
                      height={32}
                      width={200}
                      alt="eHealth.ro logo"
                      className="h-8 w-fit"
                    />
                  </Link>
                  <span className="hidden border-l border-dark-200 pl-3 text-sm font-medium text-dark-500 lg:block">
                    Panou Administrator
                  </span>
                </div>
                <nav
                  className="flex flex-shrink-0 items-center gap-1.5 overflow-x-auto py-1 scrollbar-none md:gap-2"
                  aria-label="Navigare panou"
                >
                  <Link href="/admin/emergency" className="admin-nav-link admin-nav-link--primary">
                    <span className="admin-nav-icon" aria-hidden>🚨</span>
                    <span className="hidden sm:inline">Urgente</span>
                    <span className="sm:hidden">Urgente</span>
                  </Link>
                  <Link href="/admin/medications" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>💊</span>
                    <span className="hidden sm:inline">Medicamente</span>
                    <span className="sm:hidden">Medic.</span>
                  </Link>
                  <Link href="/admin/patients" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>👥</span>
                    <span className="hidden sm:inline">Pacienți</span>
                    <span className="sm:hidden">Pacienți</span>
                  </Link>
                  <Link href="/admin/hospitalizations" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>🏥</span>
                    <span className="hidden sm:inline">Spitalizări</span>
                    <span className="sm:hidden">Spit.</span>
                  </Link>
                  <Link href="/admin/imaging" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>🩻</span>
                    <span className="hidden sm:inline">Imagistică</span>
                    <span className="sm:hidden">Imag.</span>
                  </Link>
                  <Link href="/admin/lab-import" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>📋</span>
                    <span className="hidden sm:inline">Import analize</span>
                    <span className="sm:hidden">Import</span>
                  </Link>
                  <Link href="/admin/reports" className="admin-nav-link">
                    <span className="admin-nav-icon" aria-hidden>📊</span>
                    <span className="hidden sm:inline">Rapoarte</span>
                    <span className="sm:hidden">Rapoarte</span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>
        )}

        {/* Page Title */}
        <div className="bg-white border-b border-dark-200 px-4 sm:px-6 py-4">
          <h1 className="text-20-semibold sm:text-24-bold text-dark-900">
            {isDoctorView
              ? `Programările mele — ${doctorSession}`
              : selectedDoctor !== "all"
              ? `Dashboard - ${doctorData?.name || selectedDoctor}`
              : selectedSpecialty && selectedSpecialty !== "all"
              ? `Specializare: ${selectedSpecialty}`
              : "Panou Administrator"}
          </h1>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {isDoctorView && doctorData ? (
            <section className="w-full space-y-6">
              <DoctorDetails doctor={doctorData} />
            </section>
          ) : null}
          {!isDoctorView && selectedDoctor === "all" ? (
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
          ) : !isDoctorView && doctorData ? (
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
