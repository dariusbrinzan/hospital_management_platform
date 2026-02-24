import { redirect } from "next/navigation";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { DoctorLayoutClient } from "@/components/DoctorLayoutClient";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctorName = await getDoctorSession();

  if (!doctorName) {
    redirect("/?doctor=true");
  }

  return <DoctorLayoutClient doctorName={doctorName}>{children}</DoctorLayoutClient>;
}
