import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { DoctorDetails } from "@/components/DoctorDetails";

export default async function DoctorDashboardPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) return null;

  const appointments = await getRecentAppointmentList(doctorName);
  const doctorData = Doctors.find((d) => d.name === doctorName);

  return (
    <>
      <div className="border-b border-dark-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-20-semibold text-dark-900 sm:text-24-bold">
          Programările mele — {doctorName}
        </h1>
      </div>

      <div className="flex-1 space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        {doctorData && (
          <section className="w-full space-y-6">
            <DoctorDetails doctor={doctorData} />
          </section>
        )}

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
}
