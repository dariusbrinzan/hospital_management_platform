import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { PatientMedicationRequestsView } from "@/components/PatientMedicationRequestsView";

export default async function PatientMedicationRequestsPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  const session = await requireAuth();
  if (!session || session.$id !== userId) redirect("/");
  const patient = await getPatient(userId);
  if (!patient) redirect("/");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PatientMedicationRequestsView userId={userId} patientId={patient.$id} />
    </div>
  );
}
