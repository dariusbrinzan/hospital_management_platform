import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/actions/auth.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { ReportProblemForm } from "@/components/ReportProblemForm";

export default async function ReportProblemPage({ params: { userId } }: SearchParamProps) {
  const session = await requireAuth();
  if (session.$id !== userId) redirect(`/patients/${session.$id}/dashboard`);
  if (await getDoctorSession()) redirect("/doctor");

  const patient = await getPatient(userId);
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Raportează o problemă</h1>
        <Link
          href={`/patients/${userId}/dashboard`}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Înapoi la dashboard
        </Link>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Descrie problema întâmpinată în aplicație. Raportul este trimis doar administratorului platformei.
      </p>
      <ReportProblemForm userId={userId} />
    </div>
  );
}
