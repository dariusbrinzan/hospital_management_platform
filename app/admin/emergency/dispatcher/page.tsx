import Image from "next/image";
import Link from "next/link";
import { ambulanceHelpers, ambulanceMissionHelpers } from "@/lib/db-helpers";
import { DispatcherDashboard } from "@/components/DispatcherDashboard";

const DispatcherPage = async () => {
  const ambulances = ambulanceHelpers.getAll();
  const activeMissions = ambulanceMissionHelpers.getActive();
  const allMissions = ambulanceMissionHelpers.getAll();

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
            ← Înapoi la Urgențe
          </Link>
          <h1 className="text-16-semibold">🚑 Dispecerat Ambulanțe</h1>
        </div>
      </header>

      <main className="admin-main">
        <DispatcherDashboard
          ambulances={ambulances}
          activeMissions={activeMissions}
          allMissions={allMissions}
        />
      </main>
    </div>
  );
};

export default DispatcherPage;
