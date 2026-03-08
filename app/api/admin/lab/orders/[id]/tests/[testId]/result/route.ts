import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { labOrderTestHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { resultValue, resultUnit, referenceRange, notes } = body as { resultValue: string; resultUnit?: string; referenceRange?: string; notes?: string };
    if (resultValue == null || resultValue === "") {
      return NextResponse.json({ error: "resultValue este obligatoriu." }, { status: 400 });
    }
    labOrderTestHelpers.setResult(params.testId, { resultValue: String(resultValue), resultUnit, referenceRange, notes });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
