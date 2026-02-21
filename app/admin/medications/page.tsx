import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { medicationStockHelpers } from "@/lib/db-helpers";
import { MedicationStockDashboard } from "@/components/MedicationStockDashboard";

const MedicationsPage = async () => {
  if (await getDoctorSession()) redirect("/admin");
  const allStocks = medicationStockHelpers.getAll();
  const lowStock = medicationStockHelpers.getLowStock();
  const emergencyStocks = medicationStockHelpers.getAll("emergency_department");
  const icuStocks = medicationStockHelpers.getAll("icu_ward");

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
          <h1 className="text-16-semibold">💊 Management Stocuri Medicamente</h1>
        </div>
      </header>

      <main className="admin-main">
        <MedicationStockDashboard
          allStocks={allStocks}
          lowStock={lowStock}
          emergencyStocks={emergencyStocks}
          icuStocks={icuStocks}
        />
      </main>
    </div>
  );
};

export default MedicationsPage;
