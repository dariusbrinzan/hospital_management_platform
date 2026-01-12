import Image from "next/image";
import Link from "next/link";
import { emergencyHelpers } from "@/lib/db-helpers";
import { EmergencyCaseDetails } from "@/components/EmergencyCaseDetails";

const EmergencyCasePage = async ({ params: { caseId } }: SearchParamProps) => {
  const emergencyCase = await emergencyHelpers.getById(caseId);

  if (!emergencyCase) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col space-y-14">
        <header className="admin-header">
          <Link href="/admin/emergency" className="cursor-pointer">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={200}
              alt="eHealth.ro logo"
              className="h-8 w-fit"
            />
          </Link>
          <Link
            href="/admin/emergency"
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi
          </Link>
        </header>
        <main className="admin-main">
          <p className="text-16-semibold">Cazul nu a fost găsit</p>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin/emergency" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={200}
            alt="eHealth.ro logo"
            className="h-8 w-fit"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/emergency"
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi
          </Link>
          <h1 className="text-16-semibold">Caz Urgență - {emergencyCase.patient?.name}</h1>
        </div>
      </header>

      <main className="admin-main">
        <EmergencyCaseDetails emergencyCase={emergencyCase} />
      </main>
    </div>
  );
};

export default EmergencyCasePage;
