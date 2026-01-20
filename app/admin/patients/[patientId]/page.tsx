import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatientById } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { calculateAge } from "@/lib/analysis-reference-ranges";
import { Doctors } from "@/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { LogoLink } from "@/components/LogoLink";
import { AnalysisResultDisplay } from "@/components/AnalysisResultDisplay";
import { MedicalDocumentsManager } from "@/components/MedicalDocumentsManager";

const PatientDetailsPage = async ({ params: { patientId } }: SearchParamProps) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    redirect("/admin");
  }

  // Obține programările pacientului
  const appointments = await getPatientAppointments(patient.userId);
  const doctor = Doctors.find((d) => d.name === patient.primaryPhysician);

  // Calculează vârsta
  const calculateAge = (birthDate: Date | string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.birthDate);
  const bmi = patient.height && patient.weight 
    ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
    : null;

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

      {/* Patient Header */}
      <section className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-green-500 bg-green-50">
            <span className="text-32-bold text-green-500">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="header">{patient.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-14-regular text-dark-600">
              <p>Email: {patient.email}</p>
              <p>Telefon: {patient.phone}</p>
              {age && <p>Vârstă: {age} ani</p>}
              {patient.gender && <p>Gen: {patient.gender}</p>}
            </div>
          </div>
          {doctor && (
            <div className="text-right">
              <p className="text-14-medium text-dark-700">Medic de familie</p>
              <p className="text-16-semibold">{doctor.name}</p>
              <p className="text-14-regular text-green-500">{doctor.specialty}</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Details */}
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
            <h2 className="sub-header mb-4">Informații Personale</h2>
            <div className="space-y-3">
              <div>
                <p className="text-12-medium text-dark-500 mb-1">Data nașterii</p>
                <p className="text-14-regular text-dark-700">
                  {formatDateTime(patient.birthDate).dateOnly}
                </p>
              </div>
              <div>
                <p className="text-12-medium text-dark-500 mb-1">Adresă</p>
                <p className="text-14-regular text-dark-700">{patient.address}</p>
              </div>
              <div>
                <p className="text-12-medium text-dark-500 mb-1">Ocupație</p>
                <p className="text-14-regular text-dark-700">{patient.occupation}</p>
              </div>
              <div>
                <p className="text-12-medium text-dark-500 mb-1">Contact urgență</p>
                <p className="text-14-regular text-dark-700">
                  {patient.emergencyContactName}
                </p>
                <p className="text-14-regular text-dark-700">
                  {patient.emergencyContactNumber}
                </p>
              </div>
              <div>
                <p className="text-12-medium text-dark-500 mb-1">Asigurător</p>
                <p className="text-14-regular text-dark-700">{patient.insuranceProvider}</p>
                <p className="text-14-regular text-dark-700">
                  Poliță: {patient.insurancePolicyNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
            <h2 className="sub-header mb-4">Parametri Vitali</h2>
            <div className="space-y-3">
              {patient.bloodType && (
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Grupă sanguină</p>
                  <p className="text-14-regular text-dark-700">{patient.bloodType}</p>
                </div>
              )}
              {patient.height && (
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Înălțime</p>
                  <p className="text-14-regular text-dark-700">{patient.height} cm</p>
                </div>
              )}
              {patient.weight && (
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Greutate</p>
                  <p className="text-14-regular text-dark-700">{patient.weight} kg</p>
                </div>
              )}
              {bmi && (
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">IMC (BMI)</p>
                  <p className="text-14-regular text-dark-700">{bmi}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle */}
          {(patient.smokingStatus || patient.alcoholConsumption || patient.exerciseFrequency) && (
            <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
              <h2 className="sub-header mb-4">Stil de Viață</h2>
              <div className="space-y-3">
                {patient.smokingStatus && (
                  <div>
                    <p className="text-12-medium text-dark-500 mb-1">Status fumat</p>
                    <p className="text-14-regular text-dark-700">{patient.smokingStatus}</p>
                  </div>
                )}
                {patient.alcoholConsumption && (
                  <div>
                    <p className="text-12-medium text-dark-500 mb-1">Consum alcool</p>
                    <p className="text-14-regular text-dark-700">{patient.alcoholConsumption}</p>
                  </div>
                )}
                {patient.exerciseFrequency && (
                  <div>
                    <p className="text-12-medium text-dark-500 mb-1">Exerciții fizice</p>
                    <p className="text-14-regular text-dark-700">{patient.exerciseFrequency}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Medical History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Conditions */}
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
            <h2 className="sub-header mb-4">Condiții Medicale</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {patient.allergies && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Alergii</p>
                  <p className="text-14-regular text-dark-600">{patient.allergies}</p>
                </div>
              )}
              {patient.currentMedication && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Medicație Curentă</p>
                  <p className="text-14-regular text-dark-600">{patient.currentMedication}</p>
                </div>
              )}
              {patient.cardiovascularDiseases && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Boli Cardiovasculare</p>
                  <p className="text-14-regular text-dark-600">{patient.cardiovascularDiseases}</p>
                </div>
              )}
              {patient.chronicDiseases && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Boli Cronice</p>
                  <p className="text-14-regular text-dark-600">{patient.chronicDiseases}</p>
                </div>
              )}
              {patient.surgeries && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Intervenții Chirurgicale</p>
                  <p className="text-14-regular text-dark-600">{patient.surgeries}</p>
                </div>
              )}
              {patient.vaccinations && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Vaccinări</p>
                  <p className="text-14-regular text-dark-600">{patient.vaccinations}</p>
                </div>
              )}
              {patient.familyMedicalHistory && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Istoric Medical Familial</p>
                  <p className="text-14-regular text-dark-600">{patient.familyMedicalHistory}</p>
                </div>
              )}
              {patient.pastMedicalHistory && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Istoric Medical Personal</p>
                  <p className="text-14-regular text-dark-600">{patient.pastMedicalHistory}</p>
                </div>
              )}
            </div>
            {!patient.allergies && !patient.currentMedication && !patient.cardiovascularDiseases && 
             !patient.chronicDiseases && !patient.surgeries && !patient.vaccinations && 
             !patient.familyMedicalHistory && !patient.pastMedicalHistory && (
              <p className="text-14-regular text-dark-500">
                Nu există informații medicale înregistrate.
              </p>
            )}
          </div>

          {/* Appointments History */}
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
            <h2 className="sub-header mb-4">Istoric Programări</h2>
            {appointments.all.length === 0 ? (
              <p className="text-14-regular text-dark-500">
                Nu există programări înregistrate.
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.all.map((appointment: any) => {
                  const appointmentDoctor = Doctors.find(
                    (d) => d.name === appointment.primaryPhysician
                  );
                  
                  return (
                    <div
                      key={appointment.$id}
                      className="rounded-lg border border-dark-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            {appointmentDoctor && (
                              <Image
                                src={appointmentDoctor.image}
                                alt="doctor"
                                width={40}
                                height={40}
                                className="size-10 rounded-full border border-dark-200"
                              />
                            )}
                            <div>
                              <p className="text-16-semibold text-dark-700">
                                {appointment.primaryPhysician}
                              </p>
                              {appointmentDoctor?.specialty && (
                                <p className="text-14-medium text-green-500">
                                  {appointmentDoctor.specialty}
                                </p>
                              )}
                              <p className="text-14-regular text-dark-500">
                                {formatDateTime(appointment.schedule).dateTime}
                              </p>
                            </div>
                          </div>
                          
                          {appointment.reason && (
                            <p className="text-14-regular text-dark-600 mb-1">
                              <span className="font-medium">Motiv:</span> {appointment.reason}
                            </p>
                          )}
                          
                          {appointment.note && (
                            <p className="text-14-regular text-dark-600 mb-1">
                              <span className="font-medium">Notă:</span> {appointment.note}
                            </p>
                          )}
                          
                          {appointment.cancellationReason && (
                            <p className="text-14-regular text-red-600 mb-1">
                              <span className="font-medium">Motiv anulare:</span> {appointment.cancellationReason}
                            </p>
                          )}
                          
                          {appointment.analysisResults && (
                            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-14-semibold text-green-700 mb-3">
                                Rezultate Analize:
                              </p>
                              {(() => {
                                try {
                                  const results = JSON.parse(appointment.analysisResults);
                                  if (Array.isArray(results) && results.length > 0) {
                                    const patientAge = calculateAge(patient.birthDate);
                                    const patientInfo = {
                                      age: patientAge,
                                      gender: patient.gender as "Bărbat" | "Femeie",
                                      weight: patient.weight || undefined,
                                    };

                                    return (
                                      <div className="space-y-3">
                                        {results.map((result: any, index: number) => (
                                          <AnalysisResultDisplay
                                            key={index}
                                            result={result}
                                            patientInfo={patientInfo}
                                          />
                                        ))}
                                      </div>
                                    );
                                  }
                                } catch {
                                  // Dacă nu este JSON, afișează ca text simplu
                                  return (
                                    <p className="text-14-regular text-dark-700 whitespace-pre-wrap">
                                      {appointment.analysisResults}
                                    </p>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                        
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documente Medicale */}
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
            <MedicalDocumentsManager
              patientId={patientId}
              canUpload={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
