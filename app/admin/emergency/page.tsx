import Image from "next/image";
import Link from "next/link";

import { emergencyHelpers } from "@/lib/db-helpers";
import { EmergencyKanbanBoard } from "@/components/EmergencyKanbanBoard";

const EmergencyPage = async () => {
  const emergencyCases = await emergencyHelpers.getAll();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
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
          <Link
            href="/admin"
            className="text-14-medium text-dark-600 hover:text-dark-700"
          >
            ← Înapoi la Dashboard
          </Link>
          <h1 className="text-16-semibold">🚨 Primiri Urgente</h1>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="header">Dashboard Primiri Urgente</h2>
              <p className="text-dark-600">
                Gestionați cazurile de urgență și urmăriți progresul pacienților
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/emergency/new"
                className="shad-primary-btn px-6 py-3 rounded-md text-14-medium hover:bg-green-600 transition-colors"
              >
                + Caz Nou
              </Link>
              <Link
                href="/admin/emergency/doctors"
                className="shad-gray-btn px-6 py-3 rounded-md text-14-medium hover:bg-dark-100 transition-colors"
              >
                Medici de Gardă
              </Link>
              <Link
                href="/admin/icu"
                className="shad-primary-btn px-6 py-3 rounded-md text-14-medium hover:bg-blue-600 transition-colors"
              >
                🏥 Dashboard ATI
              </Link>
            </div>
          </div>
        </section>

        <EmergencyKanbanBoard cases={emergencyCases} />
      </main>
    </div>
  );
};

export default EmergencyPage;
