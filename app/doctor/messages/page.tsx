import { redirect } from "next/navigation";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { DoctorMessagesView } from "@/components/DoctorMessagesView";
import { MessageSquare } from "lucide-react";

export default async function DoctorMessagesPage({
  searchParams,
}: {
  searchParams: { appointmentId?: string };
}) {
  const doctorName = await getDoctorSession();
  if (!doctorName) {
    redirect("/medic");
  }

  const doctorData = Doctors.find((d) => d.name === doctorName);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-slate-50/80 px-4 py-8 dark:border-slate-800 dark:from-slate-900/50 dark:via-slate-900 dark:to-teal-950/20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.08),transparent)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Mesaje — {doctorData?.name ?? doctorName}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Conversații cu pacienții pentru programările dumneavoastră.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <DoctorMessagesView initialAppointmentId={searchParams?.appointmentId ?? null} />
      </div>
    </div>
  );
}
