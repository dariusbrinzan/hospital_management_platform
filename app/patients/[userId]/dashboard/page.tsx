import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { requireAuth } from "@/lib/actions/auth.actions";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Doctors } from "@/constants";
import { LogoutButton } from "@/components/LogoutButton";
import { LogoLink } from "@/components/LogoLink";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

const PatientDashboard = async ({ params: { userId } }: SearchParamProps) => {
  // Verifică autentificarea
  const session = await requireAuth();
  
  // Verifică dacă userId-ul din URL se potrivește cu sesiunea
  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/dashboard`);
  }

  const user = await getUser(userId);
  const patient = await getPatient(userId);
  const appointments = await getPatientAppointments(userId);

  if (!user) redirect("/");
  if (!patient) redirect(`/patients/${userId}/register`);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-dark-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
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
          <h1 className="header mb-2">Bun venit, {patient.name}! 👋</h1>
          <p className="text-dark-600">
            Aici poți vedea toate informațiile despre contul tău, programările tale și istoricul medical.
          </p>
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
                    
                    return (
                      <div
                        key={appointment.$id}
                        className="rounded-lg border border-dark-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              {doctor && (
                                <Image
                                  src={doctor.image}
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
                                {doctor?.specialty && (
                                  <p className="text-14-medium text-green-500">
                                    {doctor.specialty}
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
                          </div>
                          
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Appointments */}
            <div className="rounded-lg border border-dark-200 bg-white p-6">
              <h2 className="sub-header mb-4">Istoric Programări</h2>
              
              {appointments.past.length === 0 ? (
                <p className="text-14-regular text-dark-500">
                  Nu ai programări trecute.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.past.slice(0, 5).map((appointment: any) => {
                    const doctor = Doctors.find(
                      (doc) => doc.name === appointment.primaryPhysician
                    );
                    
                    return (
                      <div
                        key={appointment.$id}
                        className="rounded-lg border border-dark-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              {doctor && (
                                <Image
                                  src={doctor.image}
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
                                {doctor?.specialty && (
                                  <p className="text-14-medium text-green-500">
                                    {doctor.specialty}
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
                          </div>
                          
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
