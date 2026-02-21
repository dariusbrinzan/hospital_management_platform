import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { ensureAppointmentReminders24h } from "@/lib/actions/notification.actions";
import { formatDateTime } from "@/lib/utils";
import { calculateAge } from "@/lib/analysis-reference-ranges";
import { getRoomByDoctor } from "@/lib/hospital-map";
import { StatusBadge } from "@/components/StatusBadge";
import { Doctors } from "@/constants";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { AnalysisResultDisplay } from "@/components/AnalysisResultDisplay";
import { AppointmentReviewButton } from "@/components/AppointmentReviewButton";
import { RescheduleAppointmentButton } from "@/components/RescheduleAppointmentButton";
import { CancelAppointmentButton } from "@/components/CancelAppointmentButton";
import { PastAppointmentsList } from "@/components/PastAppointmentsList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { doctorReviewHelpers } from "@/lib/db-helpers";

const PatientDashboard = async ({ params: { userId } }: SearchParamProps) => {
  const session = await requireAuth();
  
  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/dashboard`);
  }

  await ensureAppointmentReminders24h(userId);

  const user = await getUser(userId);
  const patient = await getPatient(userId);
  const appointments = await getPatientAppointments(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  const patientReviews = doctorReviewHelpers.getByPatientId(patient.$id);
  const reviewsByAppointment = new Map(
    patientReviews.map((r) => [r.appointmentId, r])
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
            <Link
              href={`/patients/${userId}/medical-history`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Istoric Medical
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
              href={`/patients/${userId}/hospital-map`}
              className="text-14-medium text-dark-600 hover:text-dark-700"
            >
              Hartă Spital
            </Link>
            <Link
              href={`/patients/${userId}/new-appointment`}
              className="text-14-medium text-green-500 hover:text-green-600"
            >
              Programare nouă
            </Link>
            <NotificationsDropdown userId={userId} />
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/user.svg"
                height={24}
                width={24}
                alt="user"
                className="size-6"
              />
              <p className="text-14-medium">{patient.name}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="header mb-2">Bun venit, {patient.name}! 👋</h1>
              <p className="text-dark-600">
                Aici poți vedea toate informațiile despre contul tău, programările tale și istoricul medical.
              </p>
            </div>
            <a
              href={`/api/pdf/patient/${patient.$id}`}
              download
              className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-14-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descarcă dosar PDF
            </a>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-dark-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/assets/icons/appointments.svg"
                height={32}
                width={32}
                alt="appointments"
                className="size-8"
              />
              <h2 className="text-32-bold text-dark-700">
                {appointments.upcoming.length}
              </h2>
            </div>
            <p className="text-14-regular text-dark-600 mt-2">
              Programări viitoare
            </p>
          </div>

          <div className="rounded-lg border border-dark-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/assets/icons/pending.svg"
                height={32}
                width={32}
                alt="pending"
                className="size-8"
              />
              <h2 className="text-32-bold text-dark-700">
                {appointments.past.length}
              </h2>
            </div>
            <p className="text-14-regular text-dark-600 mt-2">
              Programări trecute
            </p>
          </div>

          <div className="rounded-lg border border-dark-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/assets/icons/appointments.svg"
                height={32}
                width={32}
                alt="total"
                className="size-8"
              />
              <h2 className="text-32-bold text-dark-700">
                {appointments.all.length}
              </h2>
            </div>
            <p className="text-14-regular text-dark-600 mt-2">
              Total programări
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Patient Information */}
          <section className="lg:col-span-1">
            <div className="rounded-lg border border-dark-200 bg-white p-6">
              <h2 className="sub-header mb-6">Informații Personale</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Nume complet</p>
                  <p className="text-14-regular text-dark-700">{patient.name}</p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Email</p>
                  <p className="text-14-regular text-dark-700">{patient.email}</p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Telefon</p>
                  <p className="text-14-regular text-dark-700">{patient.phone}</p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Data nașterii</p>
                  <p className="text-14-regular text-dark-700">
                    {formatDateTime(patient.birthDate).dateOnly}
                  </p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Gen</p>
                  <p className="text-14-regular text-dark-700">{patient.gender}</p>
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
                  <p className="text-12-medium text-dark-500 mb-1">Medic de familie</p>
                  <p className="text-14-regular text-dark-700">{patient.primaryPhysician}</p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Furnizor asigurare</p>
                  <p className="text-14-regular text-dark-700">{patient.insuranceProvider}</p>
                </div>
                
                <div>
                  <p className="text-12-medium text-dark-500 mb-1">Număr poliță</p>
                  <p className="text-14-regular text-dark-700">{patient.insurancePolicyNumber}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Appointments Section */}
          <section className="lg:col-span-2">
            {/* Upcoming Appointments */}
            <div className="mb-6 rounded-lg border border-dark-200 bg-white p-6">
              <h2 className="sub-header mb-4">Programări Viitoare</h2>
              
              {appointments.upcoming.length === 0 ? (
                <p className="text-14-regular text-dark-500">
                  Nu ai programări viitoare.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.upcoming.map((appointment: any) => {
                    const doctor = Doctors.find(
                      (doc) => doc.name === appointment.primaryPhysician
                    );
                    const appointmentRoom = getRoomByDoctor(appointment.primaryPhysician);

                    return (
                      <div
                        key={appointment.$id}
                        className="rounded-lg border border-dark-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={
                                appointmentRoom
                                  ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                                  : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                              }
                              className="mb-3 flex items-center gap-3 rounded-lg p-2 -ml-2 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              title={
                                appointmentRoom
                                  ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor} — click pentru locație pe hartă`
                                  : "Deschide harta spitalului"
                              }
                            >
                              {doctor && (
                                <Image
                                  src={doctor.image}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="size-10 flex-shrink-0 rounded-full border border-dark-200"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-16-semibold text-dark-700">
                                  {appointment.primaryPhysician}
                                </p>
                                {doctor?.specialty && (
                                  <p className="text-14-medium text-green-500">
                                    {doctor.specialty}
                                  </p>
                                )}
                                <p className="text-14-regular text-dark-500">
                                  {formatDateTime(appointment.schedule).dateTime}
                                </p>
                                <span className="mt-1 inline-block text-xs text-dark-400">
                                  {appointmentRoom
                                    ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor} · click pentru hartă`
                                    : "Click pentru hartă"}
                                </span>
                              </div>
                            </Link>
                            
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
                            
                            {appointment.analysisResults && (
                              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-14-semibold text-green-700 mb-3">
                                  Rezultate Analize:
                                </p>
                                {(() => {
                                  try {
                                    const results = JSON.parse(appointment.analysisResults);
                                    if (Array.isArray(results) && results.length > 0) {
                                      return (
                                        <div className="space-y-3">
                                          {results.map((result: any, index: number) => (
                                            <div key={index} className="border-b border-green-200 pb-3 last:border-0 last:pb-0">
                                              <p className="text-14-semibold text-dark-700 mb-1">
                                                {result.testName}
                                              </p>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-14-regular text-dark-600">
                                                <p>
                                                  <span className="font-medium">Valoare:</span> {result.value}
                                                  {result.unit && ` ${result.unit}`}
                                                </p>
                                                {result.referenceRange && (
                                                  <p>
                                                    <span className="font-medium">Referință:</span> {result.referenceRange}
                                                  </p>
                                                )}
                                              </div>
                                              {result.notes && (
                                                <p className="text-14-regular text-dark-600 mt-1">
                                                  <span className="font-medium">Observații:</span> {result.notes}
                                                </p>
                                              )}
                                            </div>
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

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dark-100 pt-3">
                              {appointment.status !== "cancelled" && (
                                <>
                                  <RescheduleAppointmentButton
                                    appointment={appointment}
                                    userId={userId}
                                  />
                                  <CancelAppointmentButton
                                    appointment={appointment}
                                    userId={userId}
                                  />
                                </>
                              )}
                              <Link
                                href={
                                  appointmentRoom
                                    ? `/patients/${userId}/hospital-map?floor=${appointmentRoom.floor}&roomId=${encodeURIComponent(appointmentRoom.id)}`
                                    : `/patients/${userId}/hospital-map?search=${encodeURIComponent(appointment.primaryPhysician)}`
                                }
                                className="inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-14-medium text-green-700 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>
                                  {appointmentRoom
                                    ? `Cabinet ${appointmentRoom.roomNumber}, Etaj ${appointmentRoom.floor}`
                                    : "Vezi pe hartă"}
                                </span>
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0"><StatusBadge status={appointment.status} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Appointments - cu filtre și paginare */}
            <div className="rounded-lg border border-dark-200 bg-white p-6">
              <h2 className="sub-header mb-4">Istoric Programări</h2>
              <PastAppointmentsList
                past={appointments.past}
                userId={userId}
                patientReviews={patientReviews}
              />
            </div>
          </section>
        </div>

        {/* Medical History Section */}
        <section className="mt-8 rounded-lg border border-dark-200 bg-white p-6">
          <h2 className="sub-header mb-6">Istoric Medical</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          
          {!patient.allergies && !patient.currentMedication && !patient.familyMedicalHistory && !patient.pastMedicalHistory && (
            <p className="text-14-regular text-dark-500">
              Nu există informații medicale înregistrate.
            </p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-14-regular text-dark-500 text-center">
            © 2026 eHealth.ro
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PatientDashboard;
