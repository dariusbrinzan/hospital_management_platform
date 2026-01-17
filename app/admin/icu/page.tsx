import Image from "next/image";
import Link from "next/link";
import { icuHelpers } from "@/lib/db-helpers";
import { ICURoomsDashboard } from "@/components/ICURoomsDashboard";

const ICUPage = async () => {
  const rooms = icuHelpers.getAllRooms();
  const patients = icuHelpers.getAllPatients();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image src="/assets/icons/logo-full.svg" height={32} width={200} alt="eHealth.ro logo" className="h-8 w-fit" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-14-medium text-dark-600 hover:text-dark-700">
            ← Înapoi la Dashboard
          </Link>
          <h1 className="text-16-semibold">🏥 Terapie Intensivă (ATI)</h1>
        </div>
      </header>
      <main className="admin-main">
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="header">Dashboard ATI</h2>
              <p className="text-dark-600">Gestionați sălile și pacienții din Terapie Intensivă</p>
            </div>
          </div>
        </section>
        <ICURoomsDashboard rooms={rooms} patients={patients} />
      </main>
    </div>
  );
};

export default ICUPage;
