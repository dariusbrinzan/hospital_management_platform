import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/actions/auth.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { LogoLink } from "@/components/LogoLink";
import { ReportProblemForm } from "@/components/ReportProblemForm";

export default async function ReportProblemPage({ params: { userId } }: SearchParamProps) {
  const session = await requireAuth();
  if (session.$id !== userId) redirect(`/patients/${session.$id}/dashboard`);
  if (await getDoctorSession()) redirect("/admin");

  const patient = await getPatient(userId);
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <LogoLink />
          <Link
            href={`/patients/${userId}/dashboard`}
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi la dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-20-semibold text-dark-900 mb-2">Raportează o problemă</h1>
        <p className="text-14-regular text-dark-600 mb-6">
          Descrie problema întâmpinată în aplicație. Raportul este trimis doar administratorului platformei.
        </p>
        <ReportProblemForm userId={userId} />
      </main>
    </div>
  );
}
