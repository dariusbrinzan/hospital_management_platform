import { redirect } from "next/navigation";
import { getPatient } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { PatientSignatureCard } from "@/components/PatientSignatureCard";

export default async function PatientSignaturePage({ params: { userId } }: SearchParamProps) {
  const session = await requireAuth();
  if (session.$id !== userId) redirect(`/patients/${session.$id}/signature`);

  const patient = await getPatient(userId);
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Consimțământ Pacient
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Aici puteți înregistra consimțământul pacientului, confirmarea primirii documentelor sau un consimțământ general. Toate înregistrările sunt asociate contului dvs.
        </p>
      </div>
      <PatientSignatureCard />
    </div>
  );
}
