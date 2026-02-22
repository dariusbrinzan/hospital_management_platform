import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import { problemReportsHelpers } from "@/lib/db-helpers";
import { ProblemReportsList } from "@/components/ProblemReportsList";

export const dynamic = "force-dynamic";

export default async function AdminProblemReportsPage() {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/doctor");

  const reports = problemReportsHelpers.getAll();

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-8">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={200}
            alt="eHealth.ro logo"
            className="h-8 w-fit"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-14-medium text-dark-600 hover:text-dark-700">
            ← Înapoi la Dashboard
          </Link>
          <h1 className="text-16-semibold">Raportări probleme (pacienți)</h1>
        </div>
      </header>

      <main className="admin-main">
        <p className="text-14-regular text-dark-600 mb-4">
          Rapoarte trimise de pacienți către administrator. Doar administratorul are acces la această pagină.
        </p>
        <ProblemReportsList reports={reports} />
      </main>
    </div>
  );
}
