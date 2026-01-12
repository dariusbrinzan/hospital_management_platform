import Image from "next/image";
import Link from "next/link";
import { doctorsOnDutyHelpers } from "@/lib/db-helpers";
import { DoctorsOnDutyManager } from "@/components/DoctorsOnDutyManager";

const DoctorsOnDutyPage = async () => {
  // TODO: Obține lista medicilor de gardă pentru săptămâna curentă
  const currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Luni
  currentWeekStart.setHours(0, 0, 0, 0);
  
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // Duminică
  currentWeekEnd.setHours(23, 59, 59, 999);

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
          <h1 className="text-16-semibold">Medici de Gardă</h1>
        </div>
      </header>

      <main className="admin-main">
        <DoctorsOnDutyManager />
      </main>
    </div>
  );
};

export default DoctorsOnDutyPage;
