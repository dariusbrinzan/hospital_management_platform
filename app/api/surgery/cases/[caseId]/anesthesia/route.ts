import { NextRequest, NextResponse } from "next/server";

import { getAdminSession, getDoctorSession } from "@/lib/actions/auth.actions";
import { anesthesiaConsultationHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const [doctorSession, adminSession] = await Promise.all([getDoctorSession(), getAdminSession()]);
    if (!doctorSession && !adminSession) {
      return NextResponse.json({ error: "Autentificare necesară." }, { status: 401 });
    }

    const body = await request.json();
    const consult = anesthesiaConsultationHelpers.upsert({
      surgeryCaseId: params.caseId,
      anesthesiologistName: body.anesthesiologistName,
      consultDate: body.consultDate,
      asaRisk: body.asaRisk,
      airwayAssessment: body.airwayAssessment,
      fastingConfirmed: Boolean(body.fastingConfirmed),
      recommendations: body.recommendations,
      clearanceStatus: body.clearanceStatus || "pending",
    });

    return NextResponse.json(consult);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut salva consultul ATI." },
      { status: 400 }
    );
  }
}
