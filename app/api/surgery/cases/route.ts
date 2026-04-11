import { NextRequest, NextResponse } from "next/server";

import { getAdminSession, getDoctorSession } from "@/lib/actions/auth.actions";
import { surgeryCaseHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const [doctorSession, adminSession] = await Promise.all([getDoctorSession(), getAdminSession()]);
    if (!doctorSession && !adminSession) {
      return NextResponse.json({ error: "Autentificare necesară." }, { status: 401 });
    }

    const body = await request.json();
    const created = surgeryCaseHelpers.create({
      patientId: body.patientId,
      appointmentId: body.appointmentId || null,
      requestedByDoctor: body.requestedByDoctor || doctorSession || "Administrator",
      surgicalSpecialty: body.surgicalSpecialty,
      procedureName: body.procedureName,
      diagnosis: body.diagnosis,
      urgency: body.urgency || "elective",
      estimatedDurationMinutes: body.estimatedDurationMinutes,
      preferredDate: body.preferredDate || null,
      requiresICUBed: Boolean(body.requiresICUBed),
      implantNeeded: Boolean(body.implantNeeded),
      clinicalNotes: body.clinicalNotes,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut crea cazul operator." },
      { status: 400 }
    );
  }
}
