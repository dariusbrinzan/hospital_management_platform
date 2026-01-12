import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { Doctors } from "@/constants";
import { DoctorFilter } from "@/components/DoctorFilter";

const AdminPage = async ({ searchParams }: SearchParamProps) => {
  const selectedDoctor = (searchParams?.doctor as string) || "all";
  const appointments = await getRecentAppointmentList(
    selectedDoctor === "all" ? undefined : selectedDoctor
  );

  const doctorData = selectedDoctor !== "all" 
    ? Doctors.find((d) => d.name === selectedDoctor)
    : null;

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
          <p className="text-16-semibold">
            {selectedDoctor === "all" ? "Panou Administrator" : "Dashboard Doctor"}
          </p>
        </div>
      </header>

      <main className="admin-main">
        {selectedDoctor === "all" ? (
          <section className="w-full space-y-4">
            <h1 className="header">Bun venit 👋</h1>
            <p className="text-dark-600">
              Începeți ziua gestionând programările noi
            </p>
          </section>
        ) : doctorData ? (
          <section className="w-full space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={doctorData.image}
                alt={doctorData.name}
                width={80}
                height={80}
                className="size-20 rounded-full border-2 border-green-500"
              />
              <div>
                <h1 className="header">{doctorData.name}</h1>
                <p className="text-16-medium text-green-500">{doctorData.specialty}</p>
                <p className="text-dark-600 mt-2">
                  Dashboard personal - Toate programările tale
                </p>
              </div>
            </div>
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
