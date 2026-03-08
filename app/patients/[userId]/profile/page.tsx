import { redirect } from "next/navigation";
import { Mail, Phone, Cake, User, MapPin, Building2, Stethoscope, Shield } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

        {/* Informații personale – date de contact și asigurare */}
        <Card className="mb-6 border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <User className="size-5 text-teal-600 dark:text-teal-400" />
              Informații personale
            </CardTitle>
            <CardDescription>Date de contact și asigurare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Mail className="size-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{patient.email}</p>
              </div>
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="flex gap-3">
              <Phone className="size-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Telefon</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{patient.phone}</p>
              </div>
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="flex gap-3">
              <Cake className="size-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Data nașterii</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{formatDateTime(patient.birthDate).dateOnly}</p>
              </div>
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="flex gap-3">
              <User className="size-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Gen</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{patient.gender}</p>
              </div>
            </div>
            {patient.address && (
              <>
                <Separator className="bg-slate-100 dark:bg-slate-800" />
                <div className="flex gap-3">
                  <MapPin className="size-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Adresă</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{patient.address}</p>
                  </div>
                </div>
              </>
            )}
            {patient.occupation && (
              <>
                <Separator className="bg-slate-100 dark:bg-slate-800" />
                <div className="flex gap-3">
                  <Building2 className="size-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Ocupație</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{patient.occupation}</p>
                  </div>
                </div>
              </>
            )}
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="flex gap-3">
              <Stethoscope className="size-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Medic de familie</p>
                <p className="text-sm text-slate-900 dark:text-slate-100">{(patient as any).primaryPhysician ?? "—"}</p>
              </div>
            </div>
            {((patient as any).insuranceProvider || (patient as any).insurancePolicyNumber) && (
              <>
                <Separator className="bg-slate-100 dark:bg-slate-800" />
                <div className="flex gap-3">
                  <Shield className="size-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Asigurare</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {(patient as any).insuranceProvider ?? ""}
                      {(patient as any).insurancePolicyNumber && ` · ${(patient as any).insurancePolicyNumber}`}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {/* Contact Info (editabil) */}
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
