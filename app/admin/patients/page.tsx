import Link from "next/link";

import { LogoLink } from "@/components/LogoLink";
import { patientHelpers } from "@/lib/db-helpers";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { formatDateTime } from "@/lib/utils";
import { PatientSearchInput } from "@/components/PatientSearchInput";

const PatientsSearchPage = async ({ searchParams }: SearchParamProps) => {
  await requireAdmin();
  const query = (searchParams?.q as string) || "";

  // Căutarea se face pe server, direct din baza de date
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
    <div className="mx-auto flex max-w-7xl flex-col space-y-8">
      {/* Header */}
      <header className="admin-header">
        <LogoLink />
        <Link
          href="/admin"
          className="text-14-medium text-green-500 hover:text-green-600"
        >
          ← Înapoi la dashboard
        </Link>
      </header>

      {/* Search Section */}
      <section className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
        <h1 className="header mb-4">Căutare Pacienți</h1>
        <p className="text-dark-600 mb-6">
          Caută pacienți după nume, email, telefon sau CNP pentru a accesa dosarul medical complet.
        </p>
        <PatientSearchInput defaultValue={query} />
      </section>

      {/* Results Section */}
      <section className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-16-regular text-dark-600">
              {query.trim()
                ? "Nu s-au găsit pacienți care să corespundă căutării."
                : "Toți pacienții vor apărea aici. Folosește căutarea pentru a filtra."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="sub-header">
                {patients.length} pacient{patients.length !== 1 ? "i" : ""}{" "}
                {query.trim() ? "găsit" : "înregistrat"}{patients.length !== 1 ? "i" : ""}
              </h2>
            </div>

            <div className="space-y-3">
              {patients.map((patient: any) => {
                const age = calculateAge(patient.birthDate);
                return (
                  <Link
                    key={patient.$id}
                    href={`/admin/patients/${patient.$id}`}
                    className="block rounded-lg border border-dark-200 p-4 hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-50">
                        <span className="text-20-bold text-green-500">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-18-semibold text-dark-700 mb-1">
                          {patient.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-14-regular text-dark-600">
                          <p>Email: {patient.email}</p>
                          <p>Telefon: {patient.phone}</p>
                          {age > 0 && <p>Vârstă: {age} ani</p>}
                          {patient.gender && <p>Gen: {patient.gender}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-14-medium text-green-500">
                          Vezi dosar →
                        </p>
                        <p className="text-12-regular text-dark-500 mt-1">
                          Înregistrat: {formatDateTime(patient.createdAt).dateOnly}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PatientsSearchPage;
