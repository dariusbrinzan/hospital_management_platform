import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { AdminLayoutClient } from "@/components/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getAdminSession())) {
    redirect("/admin-login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
