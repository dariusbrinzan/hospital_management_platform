import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { medicalRecordHelpers } from "@/lib/db-helpers";
import { allergyHelpers, vaccinationHelpers, familyHistoryHelpers } from "@/lib/db-helpers";
import { vitalSignsHelpers } from "@/lib/db-helpers";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { MedicalHistoryTimeline } from "@/components/MedicalHistoryTimeline";
import { MedicalHistorySummary } from "@/components/MedicalHistorySummary";

const MedicalHistoryPage = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();
  
  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/medical-history`);
  }

  const user = await getUser(userId);
  const patient = await getPatient(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  // Obține toate datele pentru istoric medical
  // Folosim patient.$id (care este id-ul din tabelul patients)
  const patientId = (patient as any).$id || (patient as any).id;
  const medicalRecords = medicalRecordHelpers.getByPatientId(patientId);
  const allergies = allergyHelpers.getByPatientId(patientId);
  const vaccinations = vaccinationHelpers.getByPatientId(patientId);
  const familyHistory = familyHistoryHelpers.getByPatientId(patientId);
  const vitalSignsHistory = vitalSignsHelpers.getByPatientId(patientId);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
            <Link
              href={`/patients/${userId}/dashboard`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Dashboard
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="text-14-medium text-green-500 hover:text-green-600"
            >
              Programare nouă
            </Link>
            <NotificationsDropdown userId={userId} />
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/user.svg"
                height={24}
                width={24}
                alt="user"
                className="h-6 w-6"
              />
              <span className="text-14-medium text-dark-700">{user.name}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-32-bold text-dark-900 mb-2">Istoric Medical Complet</h1>
          <p className="text-16-regular text-dark-600">
            Vizualizează toate înregistrările medicale, diagnosticuri, rețete și analize
          </p>
        </div>

        {/* Summary Cards */}
        <MedicalHistorySummary
          patient={patient}
          medicalRecords={medicalRecords}
          allergies={allergies}
          vaccinations={vaccinations}
          vitalSignsHistory={vitalSignsHistory}
        />

        {/* Timeline */}
        <div className="mt-8">
          <MedicalHistoryTimeline
            medicalRecords={medicalRecords}
            allergies={allergies}
            vaccinations={vaccinations}
            familyHistory={familyHistory}
          />
        </div>
      </main>
    </div>
  );
};

export default MedicalHistoryPage;
