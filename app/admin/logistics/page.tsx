import { redirect } from "next/navigation";

import { getDoctorSession, requireAdmin } from "@/lib/actions/auth.actions";
import {
  consumableRequestsHelpers,
  equipmentHelpers,
  internalTransportHelpers,
  hospitalRoomHelpers,
} from "@/lib/db-helpers";
import { AdminPageLayout } from "@/components/AdminPageLayout";
import { LogisticsDashboard } from "@/components/LogisticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminLogisticsPage() {
  await requireAdmin();
  if (await getDoctorSession()) redirect("/admin");

  const [requests, equipment, transports, rooms] = await Promise.all([
    Promise.resolve(consumableRequestsHelpers.getAll()),
    Promise.resolve(equipmentHelpers.getAll()),
    Promise.resolve(internalTransportHelpers.getAll()),
    Promise.resolve(hospitalRoomHelpers.getAllRooms()),
  ]);

  return (
    <AdminPageLayout
      title="Operațiuni zilnice și logistică"
      description="Cereri consumabile, inventar echipament, transport intern, curățenie și dezinfecție"
    >
      <LogisticsDashboard
        consumableRequests={requests}
        equipment={equipment}
        transportRequests={transports}
        rooms={rooms}
      />
    </AdminPageLayout>
  );
}
