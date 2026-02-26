import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { LabImportForm } from "@/components/LabImportForm";

export const dynamic = "force-dynamic";

export default async function AdminLabImportPage() {
  await requireAdmin();
  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-8">
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
          <h1 className="text-16-semibold">Import rezultate laborator (CSV)</h1>
        </div>
      </header>

      <main className="admin-main">
        <p className="mb-6 text-14-regular text-dark-600">
          Încarcă un fișier CSV cu coloane: <strong>testName</strong> (obligatoriu), testCategory, resultValue, unit, referenceRange, status, notes.
          Rezultatele vor fi legate de pacientul selectat și opțional de o programare.
        </p>
        <LabImportForm />
      </main>
    </div>
  );
}
