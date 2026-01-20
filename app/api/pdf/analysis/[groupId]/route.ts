import { NextRequest, NextResponse } from "next/server";
import { labResultHelpers, patientHelpers } from "@/lib/db-helpers";
import { generateAnalysisPDF } from "@/lib/pdf-generator";
import { requireAuth } from "@/lib/actions/auth.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    // Verifică autentificarea
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { groupId } = params;
    
    // Parsează groupId pentru a obține appointmentId sau date
    // Format: "appointment-{appointmentId}" sau "date-{date}"
    const [type, id] = groupId.split("-", 2);
    
    let analyses: any[] = [];
    let appointmentId: string | undefined;
    let date: Date | string = new Date();

    // Obține informațiile pacientului o singură dată
    const patient = patientHelpers.getByUserId(session.$id);
    if (!patient) {
      return NextResponse.json({ error: "Pacientul nu a fost găsit" }, { status: 404 });
    }

    if (type === "appointment" && id) {
      // Obține analizele pentru o programare specifică
      appointmentId = id;
      const allLabResults = labResultHelpers.getByPatientId(patient.$id);
      analyses = allLabResults.filter((lab: any) => lab.appointmentId === appointmentId);
      
      // Obține și analizele din appointments.analysisResults
      const { appointmentHelpers } = require("@/lib/db-helpers");
      const appointment = appointmentHelpers.getById(appointmentId);
      if (appointment && appointment.analysisResults) {
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
                performedDate: appointment.schedule,
              });
            });
          }
        } catch (e) {
          // Ignoră erorile de parsing
        }
      }
      
      if (appointment) {
        date = appointment.schedule;
      }
    } else if (type === "date" && id) {
      // Obține analizele pentru o dată specifică
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

    // Generează PDF
    const pdfBuffer = generateAnalysisPDF({
      patient: {
        name: patient.name,
        birthDate: patient.birthDate,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
      },
      analyses: analyses.map((analysis: any) => ({
        testName: analysis.testName || analysis.test_name,
        testCategory: analysis.testCategory || analysis.test_category,
        resultValue: analysis.resultValue || analysis.result_value,
        unit: analysis.unit,
        referenceRange: analysis.referenceRange || analysis.reference_range,
        notes: analysis.notes,
        performedDate: analysis.performedDate || analysis.performed_date || date,
      })),
      appointmentId,
      date,
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
