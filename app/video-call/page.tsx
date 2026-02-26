import { redirect } from "next/navigation";
import Link from "next/link";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { getCurrentSession, getDoctorSession } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { VideoCallRoom } from "@/components/VideoCallRoom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function VideoCallPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { appointmentId } = await searchParams;

  if (!appointmentId) {
    redirect("/");
  }

  const appointment = await getAppointment(appointmentId);
  if (!appointment) {
    redirect("/");
  }

  const patientSession = await getCurrentSession();
  const doctorName = await getDoctorSession();

  let allowed = false;
  let displayName = "";
  let backHref = "/";

  if (patientSession) {
    const patient = await getPatient(patientSession.$id);
    if (patient && (appointment as any).userId === patientSession.$id) {
      allowed = true;
      displayName = (patient as any).name ?? "Pacient";
      backHref = `/patients/${patientSession.$id}/dashboard`;
    }
  }

  if (!allowed && doctorName) {
    if ((appointment as any).primaryPhysician === doctorName) {
      allowed = true;
      displayName = doctorName;
      backHref = "/doctor";
    }
  }

  if (!allowed) {
    redirect("/");
  }

  const roomName = `ehealth-${appointmentId}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-800">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Videoconferință – Consultație
              </CardTitle>
              <Link
                href={backHref}
                prefetch={false}
                className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                ← Înapoi
              </Link>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sală: <span className="font-mono text-slate-700 dark:text-slate-300">{roomName}</span>
              {displayName && (
                <>
                  {" · "}
                  Te conectezi ca <span className="font-medium">{displayName}</span>
                </>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <VideoCallRoom roomName={roomName} displayName={displayName} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
