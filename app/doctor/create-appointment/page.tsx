import { redirect } from "next/navigation";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { DoctorCreateAppointmentForm } from "@/components/DoctorCreateAppointmentForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorCreateAppointmentPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const appointmentsData = await getRecentAppointmentList(doctorName);
  const allAppointments = appointmentsData?.documents ?? [];

  const patientsMap = new Map<
    string,
    { patientId: string; patientName: string; userId: string }
  >();
  for (const apt of allAppointments) {
    const pid = apt.patient?.$id;
    if (!pid) continue;
    if (!patientsMap.has(pid)) {
      patientsMap.set(pid, {
        patientId: pid,
        patientName: apt.patient?.name ?? "Necunoscut",
        userId: apt.userId,
      });
    }
  }
  const patients = Array.from(patientsMap.values()).sort((a, b) =>
    a.patientName.localeCompare(b.patientName)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Programare (cu opțiune recurentă)</CardTitle>
          <CardDescription>
            Creează o programare pentru un pacient. Bifează „Programare recurentă” și setează intervalul și perioada pentru mai multe programări automate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorCreateAppointmentForm
            doctorName={doctorName}
            patients={patients}
          />
        </CardContent>
      </Card>
    </div>
  );
}
