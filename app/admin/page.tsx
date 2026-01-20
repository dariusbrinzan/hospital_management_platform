import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { Doctors } from "@/constants";
import { DoctorFilter } from "@/components/DoctorFilter";
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
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={200}
            alt="eHealth.ro logo"
            className="h-8 w-fit"
          />
        </Link>

        <div className="flex items-center gap-4">
          <DoctorFilter doctors={Doctors} selectedDoctor={selectedDoctor} />
          <Link
            href="/admin/emergency"
            className="shad-primary-btn px-4 py-2 rounded-md text-14-medium hover:bg-green-600 transition-colors"
          >
            🚨 Primiri Urgente
          </Link>
          <Link
            href="/admin/medications"
            className="shad-primary-btn px-4 py-2 rounded-md text-14-medium hover:bg-blue-600 transition-colors"
          >
            💊 Stocuri Medicamente
          </Link>
          <p className="text-16-semibold">
            {selectedDoctor === "all" 
              ? selectedSpecialty && selectedSpecialty !== "all"
                ? `Specializare: ${selectedSpecialty}`
                : "Panou Administrator"
              : "Dashboard Doctor"}
          </p>
        </div>
      </header>

      <main className="admin-main">
        {selectedDoctor === "all" ? (
          <>
            {selectedSpecialty && selectedSpecialty !== "all" ? (
              <section className="w-full space-y-6">
                <div>
                  <h1 className="header">Doctori - {selectedSpecialty}</h1>
                  <p className="text-dark-600">
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
                <h1 className="header">Bun venit 👋</h1>
                <p className="text-dark-600">
                  Începeți ziua gestionând programările noi. Selectați o specializare pentru a vedea doctorii disponibili.
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
  );
};

export default AdminPage;
