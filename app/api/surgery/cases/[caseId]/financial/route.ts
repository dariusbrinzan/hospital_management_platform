import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { surgeryFinancialHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate actualiza decontarea." }, { status: 401 });
    }

    const body = await request.json();
    const financialCase = surgeryFinancialHelpers.upsert({
      surgeryCaseId: params.caseId,
      coverageType: body.coverageType || "cass_full",
      estimatedTotal: Number(body.estimatedTotal) || 0,
      cassCoveredAmount: Number(body.cassCoveredAmount) || 0,
      patientAmount: Number(body.patientAmount) || 0,
      paymentStatus: body.paymentStatus || "pending",
      billingNotes: body.billingNotes,
    });

    return NextResponse.json(financialCase);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut salva situația financiară." },
      { status: 400 }
    );
  }
}
