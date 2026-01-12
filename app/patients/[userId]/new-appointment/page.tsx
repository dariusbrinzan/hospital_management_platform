import Image from "next/image";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  return (
    <div className="relative flex min-h-screen">
      <section className="remove-scrollbar container my-auto relative z-10">
        <div className="sub-container max-w-[860px] flex-1 justify-between md:pr-[410px]">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="eHealth.ro logo"
            className="mb-12 h-10 w-fit"
          />

          <AppointmentForm
            patientId={patient?.$id}
            userId={userId}
            type="create"
            patientGender={patient?.gender}
          />

          <p className="copyright mt-10 py-12">© 2026 eHealth.ro</p>
        </div>
      </section>

      <Image
        src="/assets/images/imag_health.png"
        height={2000}
        width={800}
        alt="appointment"
        className="side-img-fixed"
        quality={100}
        priority
        unoptimized={false}
      />
    </div>
  );
};

export default Appointment;
