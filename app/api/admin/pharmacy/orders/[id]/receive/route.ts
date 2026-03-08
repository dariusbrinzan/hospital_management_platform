import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { pharmacyOrderHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const { lineReceipts } = body as { lineReceipts?: { lineId: string; receivedQuantity: number; batchNumber?: string; expirationDate?: string }[] };
    const lineReceivedQuantities = lineReceipts?.map((l) => ({ lineId: l.lineId, receivedQuantity: l.receivedQuantity }));
    const received = pharmacyOrderHelpers.receive(params.id, "Admin", lineReceivedQuantities);
    if (!received) return NextResponse.json({ error: "Comandă negăsită sau nu este aprobată" }, { status: 400 });
    return NextResponse.json(received);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
