import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { Doctors } from "@/constants";
import { AdminLayoutSidebar } from "@/components/AdminLayoutSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getAdminSession())) {
    redirect("/?admin=true");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminLayoutSidebar doctors={Doctors} />
      <main className="min-w-0 flex-1 flex flex-col">{children}</main>
    </div>
  );
}
