import { redirect } from "next/navigation";

import { getDoctorSession, getAdminSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { AdminLayoutSidebar } from "@/components/AdminLayoutSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctorSession = await getDoctorSession();
  const adminSession = await getAdminSession();

  if (!doctorSession && !adminSession) {
    redirect("/?admin=true");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminLayoutSidebar
        isDoctorView={!!doctorSession}
        doctorName={doctorSession ?? undefined}
        doctors={Doctors}
      />
      <main className="min-w-0 flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
