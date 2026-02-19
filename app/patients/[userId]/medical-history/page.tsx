import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { medicalRecordHelpers } from "@/lib/db-helpers";
import { allergyHelpers, vaccinationHelpers, familyHistoryHelpers } from "@/lib/db-helpers";
import { vitalSignsHelpers, labResultHelpers, appointmentHelpers } from "@/lib/db-helpers";
import { medicalDocumentHelpers } from "@/lib/db-helpers";
import { calculateAge } from "@/lib/analysis-reference-ranges";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { MedicalHistoryTimeline } from "@/components/MedicalHistoryTimeline";
import { MedicalHistorySummary } from "@/components/MedicalHistorySummary";
import { MedicalDocumentsManager } from "@/components/MedicalDocumentsManager";

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
  const documents = medicalDocumentHelpers.getByPatientId(patientId);
  
  // Obține analizele din lab_results
  const labResults = labResultHelpers.getByPatientId(patientId);
  
  // Obține analizele din appointments.analysisResults
  const appointments = appointmentHelpers.getByUserId(userId);
  
  // Grupează analizele după appointmentId
  // Pentru analizele din appointments.analysisResults, le grupăm după appointmentId
  const analysisGroupsByAppointment: Map<string, any[]> = new Map();
  
  // Procesează analizele din appointments.analysisResults
  appointments.forEach((apt: any) => {
    if (apt.analysisResults) {
      try {
        const results = JSON.parse(apt.analysisResults);
        if (Array.isArray(results) && results.length > 0) {
          const appointmentAnalyses: any[] = [];
          results.forEach((result: any) => {
            appointmentAnalyses.push({
              $id: `${apt.$id}-${result.testName || Math.random()}`,
              appointmentId: apt.$id,
              testName: result.testName || "Analiză necunoscută",
              testCategory: result.category || null,
              resultValue: result.value || null,
              unit: result.unit || null,
              referenceRange: result.referenceRange || null,
              status: result.status || "normal",
              notes: result.notes || null,
              performedDate: apt.schedule,
              createdAt: apt.createdAt,
              fromAppointment: true,
            });
          });
          if (appointmentAnalyses.length > 0) {
            analysisGroupsByAppointment.set(apt.$id, appointmentAnalyses);
          }
        }
      } catch (e) {
        // Ignoră erorile de parsing
      }
    }
  });
  
  // Grupează analizele din lab_results după appointmentId sau performedDate
  const analysisGroupsByDate: Map<string, any[]> = new Map();
  const appointmentIdsWithAnalyses = new Set(analysisGroupsByAppointment.keys());
  
  labResults.forEach((labResult: any) => {
    // Dacă analiza are appointmentId și acesta este deja în appointments, o ignorăm
    // pentru că este deja inclusă în analysisGroupsByAppointment
    if (labResult.appointmentId && appointmentIdsWithAnalyses.has(labResult.appointmentId)) {
      return; // Skip această analiză, este deja inclusă
    }
    
    const groupKey = labResult.appointmentId 
      ? `appointment-${labResult.appointmentId}`
      : `date-${new Date(labResult.performedDate || labResult.createdAt).toISOString().split('T')[0]}`;
    
    if (!analysisGroupsByDate.has(groupKey)) {
      analysisGroupsByDate.set(groupKey, []);
    }
    analysisGroupsByDate.get(groupKey)!.push(labResult);
  });
  
  // Creează array-ul de grupuri de analize pentru timeline
  const allAnalysisGroups: any[] = [];
  
  // Adaugă grupurile din appointments
  analysisGroupsByAppointment.forEach((analyses, appointmentId) => {
    if (analyses.length > 0) {
      allAnalysisGroups.push({
        $id: `appointment-group-${appointmentId}`,
        type: "analysis-group",
        appointmentId: appointmentId,
        analyses: analyses,
        date: analyses[0]?.performedDate || analyses[0]?.createdAt,
        fromAppointment: true,
      });
    }
  });
  
  // Adaugă grupurile din lab_results (care nu sunt deja în appointments)
  analysisGroupsByDate.forEach((analyses, groupKey) => {
    if (analyses.length > 0) {
      allAnalysisGroups.push({
        $id: `lab-group-${groupKey}`,
        type: "analysis-group",
        appointmentId: analyses[0]?.appointmentId || null,
        analyses: analyses,
        date: analyses[0]?.performedDate || analyses[0]?.createdAt,
        fromAppointment: false,
      });
    }
  });

  // Calculează informații despre pacient pentru intervale de referință
  const patientAge = calculateAge(patient.birthDate);
  const patientInfo = {
    age: patientAge,
    gender: patient.gender as "Bărbat" | "Femeie",
    weight: patient.weight || undefined,
  };

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
              href={`/patients/${userId}/calendar`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Calendar
            </Link>
            <Link
              href={`/patients/${userId}/profile`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Profil Medical
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
          analyses={allAnalysisGroups.flatMap((g) => g.analyses)}
        />

        {/* Timeline */}
        <div className="mt-8">
          <MedicalHistoryTimeline
            medicalRecords={medicalRecords}
            allergies={allergies}
            vaccinations={vaccinations}
            familyHistory={familyHistory}
            analysisGroups={allAnalysisGroups}
            patientInfo={patientInfo}
          />
        </div>

        {/* Documente Medicale */}
        <div className="mt-12">
          <MedicalDocumentsManager
            patientId={patientId}
            canUpload={false}
          />
        </div>
      </main>
    </div>
  );
};

export default MedicalHistoryPage;
