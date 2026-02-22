"use server";

import { getCurrentSession, getDoctorSession, getAdminSession } from "@/lib/actions/auth.actions";
import { problemReportsHelpers } from "@/lib/db-helpers";
import { userHelpers } from "@/lib/db-helpers";
import { redirect } from "next/navigation";

/** Raportare problemă către administrator. Doar pacienți (nu medici). */
export async function submitProblemReport(form: {
  subject: string;
  description: string;
}): Promise<{ success?: boolean; error?: string }> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/");
  }
  if (await getDoctorSession()) {
    return { error: "Raportarea este disponibilă doar pentru pacienți." };
  }
  const subject = String(form.subject ?? "").trim();
  const description = String(form.description ?? "").trim();
  if (!subject || !description) {
    return { error: "Completați subiectul și descrierea." };
  }
  const user = userHelpers.getById(session.$id);
  if (!user) return { error: "Sesiune invalidă." };
  problemReportsHelpers.create({
    userId: session.$id,
    reporterName: user.name,
    reporterEmail: user.email,
    subject,
    description,
  });
  return { success: true };
}

/** Actualizare status/note raport (doar administrator). */
export async function updateProblemReportStatus(
  reportId: string,
  status: string,
  adminNotes?: string | null
): Promise<{ success?: boolean; error?: string }> {
  if (!(await getAdminSession())) {
    return { error: "Neautorizat." };
  }
  const allowed = ["new", "in_progress", "resolved"];
  if (!allowed.includes(status)) {
    return { error: "Status invalid." };
  }
  problemReportsHelpers.updateStatus(reportId, status, adminNotes);
  return { success: true };
}
