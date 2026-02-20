import Image from "next/image";
import Link from "next/link";
import { ReportsDashboard } from "@/components/ReportsDashboard";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col space-y-8">
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
          <h1 className="text-16-semibold">Rapoarte și statistici</h1>
        </div>
      </header>

      <main className="admin-main">
        <ReportsDashboard />
      </main>
    </div>
  );
}
