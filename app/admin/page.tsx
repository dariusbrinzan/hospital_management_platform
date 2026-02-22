import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { Doctors } from "@/constants";
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

  const doctorsInSpecialty = selectedSpecialty && selectedSpecialty !== "all"
    ? Doctors.filter((d) => d.specialty === selectedSpecialty)
    : [];

  return (
    <>
      <div className="border-b border-dark-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-20-semibold text-dark-900 sm:text-24-bold">
          {selectedDoctor !== "all"
            ? `Dashboard — ${doctorData?.name || selectedDoctor}`
            : selectedSpecialty && selectedSpecialty !== "all"
            ? `Specializare: ${selectedSpecialty}`
            : "Panou Administrator"}
        </h1>
      </div>

      <div className="flex-1 space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        {selectedDoctor === "all" ? (
          <>
            {selectedSpecialty && selectedSpecialty !== "all" ? (
              <section className="w-full space-y-6">
                <div>
                  <h2 className="text-20-semibold text-dark-900 mb-2">
                    Doctori — {selectedSpecialty}
                  </h2>
                  <p className="text-14-regular text-dark-600">
                    {doctorsInSpecialty.length} doctor{doctorsInSpecialty.length !== 1 ? "i" : ""} disponibil{doctorsInSpecialty.length !== 1 ? "i" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {doctorsInSpecialty.map((doctor) => (
                    <DoctorDetails key={doctor.name} doctor={doctor} />
                  ))}
                </div>
              </section>
            ) : (
              <section className="w-full space-y-4">
                <h2 className="text-20-semibold text-dark-900">Bun venit 👋</h2>
                <p className="text-14-regular text-dark-600">
                  Vizualizați programările și statisticile de mai jos. Folosiți filtrele din meniul din stânga pentru specializare sau medic.
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
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Programări în așteptare"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Programări anulate"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        <DataTable columns={columns} data={appointments.documents} />
      </div>
    </>
  );
};

export default AdminPage;
