import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { hospitalizationReportingBatchHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate genera batch-uri de raportare." }, { status: 401 });
    }

    const body = await request.json();
    const batch = hospitalizationReportingBatchHelpers.create(Number(body.month), Number(body.year));
    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut genera batch-ul de raportare." },
      { status: 400 }
    );
  }
}
