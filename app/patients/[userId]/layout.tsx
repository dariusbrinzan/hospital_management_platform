import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { PatientLayoutClient } from "@/components/PatientLayoutClient";

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const session = await requireAuth();
  const { userId } = await params;

  if (session.$id !== userId) {
    redirect(`/patients/${session.$id}/dashboard`);
  }

  const patient = await getPatient(userId);

  return (
    <PatientLayoutClient
      userId={userId}
      patientName={patient?.name ?? "Completare profil"}
    >
      {children}
    </PatientLayoutClient>
  );
}
