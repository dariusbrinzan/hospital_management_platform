import { ArrowLeft, Mail, Phone, Scissors, Stethoscope, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ConcediuMedicalButton } from "@/components/ConcediuMedicalButton";
import { MedicalLetterButton } from "@/components/MedicalLetterButton";
import { MedicationAdministrationTimeline } from "@/components/MedicationAdministrationTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import {
  allergyHelpers,
  familyHistoryHelpers,
  labResultHelpers,
  medicalRecordHelpers,
  patientMedicationAdministrationHelpers,
  prescriptionHelpers,
  vaccinationHelpers,
} from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";

const calculateAge = (birthDate: Date | string) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default async function DoctorPatientDetailsPage({
  params,
}: {
  params: { patientId: string };
}) {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const patient = await getPatientById(params.patientId);
  if (!patient) redirect("/doctor");

  const appointments = await getPatientAppointments(patient.userId);
  const doctorAppointments = (appointments?.all || [])
    .filter((apt: any) => apt.primaryPhysician === doctorName)
    .sort((a: any, b: any) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());

  if (doctorAppointments.length === 0) {
    redirect("/doctor");
  }

  const structuredAllergies = allergyHelpers.getByPatientId(params.patientId);
  const activePrescriptions = prescriptionHelpers.getActiveByPatientId(params.patientId);
  const medicationAdministrations = patientMedicationAdministrationHelpers.getByPatientId(params.patientId);
  const vaccinations = vaccinationHelpers
    .getByPatientId(params.patientId)
    .sort((a: any, b: any) => new Date(b.administrationDate).getTime() - new Date(a.administrationDate).getTime());
  const familyHistory = familyHistoryHelpers.getByPatientId(params.patientId);
  const labResults = labResultHelpers
    .getByPatientId(params.patientId)
    .sort((a: any, b: any) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime());
  const medicalRecords = medicalRecordHelpers
    .getByPatientId(params.patientId)
    .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const age = calculateAge(patient.birthDate);
  const bmi =
    patient.height && patient.weight
      ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
      : null;

  const nextAppointment = doctorAppointments.find(
    (apt: any) => new Date(apt.schedule).getTime() >= Date.now() && apt.status !== "cancelled"
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/doctor"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-4" />
          Înapoi la dashboard
        </Link>

        {nextAppointment && (
          <Link
            href={`/doctor/messages?appointmentId=${nextAppointment.$id}`}
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
          >
            <Stethoscope className="size-4" />
            Deschide conversația pentru programarea următoare
          </Link>
        )}
      </div>

      <Card className="mb-6 border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                <UserRound className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {patient.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {age} ani · {patient.gender} · Medic curent: {doctorName}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/doctor/surgery?patientId=${params.patientId}`}
                prefetch={false}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-700 hover:bg-teal-100 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-950/50"
              >
                <Scissors className="size-4" />
                Programează intervenție
              </Link>
              <a
                href={`mailto:${patient.email}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Mail className="size-4" />
                Email
              </a>
              <a
                href={`tel:${patient.phone}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Phone className="size-4" />
                Sună pacientul
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Date contact</CardTitle>
              <CardDescription>Informații esențiale pacient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Email:</span> {patient.email}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Telefon:</span> {patient.phone}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Adresă:</span> {patient.address || "Nespecificat"}
              </p>
              <Separator />
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Contact urgență:</span>{" "}
                {patient.emergencyContactName || "-"} ({patient.emergencyContactNumber || "-"})
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Data nașterii:</span>{" "}
                {formatDateTime(patient.birthDate).dateOnly}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Ocupație:</span> {patient.occupation || "Nespecificat"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Parametri rapizi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <span className="font-medium">Grupă sanguină:</span> {patient.bloodType || "-"}
              </p>
              <p>
                <span className="font-medium">Înălțime:</span> {patient.height ? `${patient.height} cm` : "-"}
              </p>
              <p>
                <span className="font-medium">Greutate:</span> {patient.weight ? `${patient.weight} kg` : "-"}
              </p>
              <p>
                <span className="font-medium">BMI:</span> {bmi || "-"}
              </p>
              <Separator />
              <p>
                <span className="font-medium">Fumat:</span> {patient.smokingStatus || "-"}
              </p>
              <p>
                <span className="font-medium">Consum alcool:</span> {patient.alcoholConsumption || "-"}
              </p>
              <p>
                <span className="font-medium">Activitate fizică:</span> {patient.exerciseFrequency || "-"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Administrative / asigurare</CardTitle>
              <CardDescription>Metadate utile în actul medical</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <span className="font-medium">Asigurător:</span> {patient.insuranceProvider || "-"}
              </p>
              <p>
                <span className="font-medium">Poliță:</span> {patient.insurancePolicyNumber || "-"}
              </p>
              <p>
                <span className="font-medium">Act identitate:</span>{" "}
                {[patient.identificationType, patient.identificationNumber].filter(Boolean).join(" / ") || "-"}
              </p>
              <p>
                <span className="font-medium">Consimțământ GDPR:</span>{" "}
                {patient.privacyConsent ? "Da" : "Nu"}
              </p>
              <p>
                <span className="font-medium">Înregistrat în sistem:</span>{" "}
                {patient.createdAt ? formatDateTime(patient.createdAt).dateTime : "-"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-200/80 shadow-sm dark:border-rose-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-rose-700 dark:text-rose-300">Alergii și riscuri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {structuredAllergies.length === 0 && !patient.allergies ? (
                <p className="text-slate-600 dark:text-slate-400">Nu există alergii raportate.</p>
              ) : (
                <>
                  {structuredAllergies.map((item: any) => (
                    <div key={item.$id} className="rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-900/50 dark:bg-rose-900/20">
                      <p className="font-medium text-rose-700 dark:text-rose-300">{item.allergenName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Severitate: {item.severity} · Status: {item.status}
                      </p>
                    </div>
                  ))}
                  {patient.allergies && (
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Notițe text:</span> {patient.allergies}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Medicație administrată pacientului</CardTitle>
              <CardDescription>
                Istoricul complet al tratamentelor administrate, inclusiv intervalele orare și etapa clinică.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicationAdministrationTimeline
                entries={medicationAdministrations}
                emptyMessage="Nu există administrări medicamentoase înregistrate pentru acest pacient."
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Condiții medicale generale</CardTitle>
              <CardDescription>Informații cronice relevante pentru consult</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Boli cardiovasculare</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {patient.cardiovascularDiseases || "-"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Boli cronice</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{patient.chronicDiseases || "-"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intervenții chirurgicale</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{patient.surgeries || "-"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Istoric medical personal</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{patient.pastMedicalHistory || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Documente pentru pacient</CardTitle>
              <CardDescription>Scrisoare medicală sau concediu medical — PDF descărcabil</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <MedicalLetterButton
                patientId={params.patientId}
                patientName={patient.name}
                defaultDoctorName={doctorName}
              />
              <ConcediuMedicalButton
                patientId={params.patientId}
                patientName={patient.name}
                defaultDoctorName={doctorName}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Programări cu tine</CardTitle>
              <CardDescription>Istoric și status pentru pacientul curent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {doctorAppointments.map((appointment: any) => (
                <div key={appointment.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatDateTime(appointment.schedule).dateTime}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Motiv: {appointment.reason || "Nespecificat"}
                      </p>
                      {appointment.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.note}</p>
                      )}
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Medicație activă</CardTitle>
              <CardDescription>Rețete active utile în consultul curent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePrescriptions.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Nu există rețete active.</p>
              ) : (
                activePrescriptions.map((rx: any) => (
                  <div key={rx.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rx.medicationName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rx.dosage} · {rx.frequency}
                    </p>
                    {rx.instructions && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rx.instructions}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Istoric familial + vaccinări</CardTitle>
              <CardDescription>Context preventiv și predispoziții</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Istoric familial</p>
                {familyHistory.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nu există înregistrări structurate.</p>
                ) : (
                  <div className="space-y-2">
                    {familyHistory.map((fh: any) => (
                      <div key={fh.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {fh.condition} · {fh.relation}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {fh.status || "status neprecizat"}
                          {fh.ageOfOnset ? ` · debut la ${fh.ageOfOnset} ani` : ""}
                        </p>
                        {fh.notes && (
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{fh.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {patient.familyMedicalHistory && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Notițe text:</span> {patient.familyMedicalHistory}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Vaccinări</p>
                {vaccinations.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nu există vaccinări structurate.</p>
                ) : (
                  <div className="space-y-2">
                    {vaccinations.slice(0, 8).map((v: any) => (
                      <div key={v.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{v.vaccineName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(v.administrationDate).dateOnly}
                          {v.vaccineType ? ` · ${v.vaccineType}` : ""}
                          {v.nextDoseDate ? ` · următoarea doză: ${formatDateTime(v.nextDoseDate).dateOnly}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Rezultate de laborator recente</CardTitle>
              <CardDescription>Ultimele valori disponibile pentru monitorizare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {labResults.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Nu există rezultate de laborator.</p>
              ) : (
                labResults.slice(0, 12).map((lab: any) => (
                  <div key={lab.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{lab.testName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lab.resultDate ? formatDateTime(lab.resultDate).dateOnly : "-"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Rezultat: {lab.resultValue ?? "-"} {lab.unit || ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Referință: {lab.referenceRange || "-"} · Status: {lab.status || "-"}
                    </p>
                    {lab.interpretation && (
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{lab.interpretation}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle>Ultime consultații (dosar medical)</CardTitle>
              <CardDescription>
                Context clinic pentru decizii mai bune în consultația curentă
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicalRecords.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Nu există consultații înregistrate.</p>
              ) : (
                medicalRecords.slice(0, 6).map((record: any) => (
                  <div key={record.$id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{record.doctorName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(record.visitDate).dateTime}
                      </p>
                    </div>
                    {record.chiefComplaint && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Motiv:</span> {record.chiefComplaint}
                      </p>
                    )}
                    {record.assessment && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Evaluare:</span> {record.assessment}
                      </p>
                    )}
                    {record.plan && (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Plan:</span> {record.plan}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
