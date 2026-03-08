import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { medicationStockBatchHelpers, medicationStockHelpers } from "@/lib/db-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { stockId: string } }
) {
  try {
    await requireAdmin();
    const stock = medicationStockHelpers.getById(params.stockId);
    if (!stock) return NextResponse.json({ error: "Stoc negăsit" }, { status: 404 });
    const batches = medicationStockBatchHelpers.getByStockId(params.stockId);
    return NextResponse.json(batches);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stockId: string } }
) {
  try {
    await requireAdmin();
    const stock = medicationStockHelpers.getById(params.stockId);
    if (!stock) return NextResponse.json({ error: "Stoc negăsit" }, { status: 404 });
    const body = await request.json();
    const { batchNumber, expirationDate, quantity } = body as { batchNumber: string; expirationDate: string; quantity: number };
    if (!batchNumber || !expirationDate || quantity == null || quantity < 1) {
      return NextResponse.json({ error: "batchNumber, expirationDate și quantity sunt obligatorii." }, { status: 400 });
    }
    const batch = medicationStockBatchHelpers.create({
      stockId: params.stockId,
      batchNumber,
      expirationDate,
      quantity,
    });
    return NextResponse.json(batch);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
