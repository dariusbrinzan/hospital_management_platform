import Link from "next/link";
import { User } from "lucide-react";
import { patientHelpers } from "@/lib/db-helpers";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { formatDateTime } from "@/lib/utils";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PatientSearchInput } from "@/components/PatientSearchInput";

const PatientsSearchPage = async ({ searchParams }: SearchParamProps) => {
  await requireAdmin();
  const query = (searchParams?.q as string) || "";

  const patients = query.trim()
    ? patientHelpers.search(query.trim())
    : patientHelpers.getAll();

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <AdminPageLayout
      title="Pacienți"
      description="Căutare pacienți după nume, email, telefon sau CNP. Accesați dosarul medical din listă."
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Căutare pacienți
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Introduceți nume, email, telefon sau CNP pentru a filtra lista.
            </p>
          </CardHeader>
          <CardContent>
            <PatientSearchInput defaultValue={query} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {patients.length} pacient{patients.length !== 1 ? "i" : ""}{" "}
              {query.trim() ? "găsit" : "înregistrat"}
              {patients.length !== 1 ? "i" : ""}
            </h2>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {query.trim()
                    ? "Nu s-au găsit pacienți care să corespundă căutării."
                    : "Toți pacienții vor apărea aici. Folosiți căutarea pentru a filtra."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {patients.map((patient: any) => {
                  const age = calculateAge(patient.birthDate);
                  return (
                    <li key={patient.$id}>
                      <Link
                        href={`/admin/patients/${patient.$id}`}
                        className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-700 dark:hover:bg-teal-950/20"
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                          <span className="text-lg font-semibold">
                            {patient.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {patient.name}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0 text-sm text-slate-500 dark:text-slate-400">
                            <span>Email: {patient.email}</span>
                            <span>Telefon: {patient.phone}</span>
                            {age > 0 && <span>Vârstă: {age} ani</span>}
                            {patient.gender && <span>Gen: {patient.gender}</span>}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                            Vezi dosar →
                          </span>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Înregistrat: {formatDateTime(patient.createdAt).dateOnly}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default PatientsSearchPage;
