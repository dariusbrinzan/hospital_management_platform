import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { pharmacyOrderHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const order = pharmacyOrderHelpers.getById(params.id);
    if (!order) return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 });
    if (order.status !== "submitted") return NextResponse.json({ error: "Doar comenzile trimise pot fi aprobate" }, { status: 400 });
    const approved = pharmacyOrderHelpers.approve(params.id, (session as any).name || "Admin");
    return NextResponse.json(approved);
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
