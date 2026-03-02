import Image from "next/image";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import { doctorReviewHelpers } from "@/lib/db-helpers";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);
  const doctorRatings = doctorReviewHelpers.getAllAverageRatings();

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">
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
            doctorRatings={doctorRatings}
          />

          <p className="mt-10 py-12 text-sm text-slate-500 dark:text-slate-400">© 2026 eHealth.ro</p>
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
