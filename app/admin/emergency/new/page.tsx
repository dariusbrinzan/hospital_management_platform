import Image from "next/image";
import Link from "next/link";
import { NewEmergencyCaseForm } from "@/components/forms/NewEmergencyCaseForm";

const NewEmergencyCasePage = () => {
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
          <h1 className="text-16-semibold">Caz Nou - Primiri Urgente</h1>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <div>
            <h2 className="header">Adaugă Caz de Urgență</h2>
            <p className="text-dark-600">
              Completează informațiile pentru noul caz de urgență
            </p>
          </div>
        </section>

        <NewEmergencyCaseForm />
      </main>
    </div>
  );
};

export default NewEmergencyCasePage;
