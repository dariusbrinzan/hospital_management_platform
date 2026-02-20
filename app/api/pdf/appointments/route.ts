import { NextRequest, NextResponse } from "next/server";
import { appointmentHelpers } from "@/lib/db-helpers";
import { generateAppointmentsListPDF } from "@/lib/pdf-generator";
import { formatDateTime } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const days = parseInt(searchParams.get("days") || "30", 10);

    const all = appointmentHelpers.getAll() as any[];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - Math.min(Math.max(days, 1), 365));
    const filtered = all.filter((a) => {
      const t = new Date(a.schedule).getTime();
      if (t < start.getTime() || t > end.getTime()) return false;
      if (patientId && a.patientId !== patientId) return false;
      return true;
    });
    const sorted = filtered.sort(
      (a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
    );
    const appointments = sorted.map((a) => ({
      schedule: a.schedule,
      primaryPhysician: a.primaryPhysician,
      reason: a.reason,
      status: a.status,
      patientName: (a as any).patient_name,
    }));

    const title = patientId
      ? `Listă programări pacient (ultimele ${days} zile)`
      : `Listă programări (ultimele ${days} zile)`;
    const buffer = generateAppointmentsListPDF({
      title,
      generatedAt: formatDateTime(new Date().toISOString()).dateTime,
      appointments,
    });
    const fileName = `programari-${patientId ? "pacient" : "toate"}-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating appointments PDF:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la generarea PDF" },
      { status: 500 }
    );
  }
}
