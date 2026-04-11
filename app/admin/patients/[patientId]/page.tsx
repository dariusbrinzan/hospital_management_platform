import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AnalysisResultDisplay } from "@/components/AnalysisResultDisplay";
import { LogoLink } from "@/components/LogoLink";
import { MedicalDocumentsManager } from "@/components/MedicalDocumentsManager";
import { MedicalLetterButton } from "@/components/MedicalLetterButton";
import { MedicationAdministrationTimeline } from "@/components/MedicationAdministrationTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Doctors } from "@/constants";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import {
  allergyHelpers,
  doctorReviewHelpers,
  familyHistoryHelpers,
  medicalRecordHelpers,
  patientMedicationAdministrationHelpers,
  prescriptionHelpers,
  vaccinationHelpers,
} from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";

const PatientDetailsPage = async ({ params: { patientId } }: SearchParamProps) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    redirect("/admin/patients");
  }

  // Obține programările pacientului
  const appointments = await getPatientAppointments(patient.userId);
  const doctor = Doctors.find((d) => d.name === patient.primaryPhysician);

  // Obține tot istoricul medical complet
  const medicalRecords = medicalRecordHelpers.getByPatientId(patientId);
  const allergies = allergyHelpers.getByPatientId(patientId);
  const vaccinations = vaccinationHelpers.getByPatientId(patientId);
  const familyHistory = familyHistoryHelpers.getByPatientId(patientId);
  const activePrescriptions = prescriptionHelpers.getActiveByPatientId(patientId);
  const medicationAdministrations = patientMedicationAdministrationHelpers.getByPatientId(patientId);
  const patientReviews = doctorReviewHelpers.getByPatientId(patientId);

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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/patients"
            className="text-14-medium text-green-500 hover:text-green-600"
          >
            ← Înapoi la căutare
          </Link>
        <Link
          href="/admin"
            className="text-14-medium text-dark-500 hover:text-dark-700"
          >
            Dashboard
          </Link>
          <Link
            href={`/admin/imaging?patientId=${patientId}`}
            className="text-14-medium text-teal-600 hover:text-teal-700"
          >
            🩻 Programează investigație imagistică
        </Link>
          <MedicalLetterButton
            patientId={patientId}
            patientName={patient.name}
            defaultDoctorName={doctor?.name}
          />
        </div>
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
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 shadow-lg">
            <h2 className="sub-header mb-4 text-indigo-700">🕒 Medicație administrată pacientului</h2>
            <MedicationAdministrationTimeline
              entries={medicationAdministrations}
              emptyMessage="Nu există administrări medicamentoase înregistrate pentru acest pacient."
            />
          </div>

          {/* Alergii și Reacții Adverse */}
          {allergies.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-lg">
              <h2 className="sub-header mb-4 text-red-700">⚠️ Alergii și Reacții Adverse</h2>
              <div className="space-y-3">
                {allergies.map((allergy: any) => (
                  <div key={allergy.$id} className="rounded-lg border border-red-300 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-16-semibold text-red-700 mb-1">{allergy.allergenName}</p>
                        <div className="flex flex-wrap gap-2 text-14-regular text-dark-600">
                          <span className="px-2 py-1 bg-red-100 rounded">
                            Tip: {allergy.allergenType}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            allergy.severity === 'severe' || allergy.severity === 'life_threatening'
                              ? 'bg-red-200 text-red-800'
                              : allergy.severity === 'moderate'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            Severitate: {allergy.severity}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 rounded">
                            Status: {allergy.status}
                          </span>
                        </div>
                        {allergy.symptoms && (
                          <p className="text-14-regular text-dark-700 mt-2">
                            <span className="font-medium">Simptome:</span> {allergy.symptoms}
                          </p>
                        )}
                        {allergy.notes && (
                          <p className="text-14-regular text-dark-600 mt-1">
                            {allergy.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rețete Active */}
          {activePrescriptions.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-lg">
              <h2 className="sub-header mb-4 text-blue-700">💊 Medicație Curentă (Rețete Active)</h2>
              <div className="space-y-3">
                {activePrescriptions.map((prescription: any) => (
                  <div key={prescription.$id} className="rounded-lg border border-blue-300 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-16-semibold text-blue-700 mb-1">{prescription.medicationName}</p>
                        <div className="grid grid-cols-2 gap-2 text-14-regular text-dark-600">
                          <p><span className="font-medium">Doza:</span> {prescription.dosage}</p>
                          <p><span className="font-medium">Frecvență:</span> {prescription.frequency}</p>
                          {prescription.route && (
                            <p><span className="font-medium">Cale:</span> {prescription.route}</p>
                          )}
                          {prescription.quantity && (
                            <p><span className="font-medium">Cantitate:</span> {prescription.quantity}</p>
                          )}
                        </div>
                        {prescription.instructions && (
                          <p className="text-14-regular text-dark-700 mt-2">
                            <span className="font-medium">Instrucțiuni:</span> {prescription.instructions}
                          </p>
                        )}
                        <p className="text-14-regular text-dark-500 mt-2">
                          Început: {formatDateTime(prescription.startDate).dateOnly}
                          {prescription.endDate && ` - Până: ${formatDateTime(prescription.endDate).dateOnly}`}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-14-medium">
                        {prescription.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vaccinări */}
          {vaccinations.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-lg">
              <h2 className="sub-header mb-4 text-green-700">💉 Vaccinări</h2>
              <div className="space-y-3">
                {vaccinations.map((vaccination: any) => (
                  <div key={vaccination.$id} className="rounded-lg border border-green-300 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-16-semibold text-green-700 mb-1">{vaccination.vaccineName}</p>
                        <div className="flex flex-wrap gap-2 text-14-regular text-dark-600">
                          <span className="px-2 py-1 bg-green-100 rounded">
                            Tip: {vaccination.vaccineType || 'N/A'}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 rounded">
                            Data: {formatDateTime(vaccination.administrationDate).dateOnly}
                          </span>
                          {vaccination.nextDoseDate && (
                            <span className="px-2 py-1 bg-yellow-100 rounded">
                              Următoarea doză: {formatDateTime(vaccination.nextDoseDate).dateOnly}
                            </span>
                          )}
                        </div>
                        {vaccination.administeredBy && (
                          <p className="text-14-regular text-dark-600 mt-2">
                            Administrat de: {vaccination.administeredBy}
                          </p>
                        )}
                        {vaccination.notes && (
                          <p className="text-14-regular text-dark-600 mt-1">
                            {vaccination.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Istoric Familial */}
          {familyHistory.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-lg">
              <h2 className="sub-header mb-4 text-purple-700">👨‍👩‍👧‍👦 Istoric Medical Familial</h2>
              <div className="space-y-3">
                {familyHistory.map((fh: any) => (
                  <div key={fh.$id} className="rounded-lg border border-purple-300 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-16-semibold text-purple-700 mb-1">{fh.condition}</p>
                        <div className="flex flex-wrap gap-2 text-14-regular text-dark-600">
                          <span className="px-2 py-1 bg-purple-100 rounded">
                            Rudenie: {fh.relation}
                          </span>
                          {fh.ageOfOnset && (
                            <span className="px-2 py-1 bg-blue-100 rounded">
                              Vârstă debut: {fh.ageOfOnset} ani
                            </span>
                          )}
                          {fh.status && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              Status: {fh.status}
                            </span>
                          )}
                        </div>
                        {fh.notes && (
                          <p className="text-14-regular text-dark-600 mt-2">
                            {fh.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Condiții Medicale Generale */}
          {(patient.allergies || patient.currentMedication || patient.cardiovascularDiseases || 
            patient.chronicDiseases || patient.surgeries || patient.pastMedicalHistory) && (
          <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
              <h2 className="sub-header mb-4">Condiții Medicale Generale</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {patient.allergies && (
                <div>
                    <p className="text-14-semibold text-dark-700 mb-2">Alergii (Text)</p>
                  <p className="text-14-regular text-dark-600">{patient.allergies}</p>
                </div>
              )}
              {patient.currentMedication && (
                <div>
                    <p className="text-14-semibold text-dark-700 mb-2">Medicație Curentă (Text)</p>
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
              {patient.pastMedicalHistory && (
                <div>
                  <p className="text-14-semibold text-dark-700 mb-2">Istoric Medical Personal</p>
                  <p className="text-14-regular text-dark-600">{patient.pastMedicalHistory}</p>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Consultații Medicale Complete */}
          {medicalRecords.length > 0 && (
            <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
              <h2 className="sub-header mb-4">📋 Consultații Medicale</h2>
              <div className="space-y-6">
                {medicalRecords.map((record: any) => (
                  <div key={record.$id} className="rounded-lg border border-dark-200 p-5">
                    <div className="mb-4 flex items-start justify-between border-b border-dark-200 pb-3">
                      <div>
                        <p className="text-18-semibold text-dark-700">{record.doctorName}</p>
              <p className="text-14-regular text-dark-500">
                          {formatDateTime(record.visitDate).dateTime}
                        </p>
                        {record.recordType && (
                          <span className="mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-12-medium">
                            {record.recordType}
                          </span>
                        )}
                      </div>
                    </div>

                    {record.chiefComplaint && (
                      <div className="mb-3">
                        <p className="text-14-semibold text-dark-700 mb-1">Motiv Consultație:</p>
                        <p className="text-14-regular text-dark-600">{record.chiefComplaint}</p>
                      </div>
                    )}

                    {record.subjectiveNotes && (
                      <div className="mb-3">
                        <p className="text-14-semibold text-dark-700 mb-1">Simptome (Subiectiv):</p>
                        <p className="text-14-regular text-dark-600">{record.subjectiveNotes}</p>
                      </div>
                    )}

                    {record.objectiveFindings && (
                      <div className="mb-3">
                        <p className="text-14-semibold text-dark-700 mb-1">Observații Clinice (Obiiectiv):</p>
                        <p className="text-14-regular text-dark-600">{record.objectiveFindings}</p>
                      </div>
                    )}

                    {/* Diagnosticuri */}
                    {record.diagnoses && record.diagnoses.length > 0 && (
                      <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <p className="text-14-semibold text-orange-700 mb-2">🔍 Diagnosticuri:</p>
                        <div className="space-y-2">
                          {record.diagnoses.map((diagnosis: any) => (
                            <div key={diagnosis.$id} className="rounded bg-white p-2">
                              <p className="text-14-semibold text-dark-700">{diagnosis.diagnosisName}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {diagnosis.diagnosisCode && (
                                  <span className="text-12-regular text-dark-500">
                                    Cod: {diagnosis.diagnosisCode}
                                  </span>
                                )}
                                <span className={`text-12-medium px-2 py-0.5 rounded ${
                                  diagnosis.status === 'active' ? 'bg-red-100 text-red-700' :
                                  diagnosis.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  diagnosis.status === 'chronic' ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {diagnosis.status}
                                </span>
                                <span className="text-12-medium text-dark-500">
                                  Tip: {diagnosis.diagnosisType}
                                </span>
                              </div>
                              {diagnosis.notes && (
                                <p className="text-12-regular text-dark-600 mt-1">{diagnosis.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rețete */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-14-semibold text-blue-700 mb-2">💊 Rețete:</p>
                        <div className="space-y-2">
                          {record.prescriptions.map((prescription: any) => (
                            <div key={prescription.$id} className="rounded bg-white p-2">
                              <p className="text-14-semibold text-dark-700">{prescription.medicationName}</p>
                              <p className="text-12-regular text-dark-600">
                                {prescription.dosage} - {prescription.frequency}
                                {prescription.route && ` (${prescription.route})`}
                              </p>
                              {prescription.instructions && (
                                <p className="text-12-regular text-dark-500 mt-1">
                                  {prescription.instructions}
              </p>
            )}
          </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Semne Vitale */}
                    {record.vitalSigns && (
                      <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="text-14-semibold text-green-700 mb-2">📊 Semne Vitale:</p>
                        <div className="grid grid-cols-2 gap-2 text-14-regular text-dark-700">
                          {record.vitalSigns.bloodPressureSystolic && record.vitalSigns.bloodPressureDiastolic && (
                            <p>Tensiune: {record.vitalSigns.bloodPressureSystolic}/{record.vitalSigns.bloodPressureDiastolic} mmHg</p>
                          )}
                          {record.vitalSigns.pulse && <p>Puls: {record.vitalSigns.pulse} bpm</p>}
                          {record.vitalSigns.temperature && <p>Temperatură: {record.vitalSigns.temperature}°C</p>}
                          {record.vitalSigns.oxygenSaturation && <p>SpO2: {record.vitalSigns.oxygenSaturation}%</p>}
                          {record.vitalSigns.respiratoryRate && <p>Frecvență respiratorie: {record.vitalSigns.respiratoryRate}/min</p>}
                          {record.vitalSigns.glucoseLevel && <p>Glicemie: {record.vitalSigns.glucoseLevel} mg/dL</p>}
                          {record.vitalSigns.weight && <p>Greutate: {record.vitalSigns.weight} kg</p>}
                          {record.vitalSigns.height && <p>Înălțime: {record.vitalSigns.height} cm</p>}
                          {record.vitalSigns.bmi && <p>BMI: {record.vitalSigns.bmi.toFixed(1)}</p>}
                        </div>
                      </div>
                    )}

                    {/* Rezultate Analize */}
                    {record.labResults && record.labResults.length > 0 && (
                      <div className="mb-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <p className="text-14-semibold text-purple-700 mb-2">🔬 Rezultate Analize:</p>
                        <div className="space-y-2">
                          {record.labResults.map((lab: any) => (
                            <div key={lab.$id} className="rounded bg-white p-2">
                              <p className="text-14-semibold text-dark-700">{lab.testName}</p>
                              <p className="text-12-regular text-dark-600">
                                {lab.resultValue} {lab.unit}
                                {lab.referenceRange && ` (Referință: ${lab.referenceRange})`}
                              </p>
                              <span className={`text-12-medium px-2 py-0.5 rounded mt-1 inline-block ${
                                lab.status === 'normal' ? 'bg-green-100 text-green-700' :
                                lab.status === 'critical' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {lab.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.assessment && (
                      <div className="mb-3">
                        <p className="text-14-semibold text-dark-700 mb-1">Evaluare:</p>
                        <p className="text-14-regular text-dark-600">{record.assessment}</p>
                      </div>
                    )}

                    {record.plan && (
                      <div className="mb-3">
                        <p className="text-14-semibold text-dark-700 mb-1">Plan de Tratament:</p>
                        <p className="text-14-regular text-dark-600">{record.plan}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <p className="text-14-semibold text-dark-700 mb-1">Note:</p>
                        <p className="text-14-regular text-dark-600">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Evaluări Doctori */}
          {patientReviews.length > 0 && (
            <div className="rounded-lg border border-dark-200 bg-white p-6 shadow-lg">
              <h2 className="sub-header mb-4">Evaluări Doctori ({patientReviews.length})</h2>
              <div className="space-y-3">
                {patientReviews.map((review) => {
                  const reviewDoctor = Doctors.find((d) => d.name === review.doctorName);
                  return (
                    <div key={review.$id} className="rounded-lg border border-dark-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-16-semibold text-dark-700">{review.doctorName}</p>
                          {reviewDoctor?.specialty && (
                            <p className="text-14-regular text-green-500">{reviewDoctor.specialty}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={s <= review.rating ? "#f59e0b" : "none"}
                              stroke={s <= review.rating ? "#f59e0b" : "#9ca3af"}
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                          <span className="ml-1 text-14-medium text-amber-600">{review.rating}/5</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-14-regular text-dark-600 italic">&ldquo;{review.comment}&rdquo;</p>
                      )}
                      <p className="mt-1 text-12-regular text-dark-400">
                        {formatDateTime(review.createdAt).dateTime}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
