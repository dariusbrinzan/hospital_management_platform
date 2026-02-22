import { redirect } from "next/navigation";
import { getDoctorSession } from "@/lib/actions/auth.actions";
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
    <>
      <div className="border-b border-dark-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-20-semibold text-dark-900 sm:text-24-bold">
          Mesaje — {doctorData?.name ?? doctorName}
        </h1>
        <p className="mt-1 text-14-regular text-dark-600">
          Conversații cu pacienții pentru programările dumneavoastră
        </p>
      </div>
      <div className="flex-1 px-4 py-6 sm:px-6">
        <DoctorMessagesView initialAppointmentId={searchParams?.appointmentId ?? null} />
      </div>
    </>
  );
};

export default AdminMessagesPage;
