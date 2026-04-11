import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { hospitalizationReportingBatchHelpers } from "@/lib/db-helpers";

export async function POST(
  _request: Request,
  { params }: { params: { batchId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate transmite batch-uri de raportare." }, { status: 401 });
    }

    const batch = hospitalizationReportingBatchHelpers.submit(params.batchId);
    return NextResponse.json(batch);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut transmite batch-ul de raportare." },
      { status: 400 }
    );
  }
}
