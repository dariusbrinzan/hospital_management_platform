import { redirect } from "next/navigation";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { DoctorLayoutSidebar } from "@/components/DoctorLayoutSidebar";
import { DoctorNotificationsDropdown } from "@/components/DoctorNotificationsDropdown";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctorName = await getDoctorSession();

  if (!doctorName) {
    redirect("/?doctor=true");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorLayoutSidebar doctorName={doctorName} />
      <main className="min-w-0 flex-1 flex flex-col">
        <div className="sticky top-0 z-10 flex h-12 flex-shrink-0 items-center justify-end border-b border-dark-200 bg-white px-4 sm:px-6">
          <DoctorNotificationsDropdown />
        </div>
        {children}
      </main>
    </div>
  );
}
