import { NextRequest, NextResponse } from "next/server";
import { pharmacyOrderHelpers } from "@/lib/db-helpers";
import { requireAdmin } from "@/lib/actions/auth.actions";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const order = pharmacyOrderHelpers.submit(params.id);
    if (!order) return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
