import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { medicationRequestHelpers } from "@/lib/db-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const req = medicationRequestHelpers.getById(params.id);
    if (!req) return NextResponse.json({ error: "Cerere negăsită" }, { status: 404 });
    return NextResponse.json(req);
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const adminName = (session as any)?.name ?? "Admin";
    const req = medicationRequestHelpers.getById(params.id);
    if (!req) return NextResponse.json({ error: "Cerere negăsită" }, { status: 404 });

    const body = await request.json();
    const { status, rejectionReason, decontareType, notes } = body as {
      status: string;
      rejectionReason?: string;
      decontareType?: string;
      notes?: string;
    };

    if (!status) {
      return NextResponse.json({ error: "status este obligatoriu." }, { status: 400 });
    }

    const allowed = ["approved", "rejected", "dispensed", "decontat"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 });
    }

    if (status === "approved") {
      medicationRequestHelpers.updateStatus(params.id, { status: "approved", approvedBy: adminName });
    } else if (status === "rejected") {
      medicationRequestHelpers.updateStatus(params.id, { status: "rejected", rejectedBy: adminName, rejectionReason: rejectionReason ?? undefined, notes });
    } else if (status === "dispensed") {
      medicationRequestHelpers.updateStatus(params.id, { status: "dispensed", dispensedBy: adminName, notes });
    } else if (status === "decontat") {
      medicationRequestHelpers.updateStatus(params.id, { status: "decontat", decontatBy: adminName, decontareType: decontareType || "full", notes });
    }

    const updated = medicationRequestHelpers.getById(params.id);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
