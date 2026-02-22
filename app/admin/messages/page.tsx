import { redirect } from "next/navigation";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { AdminDoctorHeader } from "@/components/AdminDoctorHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Doctors } from "@/constants";
import { DoctorMessagesView } from "@/components/DoctorMessagesView";

const AdminMessagesPage = async ({
  searchParams,
}: {
  searchParams: { appointmentId?: string };
}) => {
  const doctorName = await getDoctorSession();
  if (!doctorName) {
    redirect("/?admin=true");
  }

  const doctorData = Doctors.find((d) => d.name === doctorName);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        doctors={Doctors}
        selectedDoctor={doctorName}
        isDoctorView={true}
        doctorName={doctorName}
      />
      <div className="flex-1 flex flex-col">
        <AdminDoctorHeader doctorName={doctorName} />
        <div className="border-b border-dark-200 bg-white px-4 sm:px-6 py-4">
          <h1 className="text-20-semibold sm:text-24-bold text-dark-900">
            Mesaje — {doctorData?.name ?? doctorName}
          </h1>
          <p className="text-14-regular text-dark-600 mt-1">
            Conversații cu pacienții pentru programările dumneavoastră
          </p>
        </div>
        <main className="flex-1 px-4 sm:px-6 py-6">
          <DoctorMessagesView initialAppointmentId={searchParams?.appointmentId ?? null} />
        </main>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
