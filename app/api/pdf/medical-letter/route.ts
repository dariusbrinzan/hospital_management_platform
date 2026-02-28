import { NextRequest, NextResponse } from "next/server";
import { patientHelpers } from "@/lib/db-helpers";
import { generateMedicalLetterPDF, generateSickLeavePDF } from "@/lib/pdf-generator";
import { Doctors } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = (body.type as string) || "scrisoare";
    const { patientId, doctorName, date, title, content, startDate, endDate, reason, recommendations } = body as {
      patientId: string;
      doctorName: string;
      date?: string;
      title?: string;
      content?: string;
      startDate?: string;
      endDate?: string;
      reason?: string;
      recommendations?: string;
    };
    if (!patientId) {
      return NextResponse.json({ error: "Lipseste patientId." }, { status: 400 });
    }
    const patient = patientHelpers.getById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Pacient negăsit." }, { status: 404 });
    }
    const doctor = Doctors.find((d: any) => d.name === doctorName);
    const patientData = {
      name: patient.name,
      birthDate: (patient as any).birthDate,
      identificationNumber: (patient as any).identificationNumber,
    };
    const doctorData = { name: doctorName, specialty: doctor?.specialty };

    if (type === "concediu") {
      if (!startDate || !endDate || !reason) {
        return NextResponse.json(
          { error: "Pentru concediu medical sunt obligatorii: startDate, endDate, reason." },
          { status: 400 }
        );
      }
      const pdfBuffer = generateSickLeavePDF({
        patient: patientData,
        doctor: doctorData,
        date: date || new Date().toISOString(),
        startDate,
        endDate,
        reason,
        recommendations: recommendations || undefined,
      });
      const fileName = `concediu-medical-${patient.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Lipsesc title sau content pentru scrisoare medicală." },
        { status: 400 }
      );
    }
    const pdfBuffer = generateMedicalLetterPDF({
      patient: patientData,
      doctor: doctorData,
      date: date || new Date().toISOString(),
      title: title || "Scrisoare medicală",
      body: content,
    });
    const fileName = `scrisoare-medicala-${patient.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating medical letter PDF:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la generarea PDF" },
      { status: 500 }
    );
  }
}
