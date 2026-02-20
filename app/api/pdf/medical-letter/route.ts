import { NextRequest, NextResponse } from "next/server";
import { patientHelpers } from "@/lib/db-helpers";
import { generateMedicalLetterPDF } from "@/lib/pdf-generator";
import { Doctors } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, doctorName, date, title, content } = body as {
      patientId: string;
      doctorName: string;
      date: string;
      title: string;
      content: string;
    };
    if (!patientId || !title || !content) {
      return NextResponse.json(
        { error: "Lipsesc patientId, title sau content." },
        { status: 400 }
      );
    }
    const patient = patientHelpers.getById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Pacient negăsit." }, { status: 404 });
    }
    const doctor = Doctors.find((d: any) => d.name === doctorName);
    const pdfBuffer = generateMedicalLetterPDF({
      patient: {
        name: patient.name,
        birthDate: (patient as any).birthDate,
        identificationNumber: (patient as any).identificationNumber,
      },
      doctor: { name: doctorName, specialty: doctor?.specialty },
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
