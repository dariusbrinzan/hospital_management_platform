import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { pharmacyOrderHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const orders = pharmacyOrderHelpers.getAll(status);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { requestedBy, notes, lines } = body as { requestedBy: string; notes?: string; lines: { medicationId: string; quantity: number; unitPrice?: number }[] };
    if (!requestedBy || !lines?.length) {
      return NextResponse.json({ error: "requestedBy și lines sunt obligatorii." }, { status: 400 });
    }
    const order = pharmacyOrderHelpers.create({
      requestedBy: requestedBy || (session as any).name || "Admin",
      notes,
      lines: lines.map((l: any) => ({ medicationId: l.medicationId, quantity: Number(l.quantity) || 0, unitPrice: l.unitPrice })),
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
