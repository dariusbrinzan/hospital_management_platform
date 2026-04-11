import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { hospitalizationSheetHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate crea foi de spitalizare." }, { status: 401 });
    }

    const body = await request.json();
    const sheet = hospitalizationSheetHelpers.create({
      patientId: body.patientId,
      admissionId: body.admissionId || null,
      appointmentId: body.appointmentId || null,
      hospitalizationType: body.hospitalizationType || "continuous",
      admissionType: body.admissionType || "elective",
      insuranceStatus: body.insuranceStatus || "insured",
      cnasPayerType: body.cnasPayerType || "cass",
      admissionDate: body.admissionDate,
      dischargeDate: body.dischargeDate,
      admissionSection: body.admissionSection,
      dischargeSection: body.dischargeSection,
      attendingPhysician: body.attendingPhysician,
      admissionDiagnosis: body.admissionDiagnosis,
      mainDiagnosis: body.mainDiagnosis,
      dischargeStatus: body.dischargeStatus,
      dischargeType: body.dischargeType,
      expectedReimbursement: Number(body.expectedReimbursement) || 0,
      notes: body.notes,
      diagnoses: Array.isArray(body.diagnoses) ? body.diagnoses : [],
      procedures: Array.isArray(body.procedures) ? body.procedures : [],
    });

    return NextResponse.json(sheet, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut crea foaia de spitalizare." },
      { status: 400 }
    );
  }
}
