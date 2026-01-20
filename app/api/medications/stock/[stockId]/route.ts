import { NextRequest, NextResponse } from "next/server";
import { medicationStockHelpers, medicationTransactionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { stockId: string } }
) {
  try {
    const stock = medicationStockHelpers.getById(params.stockId);
    if (!stock) {
      return NextResponse.json({ error: "Stocul nu a fost găsit" }, { status: 404 });
    }
    return NextResponse.json(stock);
  } catch (error: any) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea stocului" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { stockId: string } }
) {
  try {
    const body = await request.json();
    const { quantity, reservedQuantity, minimumStockLevel, maximumStockLevel } = body;

    const stock = medicationStockHelpers.getById(params.stockId);
    if (!stock) {
      return NextResponse.json({ error: "Stocul nu a fost găsit" }, { status: 404 });
    }

    if (quantity !== undefined) {
      medicationStockHelpers.updateQuantity(
        params.stockId,
        quantity,
        reservedQuantity
      );
    }

    if (minimumStockLevel !== undefined || maximumStockLevel !== undefined) {
      const now = new Date().toISOString();
      const db = (await import("@/lib/db")).default;
      db.prepare(`
        UPDATE medication_stock 
        SET minimumStockLevel = COALESCE(?, minimumStockLevel),
            maximumStockLevel = COALESCE(?, maximumStockLevel),
            updatedAt = ?
        WHERE id = ?
      `).run(
        minimumStockLevel || null,
        maximumStockLevel || null,
        now,
        params.stockId
      );
    }

    const updated = medicationStockHelpers.getById(params.stockId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea stocului" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stockId: string } }
) {
  try {
    const body = await request.json();
    const { action, quantity, performedBy, reason, notes } = body;

    const stock = medicationStockHelpers.getById(params.stockId);
    if (!stock) {
      return NextResponse.json({ error: "Stocul nu a fost găsit" }, { status: 404 });
    }

    if (action === "restock") {
      medicationStockHelpers.restock(params.stockId, quantity);
      
      // Creează tranzacție
      medicationTransactionHelpers.create({
        medicationId: stock.medicationId,
        stockId: params.stockId,
        transactionType: "restock",
        quantity: quantity,
        reason: reason || "Reaprovizionare manuală",
        performedBy: performedBy || "System",
        notes: notes,
      });
    } else if (action === "consume") {
      medicationStockHelpers.consumeQuantity(params.stockId, quantity);
      
      // Creează tranzacție
      medicationTransactionHelpers.create({
        medicationId: stock.medicationId,
        stockId: params.stockId,
        transactionType: "usage",
        quantity: -quantity,
        reason: reason || "Utilizare",
        performedBy: performedBy || "System",
        notes: notes,
      });
    }

    const updated = medicationStockHelpers.getById(params.stockId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error processing stock action:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la procesarea acțiunii" },
      { status: 500 }
    );
  }
}
