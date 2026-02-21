import { NextRequest, NextResponse } from "next/server";
import { labResultHelpers, patientHelpers, appointmentHelpers } from "@/lib/db-helpers";
import { generateAnalysisPDF } from "@/lib/pdf-generator";
import { requireAuth } from "@/lib/actions/auth.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { groupId } = params;
    // UUID-uri conțin "-", deci nu folosim split("-",2): luăm tot după primul "-"
    const firstDash = groupId.indexOf("-");
    const type = firstDash === -1 ? groupId : groupId.slice(0, firstDash);
    const id = firstDash === -1 ? "" : groupId.slice(firstDash + 1);

    let analyses: any[] = [];
    let appointmentId: string | undefined;
    let date: Date | string = new Date();
    let physicianName: string | undefined;

    const patient = patientHelpers.getByUserId(session.$id);
    if (!patient) {
      return NextResponse.json({ error: "Pacientul nu a fost găsit" }, { status: 404 });
    }

    if (type === "appointment" && id) {
      appointmentId = id;
      const allLabResults = labResultHelpers.getByPatientId(patient.$id);
      analyses = allLabResults.filter((lab: any) => lab.appointmentId === appointmentId);

      const appointment = appointmentHelpers.getById(appointmentId);
      if (appointment) {
        if (appointment.userId !== session.$id) {
          return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
        }
        date = appointment.schedule;
        physicianName = appointment.primaryPhysician;
        if (appointment.analysisResults) {
          try {
            const parsedResults = JSON.parse(appointment.analysisResults);
            if (Array.isArray(parsedResults)) {
              parsedResults.forEach((result: any) => {
                analyses.push({
                  testName: result.testName,
                  testCategory: result.testCategory,
                  resultValue: result.value,
                  unit: result.unit,
                  referenceRange: result.referenceRange,
                  notes: result.notes,
                  status: result.status,
                  performedDate: appointment.schedule,
                });
              });
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } else if (type === "date" && id) {
      date = decodeURIComponent(id);
      const allLabResults = labResultHelpers.getByPatientId(patient.$id);
      analyses = allLabResults.filter((lab: any) => {
        const labDate = new Date(lab.performedDate).toISOString().split("T")[0];
        const targetDate = new Date(date).toISOString().split("T")[0];
        return labDate === targetDate;
      });
    } else {
      return NextResponse.json({ error: "Format invalid pentru groupId" }, { status: 400 });
    }

    if (analyses.length === 0) {
      return NextResponse.json({ error: "Nu există analize pentru acest grup" }, { status: 404 });
    }

    const pdfBuffer = generateAnalysisPDF({
      patient: {
        name: patient.name,
        birthDate: patient.birthDate,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
      },
      analyses: analyses.map((a: any) => ({
        testName: a.testName || a.test_name,
        testCategory: a.testCategory || a.test_category,
        resultValue: a.resultValue ?? a.result_value,
        unit: a.unit,
        referenceRange: a.referenceRange || a.reference_range,
        notes: a.notes,
        status: a.status,
        performedDate: a.performedDate || a.performed_date || date,
      })),
      appointmentId,
      date,
      physicianName,
    });

    // Returnează PDF-ul
    const filename = appointmentId 
      ? `analize-programare-${appointmentId.slice(-6)}.pdf`
      : `analize-${new Date(date).toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating analysis PDF:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la generarea PDF-ului" },
      { status: 500 }
    );
  }
}
