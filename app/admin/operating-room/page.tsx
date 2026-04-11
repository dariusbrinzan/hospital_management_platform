import { AdminOperatingRoomManager } from "@/components/AdminOperatingRoomManager";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { requireAdmin } from "@/lib/actions/auth.actions";
import {
  anesthesiaConsultationHelpers,
  operatingRoomHelpers,
  surgeryBookingHelpers,
  surgeryCaseHelpers,
  surgeryFinancialHelpers,
} from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export default async function AdminOperatingRoomPage() {
  await requireAdmin();

  const rooms = operatingRoomHelpers.getAll();
  const surgeryCases = surgeryCaseHelpers.getAll().map((caseItem) => ({
    caseItem,
    anesthesiaConsult: anesthesiaConsultationHelpers.getBySurgeryCaseId(caseItem.$id),
    booking: surgeryBookingHelpers.getBySurgeryCaseId(caseItem.$id),
    financial: surgeryFinancialHelpers.getBySurgeryCaseId(caseItem.$id),
  }));
  const upcomingBookings = surgeryBookingHelpers.getUpcoming(20);

  return (
    <AdminPageLayout
      title="Bloc operator"
      description="Gestionare săli operatorii, consulturi ATI, programări și decontare chirurgicală."
    >
      <AdminOperatingRoomManager
        rooms={rooms}
        surgeryCases={surgeryCases}
        upcomingBookings={upcomingBookings}
      />
    </AdminPageLayout>
  );
}
