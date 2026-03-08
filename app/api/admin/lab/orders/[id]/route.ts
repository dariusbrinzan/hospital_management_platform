import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { labOrderHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const order = labOrderHelpers.getById(params.id);
    if (!order) return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
