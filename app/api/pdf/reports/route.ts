import { NextRequest, NextResponse } from "next/server";
import { getReportsData } from "@/lib/actions/reports.actions";
import { generateReportsPDF } from "@/lib/pdf-generator";
import { formatDateTime } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const period = (request.nextUrl.searchParams.get("period") as "7" | "30" | "90") || "30";
    const data = await getReportsData(period);
    const pdfData = {
      period,
      generatedAt: formatDateTime(new Date().toISOString()).dateTime,
      appointmentsByDay: data.appointmentsByDay,
      appointmentsByDoctor: data.appointmentsByDoctor,
      emergenciesByDay: data.emergenciesByDay,
      imagingByDay: data.imagingByDay,
    };
    const buffer = generateReportsPDF(pdfData);
    const fileName = `rapoarte-${period}-zile-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating reports PDF:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la generarea PDF" },
      { status: 500 }
    );
  }
}
