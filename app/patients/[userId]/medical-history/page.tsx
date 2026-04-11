import { redirect } from "next/navigation";

import { MedicalDocumentsManager } from "@/components/MedicalDocumentsManager";
import { MedicalHistorySummary } from "@/components/MedicalHistorySummary";
import { MedicalHistoryWithFilters } from "@/components/MedicalHistoryWithFilters";
import { MedicationAdministrationTimeline } from "@/components/MedicationAdministrationTimeline";
import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { calculateAge } from "@/lib/analysis-reference-ranges";
import {
  allergyHelpers,
  appointmentHelpers,
  familyHistoryHelpers,
  labResultHelpers,
  medicalRecordHelpers,
  patientMedicationAdministrationHelpers,
  vaccinationHelpers,
  vitalSignsHelpers,
} from "@/lib/db-helpers";

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
  const medicationAdministrations = patientMedicationAdministrationHelpers.getByPatientId(patientId);
  
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
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Timeline cu filtre și paginare */}
        <div className="mt-8">
          <MedicalHistoryWithFilters
            medicalRecords={medicalRecords}
            allergies={allergies}
            vaccinations={vaccinations}
            familyHistory={familyHistory}
            analysisGroups={allAnalysisGroups}
            patientInfo={patientInfo}
          />
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 text-24-bold text-dark-900 dark:text-slate-100">Medicație administrată în spital</h2>
          <p className="mb-4 text-14-regular text-dark-600 dark:text-slate-400">
            Poți urmări exact ce tratament ți-a fost administrat, la ce oră și dacă s-a întâmplat înainte sau după preluarea de către medic.
          </p>
          <MedicationAdministrationTimeline
            entries={medicationAdministrations}
            emptyMessage="Nu există administrări medicamentoase înregistrate încă."
          />
        </div>

        {/* Documente Medicale */}
        <div className="mt-12">
          <MedicalDocumentsManager
            patientId={patientId}
            canUpload={false}
          />
        </div>
    </div>
  );
};

export default MedicalHistoryPage;
