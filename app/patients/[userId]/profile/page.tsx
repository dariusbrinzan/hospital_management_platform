import { redirect } from "next/navigation";
import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { allergyHelpers, prescriptionHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";
import { calculateAge } from "@/lib/analysis-reference-ranges";
import { MedicalProfileEditor } from "@/components/profile/MedicalProfileEditor";
import { AllergyManager } from "@/components/profile/AllergyManager";
import { LifestyleEditor } from "@/components/profile/LifestyleEditor";
import { ContactInfoEditor } from "@/components/profile/ContactInfoEditor";
import { CurrentMedicationEditor } from "@/components/profile/CurrentMedicationEditor";

const ProfilePage = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/profile`);
  }

  const user = await getUser(userId);
  const patient = await getPatient(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  const patientId = (patient as any).$id || (patient as any).id;
  const allergies = allergyHelpers.getByPatientId(patientId);
  const activePrescriptions = prescriptionHelpers.getActiveByPatientId(patientId);
  const age = calculateAge(patient.birthDate);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Patient Header Card */}
        <div className="mb-8 rounded-xl border border-dark-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-50 text-3xl font-bold text-green-600">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-28-bold text-dark-900">{patient.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-14-regular text-dark-500">
                <span>{patient.gender}, {age} ani</span>
                <span>Născut: {formatDateTime(patient.birthDate).dateOnly}</span>
                {patient.occupation && <span>Ocupație: {patient.occupation}</span>}
                {(patient as any).primaryPhysician && (
                  <span>Medic: {(patient as any).primaryPhysician}</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {(patient as any).bloodType && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-12-semibold text-red-700">
                    {(patient as any).bloodType}
                  </span>
                )}
                {(patient as any).insuranceProvider && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-12-semibold text-blue-700">
                    {(patient as any).insuranceProvider}
                  </span>
                )}
                <span className="rounded-full bg-green-50 px-3 py-1 text-12-semibold text-green-700">
                  {allergies.filter((a: any) => a.status === "active").length} alergii active
                </span>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-12-semibold text-purple-700">
                  {activePrescriptions.length} prescripții active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Contact Info */}
          <ContactInfoEditor
            patientId={patientId}
            patient={{
              phone: patient.phone,
              email: patient.email,
              address: patient.address,
              emergencyContactName: (patient as any).emergencyContactName,
              emergencyContactNumber: (patient as any).emergencyContactNumber,
            }}
          />

          {/* Medical Profile */}
          <MedicalProfileEditor
            patientId={patientId}
            patient={{
              bloodType: (patient as any).bloodType,
              height: (patient as any).height,
              weight: (patient as any).weight,
              allergies: (patient as any).allergies,
              currentMedication: (patient as any).currentMedication,
              chronicDiseases: (patient as any).chronicDiseases,
              cardiovascularDiseases: (patient as any).cardiovascularDiseases,
              pastMedicalHistory: (patient as any).pastMedicalHistory,
              familyMedicalHistory: (patient as any).familyMedicalHistory,
              surgeries: (patient as any).surgeries,
            }}
          />

          {/* Allergies */}
          <AllergyManager
            patientId={patientId}
            allergies={allergies}
          />

          {/* Current Medication */}
          <CurrentMedicationEditor
            activePrescriptions={activePrescriptions}
            currentMedicationText={(patient as any).currentMedication || ""}
          />

          {/* Lifestyle */}
          <LifestyleEditor
            patientId={patientId}
            patient={{
              smokingStatus: (patient as any).smokingStatus,
              alcoholConsumption: (patient as any).alcoholConsumption,
              exerciseFrequency: (patient as any).exerciseFrequency,
            }}
          />
        </div>
    </div>
  );
};

export default ProfilePage;
