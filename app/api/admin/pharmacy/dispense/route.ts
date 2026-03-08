import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { pharmacyDispensingHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { prescriptionId, patientId, medicationId, stockId, batchId, quantity, notes } = body as {
      prescriptionId: string;
      patientId: string;
      medicationId: string;
      stockId?: string;
      batchId?: string;
      quantity: number;
      notes?: string;
    };
    if (!prescriptionId || !patientId || !medicationId || quantity == null || quantity < 1) {
      return NextResponse.json({ error: "prescriptionId, patientId, medicationId și quantity (>=1) sunt obligatorii." }, { status: 400 });
    }
    const dispensed = pharmacyDispensingHelpers.create({
      prescriptionId,
      patientId,
      medicationId,
      stockId,
      batchId,
      quantity: Number(quantity),
      dispensedBy: (session as any).name || "Admin",
      notes,
    });
    return NextResponse.json(dispensed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare la dispensare" }, { status: 500 });
  }
}
